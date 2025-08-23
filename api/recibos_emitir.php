<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD']==='OPTIONS'){ http_response_code(200); exit; }
require_once 'config.php';
require_once 'auth.php';
$u = validar_jwt();
if (!in_array($u->rol,['admin','superusuario','root'])) { http_response_code(403); echo json_encode(['error'=>'No autorizado']); exit; }
if ($_SERVER['REQUEST_METHOD']!=='POST') { http_response_code(405); echo json_encode(['error'=>'Método no soportado']); exit; }
$in = json_decode(file_get_contents('php://input'), true) ?? [];
$organizacion_id = intval($in['organizacion_id'] ?? 0);
$periodo = $in['periodo'] ?? '';
$forzar_reemitir = isset($in['forzar_reemitir']) ? (bool)$in['forzar_reemitir'] : false;
$incluir_ceros = isset($in['incluir_ceros']) ? (bool)$in['incluir_ceros'] : false;
if (!$organizacion_id || !preg_match('/^\d{4}-\d{2}$/',$periodo)) { http_response_code(400); echo json_encode(['error'=>'organizacion_id y periodo (YYYY-MM) requeridos']); exit; }

$conn = get_db_connection();

// Validar periodo
$stmt = $conn->prepare('SELECT id, estado FROM periodos WHERE organizacion_id=? AND periodo=? LIMIT 1');
$stmt->bind_param('is',$organizacion_id,$periodo); $stmt->execute(); $per=$stmt->get_result()->fetch_assoc();
if(!$per){ http_response_code(404); echo json_encode(['error'=>'Periodo no encontrado']); exit; }
if(!in_array($per['estado'],['pre_cerrado','cerrado'])) { http_response_code(409); echo json_encode(['error'=>'Periodo debe estar pre_cerrado o cerrado']); exit; }
$periodo_id = intval($per['id']);

// Verificar cargos prorrateados
$cq = $conn->prepare('SELECT COUNT(*) c FROM periodo_cargos_unidad WHERE periodo_id=?');
$cq->bind_param('i',$periodo_id); $cq->execute(); $cCount = $cq->get_result()->fetch_assoc()['c'] ?? 0;
if(!$cCount){ http_response_code(422); echo json_encode(['error'=>'No hay cargos prorrateados (ejecutar prorrateo primero)']); exit; }

// Verificar si ya existen recibos
$rx = $conn->prepare('SELECT COUNT(*) c FROM recibos WHERE periodo_id=?');
$rx->bind_param('i',$periodo_id); $rx->execute(); $existen = $rx->get_result()->fetch_assoc()['c'] ?? 0;
if($existen && !$forzar_reemitir){ http_response_code(409); echo json_encode(['error'=>'Ya existen recibos para este periodo','puede_forzar'=>true]); exit; }

$conn->begin_transaction();
try {
  if($forzar_reemitir && $existen){
    // Borrado seguro: primero detalles luego encabezados
    $conn->query('DELETE d FROM recibo_detalles d INNER JOIN recibos r ON r.id=d.recibo_id WHERE r.periodo_id='.(int)$periodo_id);
    $conn->query('DELETE FROM recibos WHERE periodo_id='.(int)$periodo_id);
  }
  // Obtener siguiente numero base
  $qNum = $conn->prepare('SELECT MAX(numero) m FROM recibos WHERE organizacion_id=?');
  $qNum->bind_param('i',$organizacion_id); $qNum->execute(); $mRow=$qNum->get_result()->fetch_assoc();
  $nextNumero = ($mRow && $mRow['m']!==null) ? (intval($mRow['m'])+1) : 1;

  // Tasa referencial VES para equivalencia
  $tasaVES = null; $rT = $conn->query("SELECT usd_por_unidad FROM tipos_cambio WHERE moneda='VES' ORDER BY efectivo_desde DESC LIMIT 1");
  if($rT && $row=$rT->fetch_assoc()){ $tasaVES = $row['usd_por_unidad']; }

  // Cargar cargos agrupados por unidad
  $cg = $conn->prepare('SELECT unidad_id, SUM(monto_usd) total_unidad FROM periodo_cargos_unidad WHERE periodo_id=? GROUP BY unidad_id');
  $cg->bind_param('i',$periodo_id); $cg->execute(); $rg=$cg->get_result();
  $unidades=[]; while($r=$rg->fetch_assoc()){ $unidades[]=$r; }
  if(!$unidades){ throw new Exception('No hay cargos agrupados'); }

  $insRec = $conn->prepare('INSERT INTO recibos (periodo_id, organizacion_id, unidad_id, numero, monto_total_usd, tasa_ves_usd_emision, emitido_por) VALUES (?,?,?,?,?,?,?)');
  $insDet = $conn->prepare('INSERT INTO recibo_detalles (recibo_id, periodo_id, unidad_id, cargo_unidad_id, gasto_snapshot_id, subcategoria, descripcion, monto_usd) VALUES (?,?,?,?,?,?,?,?)');

  $recibosCreados=0; $totalGlobal=0.0; $inicio=$nextNumero; $fin=$nextNumero-1; $mapRec=[];
  foreach($unidades as $uRow){
    $unidad_id = (int)$uRow['unidad_id']; $totalUnidad = (float)$uRow['total_unidad'];
    if(!$incluir_ceros && abs($totalUnidad) < 0.0001) continue;
    $num = $nextNumero++;
    $insRec->bind_param('iiiiddi',$periodo_id,$organizacion_id,$unidad_id,$num,$totalUnidad,$tasaVES,$u->id);
    if(!$insRec->execute()) throw new Exception('Error insertando recibo');
    $recibo_id = $insRec->insert_id; $mapRec[$unidad_id]=$recibo_id; $recibosCreados++; $totalGlobal += $totalUnidad; $fin=$num;
    // Insertar detalles de esa unidad
    $cd = $conn->prepare('SELECT id, gasto_snapshot_id, subcategoria, descripcion, monto_usd FROM periodo_cargos_unidad WHERE periodo_id=? AND unidad_id=?');
    $cd->bind_param('ii',$periodo_id,$unidad_id); $cd->execute(); $rd=$cd->get_result();
    while($d=$rd->fetch_assoc()){
      $idCargo = $d['id']; $gSnap = $d['gasto_snapshot_id']; $sub = $d['subcategoria']; $desc=$d['descripcion']; $m=$d['monto_usd'];
      $insDet->bind_param('iiiisssd',$recibo_id,$periodo_id,$unidad_id,$idCargo,$gSnap,$sub,$desc,$m);
      if(!$insDet->execute()) throw new Exception('Error insertando detalle');
    }
  }
  if(!$recibosCreados){ throw new Exception('No se generaron recibos (quizá todos monto=0)'); }
  $conn->commit();
  echo json_encode([
    'ok'=>true,
    'periodo_id'=>$periodo_id,
    'periodo'=>$periodo,
    'recibos_creados'=>$recibosCreados,
    'numero_inicio'=>$inicio,
    'numero_fin'=>$fin,
    'total_monto_usd'=>round($totalGlobal,4),
    'tasa_ves_usd_emision'=>$tasaVES,
    'forzar_reemitir'=>$forzar_reemitir
  ]);
  exit;
} catch(Exception $e){
  $conn->rollback();
  http_response_code(500);
  echo json_encode(['error'=>'Fallo al emitir recibos','detalle'=>$e->getMessage()]);
  exit;
}
