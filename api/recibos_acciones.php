<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD']==='OPTIONS'){ http_response_code(200); exit; }
require_once 'config.php';
require_once 'auth.php';
$u = validar_jwt();
if(!in_array($u->rol,['admin','superusuario','root'])){ http_response_code(403); echo json_encode(['error'=>'No autorizado']); exit; }
if($_SERVER['REQUEST_METHOD']!=='POST'){ http_response_code(405); echo json_encode(['error'=>'Método no soportado']); exit; }
$in = json_decode(file_get_contents('php://input'), true) ?? [];
$accion = $in['accion'] ?? '';
$conn = get_db_connection();

function json_fail($code,$msg,$extra=[]) { http_response_code($code); echo json_encode(array_merge(['error'=>$msg],$extra)); exit; }

if($accion==='anular_recibo'){
  $recibo_id = intval($in['recibo_id'] ?? 0);
  $motivo = trim($in['motivo'] ?? '');
  if(!$recibo_id) json_fail(400,'recibo_id requerido');
  $stmt=$conn->prepare('SELECT id, estado, periodo_id FROM recibos WHERE id=? LIMIT 1');
  $stmt->bind_param('i',$recibo_id); $stmt->execute(); $rec=$stmt->get_result()->fetch_assoc();
  if(!$rec) json_fail(404,'Recibo no encontrado');
  if($rec['estado']==='anulado') json_fail(409,'Recibo ya anulado');
  if(in_array($rec['estado'],['pagado_total'])) json_fail(409,'Recibo pagado total no puede anularse');
  $stmtU=$conn->prepare("UPDATE recibos SET estado='anulado', anulado_at=NOW(), anulado_por=?, motivo_anulacion=? WHERE id=?");
  $stmtU->bind_param('isi',$u->id,$motivo,$recibo_id); if(!$stmtU->execute()) json_fail(500,'No se pudo anular');
  echo json_encode(['ok'=>true,'recibo_id'=>$recibo_id,'estado'=>'anulado']); exit;
}

if($accion==='registrar_pago'){
  $recibo_id = intval($in['recibo_id'] ?? 0);
  $monto = isset($in['monto_usd']) ? (float)$in['monto_usd'] : null;
  $referencia = isset($in['referencia']) ? substr(trim($in['referencia']),0,120) : null;
  $metodo = $in['metodo'] ?? null; // transferencia, efectivo, pago_movil, tarjeta, otro
  $obs = isset($in['observacion']) ? substr(trim($in['observacion']),0,255) : null;
  if(!$recibo_id || $monto===null || $monto<=0) json_fail(400,'recibo_id y monto_usd > 0 requeridos');
  $stmt=$conn->prepare('SELECT id, periodo_id, organizacion_id, monto_total_usd, estado FROM recibos WHERE id=? LIMIT 1');
  $stmt->bind_param('i',$recibo_id); $stmt->execute(); $rec=$stmt->get_result()->fetch_assoc();
  if(!$rec) json_fail(404,'Recibo no encontrado');
  if($rec['estado']==='anulado') json_fail(409,'Recibo anulado');
  if($rec['estado']==='pagado_total') json_fail(409,'Recibo ya pagado');
  // Monto ya pagado
  $p=$conn->prepare('SELECT COALESCE(SUM(monto_usd),0) pagado FROM pagos_recibos WHERE recibo_id=? AND anulado=0');
  $p->bind_param('i',$recibo_id); $p->execute(); $pagado=$p->get_result()->fetch_assoc()['pagado'];
  $restante = (float)$rec['monto_total_usd'] - (float)$pagado;
  if($monto > $restante + 0.0001) json_fail(422,'Monto excede saldo',['saldo_restante'=>$restante]);
  // Insert pago
  $ins=$conn->prepare('INSERT INTO pagos_recibos (recibo_id, periodo_id, organizacion_id, monto_usd, referencia, metodo, observacion, creado_por) VALUES (?,?,?,?,?,?,?,?)');
  $ins->bind_param('iiidsssi',$recibo_id,$rec['periodo_id'],$rec['organizacion_id'],$monto,$referencia,$metodo,$obs,$u->id);
  if(!$ins->execute()) json_fail(500,'No se pudo registrar pago');
  // Recalcular estado
  $p2=$conn->prepare('SELECT COALESCE(SUM(monto_usd),0) pagado FROM pagos_recibos WHERE recibo_id=? AND anulado=0');
  $p2->bind_param('i',$recibo_id); $p2->execute(); $pagado2=$p2->get_result()->fetch_assoc()['pagado'];
  $nuevoEstado = ($pagado2 + 0.0001) >= (float)$rec['monto_total_usd'] ? 'pagado_total' : 'pagado_parcial';
  $up=$conn->prepare('UPDATE recibos SET estado=?, pagado_total_at=CASE WHEN ?=\'pagado_total\' THEN NOW() ELSE pagado_total_at END WHERE id=?');
  $up->bind_param('ssi',$nuevoEstado,$nuevoEstado,$recibo_id); $up->execute();
  echo json_encode(['ok'=>true,'recibo_id'=>$recibo_id,'estado'=>$nuevoEstado,'pagado'=>$pagado2]); exit;
}

if($accion==='anular_pago'){
  $pago_id = intval($in['pago_id'] ?? 0);
  $motivo = trim($in['motivo'] ?? '');
  if(!$pago_id) json_fail(400,'pago_id requerido');
  $pg=$conn->prepare('SELECT p.id, p.recibo_id, p.monto_usd, p.anulado, r.monto_total_usd FROM pagos_recibos p JOIN recibos r ON r.id=p.recibo_id WHERE p.id=?');
  $pg->bind_param('i',$pago_id); $pg->execute(); $row=$pg->get_result()->fetch_assoc();
  if(!$row) json_fail(404,'Pago no encontrado');
  if($row['anulado']) json_fail(409,'Pago ya anulado');
  $up=$conn->prepare("UPDATE pagos_recibos SET anulado=1, anulado_at=NOW(), anulado_por=?, observacion=CONCAT(COALESCE(observacion,''), ' | ANULADO: ', ?) WHERE id=?");
  $up->bind_param('isi',$u->id,$motivo,$pago_id); if(!$up->execute()) json_fail(500,'No se pudo anular pago');
  // Recalcular estado recibo
  $recibo_id = $row['recibo_id'];
  $p2=$conn->prepare('SELECT COALESCE(SUM(monto_usd),0) pagado FROM pagos_recibos WHERE recibo_id=? AND anulado=0');
  $p2->bind_param('i',$recibo_id); $p2->execute(); $pagado2=$p2->get_result()->fetch_assoc()['pagado'];
  $recTot=$row['monto_total_usd'];
  $nuevoEstado = ($pagado2 + 0.0001) >= $recTot ? 'pagado_total' : ($pagado2>0 ? 'pagado_parcial':'emitido');
  $up2=$conn->prepare('UPDATE recibos SET estado=?, pagado_total_at=CASE WHEN ?=\'pagado_total\' THEN NOW() ELSE NULL END WHERE id=?');
  $up2->bind_param('ssi',$nuevoEstado,$nuevoEstado,$recibo_id); $up2->execute();
  echo json_encode(['ok'=>true,'pago_id'=>$pago_id,'recibo_id'=>$recibo_id,'estado_recibo'=>$nuevoEstado,'pagado_actual'=>$pagado2]); exit;
}

echo json_encode(['error'=>'Acción no reconocida']);
