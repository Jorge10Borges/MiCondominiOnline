<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once 'config.php';
require_once 'auth.php';
$u = validar_jwt();
if (!in_array($u->rol, ['superusuario','admin','root'])) { http_response_code(403); echo json_encode(['error'=>'No autorizado']); exit; }
$conn = get_db_connection();

define('PERMIT_REOPEN_ROLES', json_encode(['superusuario','root']));

function json_input() { $d = json_decode(file_get_contents('php://input'), true); return is_array($d)?$d:[]; }
function period_range($periodo) {
  if (!preg_match('/^\d{4}-\d{2}$/',$periodo)) return null;
  [$y,$m]=explode('-',$periodo); $start="$y-$m-01"; $end=date('Y-m-t', strtotime($start)); return [$start,$end];
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method==='GET') {
  $organizacion_id = intval($_GET['organizacion_id'] ?? 0);
  if (!$organizacion_id) { http_response_code(400); echo json_encode(['error'=>'organizacion_id requerido']); exit; }
  // Listado
  if (($action==='list') || isset($_GET['list'])) {
    $estado = $_GET['estado'] ?? null; // filtro opcional
    $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 50;
    $offset = isset($_GET['offset']) ? max(0, intval($_GET['offset'])) : 0;
    $where = 'WHERE organizacion_id=?'; $types='i'; $params=[$organizacion_id];
    if ($estado && in_array($estado,['abierto','pre_cerrado','cerrado'])) { $where.=' AND estado=?'; $types.='s'; $params[]=$estado; }
    $sql = "SELECT SQL_CALC_FOUND_ROWS * FROM periodos $where ORDER BY periodo DESC LIMIT ? OFFSET ?";
    $types.='ii'; $params[]=$limit; $params[]=$offset;
    $stmt=$conn->prepare($sql); $stmt->bind_param($types, ...$params); $stmt->execute(); $rs=$stmt->get_result(); $rows=[]; while($r=$rs->fetch_assoc()){ $rows[]=$r; }
    $totalRes = $conn->query('SELECT FOUND_ROWS() as t')->fetch_assoc()['t'] ?? count($rows);
    echo json_encode(['periodos'=>$rows,'total'=>$totalRes,'limit'=>$limit,'offset'=>$offset]); exit;
  }
  // Estado de un periodo puntual
  $periodo = $_GET['periodo'] ?? '';
  if (!$periodo) { http_response_code(400); echo json_encode(['error'=>'periodo requerido (o use action=list)']); exit; }
  $stmt=$conn->prepare('SELECT * FROM periodos WHERE organizacion_id=? AND periodo=? LIMIT 1');
  $stmt->bind_param('is',$organizacion_id,$periodo); $stmt->execute(); $res=$stmt->get_result()->fetch_assoc();
  if (!$res) { echo json_encode(['estado'=>'abierto','detalle'=>null]); exit; }
  echo json_encode(['estado'=>$res['estado'],'detalle'=>$res]); exit;
}

if ($method==='POST' && $action==='pre_cerrar') {
  $in = json_input();
  $organizacion_id = intval($in['organizacion_id'] ?? 0);
  $periodo = $in['periodo'] ?? '';
  if (!$organizacion_id || !$periodo) { http_response_code(400); echo json_encode(['error'=>'organizacion_id y periodo requeridos']); exit; }
  $range = period_range($periodo); if (!$range) { http_response_code(400); echo json_encode(['error'=>'Formato periodo inválido']); exit; }
  [$desde,$hasta]=$range;
  // Cargar gastos válidos
  $sqlG="SELECT * FROM gastos WHERE organizacion_id=? AND fecha BETWEEN ? AND ? AND estado='activo'";
  $stmt=$conn->prepare($sqlG); $stmt->bind_param('iss',$organizacion_id,$desde,$hasta); $stmt->execute(); $gRes=$stmt->get_result();
  $gastos=[]; while($row=$gRes->fetch_assoc()){ $gastos[]=$row; }
  // Validaciones
  $errores=[]; $advertencias=[];
  if (!count($gastos)) $errores[]='No hay gastos para el período';
  foreach($gastos as $g){
    if (empty($g['categoria']) || strpos($g['categoria'],'-')===false) { $errores[]='Gasto ID '.$g['id'].' sin subcategoría'; }
    if ($g['monto_usd']===null) { $errores[]='Gasto ID '.$g['id'].' sin monto_usd'; }
  }
  // TODO: validar coeficientes unidades (requiere tabla unidades)
  if ($errores) { http_response_code(422); echo json_encode(['error'=>'Validaciones fallidas','detalles'=>$errores,'advertencias'=>$advertencias]); exit; }
  // Obtener/crear periodo
  $stmt=$conn->prepare('SELECT id, estado FROM periodos WHERE organizacion_id=? AND periodo=? LIMIT 1');
  $stmt->bind_param('is',$organizacion_id,$periodo); $stmt->execute(); $ex=$stmt->get_result()->fetch_assoc();
  if ($ex && $ex['estado']==='pre_cerrado') { echo json_encode(['ok'=>true,'mensaje'=>'Ya estaba pre_cerrado']); exit; }
  if ($ex && $ex['estado']==='cerrado') { http_response_code(409); echo json_encode(['error'=>'Periodo cerrado, no se puede modificar']); exit; }
  if (!$ex) {
    $stmt=$conn->prepare('INSERT INTO periodos (organizacion_id, periodo, estado) VALUES (?,?,"abierto")');
    $stmt->bind_param('is',$organizacion_id,$periodo); $stmt->execute(); $periodo_id=$stmt->insert_id;
  } else { $periodo_id=$ex['id']; }
  // Borrar snapshots previos si existen
  $conn->query("DELETE FROM periodo_gastos_snapshot WHERE periodo_id=".$periodo_id);
  $conn->query("DELETE FROM periodo_unidades_snapshot WHERE periodo_id=".$periodo_id);
  // Insertar snapshot de gastos
  $ins=$conn->prepare('INSERT INTO periodo_gastos_snapshot (periodo_id,gasto_id,categoria,subcategoria,descripcion,moneda_original,monto_original,monto_usd,proveedor,fecha) VALUES (?,?,?,?,?,?,?,?,?,?)');
  foreach($gastos as $g){
    $cat=null; $sub=null; if (!empty($g['categoria']) && strpos($g['categoria'],'-')!==false){ $sub=$g['categoria']; $cat=substr($sub,0,strpos($sub,'-')); }
    $ins->bind_param('iissssddss',
      $periodo_id,
      $g['id'],
      $cat,
      $sub,
      $g['descripcion'],
      $g['moneda'],
      $g['monto'],
      $g['monto_usd'],
      $g['proveedor'],
      $g['fecha']
    );
    $ins->execute();
  }
  // Snapshot de unidades tomando alicuota como coeficiente (si existe campo alicuota en tabla unidades; fallback 1)
  // Intentamos primero tabla 'unidades' (según API unidades.php). Si no existe, usamos unidades_habitacionales.
  $tablaUnidades = 'unidades';
  $existe = $conn->query("SHOW TABLES LIKE 'unidades'");
  if (!$existe || !$existe->num_rows) { $tablaUnidades = 'unidades_habitacionales'; }
  $colAlicuota = 'alicuota';
  $cols = $conn->query("SHOW COLUMNS FROM `".$tablaUnidades."` LIKE 'alicuota'");
  $tieneAlicuota = $cols && $cols->num_rows>0;
  if ($tablaUnidades==='unidades') {
    $sqlU = 'SELECT id, '.($tieneAlicuota?'alicuota':'NULL AS alicuota').' FROM unidades';
  } else {
    $sqlU = 'SELECT id, NULL AS alicuota FROM unidades_habitacionales WHERE organizacion_id='.(int)$organizacion_id;
  }
  $rU = $conn->query($sqlU);
  if ($rU) {
    $insU = $conn->prepare('INSERT INTO periodo_unidades_snapshot (periodo_id, unidad_id, coeficiente, alicuota, activa) VALUES (?,?,?,?,1)');
    $totalAbs = 0.0; $buffer = [];
    while($uRow=$rU->fetch_assoc()) {
      $ali = $uRow['alicuota']!==null ? (float)$uRow['alicuota'] : 0.0; // Puede ser positivo, negativo o cero
      $coef = $ali; // usamos directamente el porcentaje como coeficiente
      $totalAbs += abs($coef);
      $buffer[] = [$uRow['id'],$coef,$ali];
    }
    if ($totalAbs <= 0) { http_response_code(422); echo json_encode(['error'=>'Todas las alícuotas son cero; no se puede pre-cerrar']); exit; }
    foreach($buffer as $b){ [$uid,$coef,$ali] = $b; $insU->bind_param('iidd',$periodo_id,$uid,$coef,$ali); $insU->execute(); }
  }
  // Totales
  $totalUsd=0; foreach($gastos as $g){ $totalUsd += (float)$g['monto_usd']; }
  // Tasa base (última VES)
  $rTasa=$conn->query("SELECT usd_por_unidad FROM tipos_cambio WHERE moneda='VES' ORDER BY efectivo_desde DESC LIMIT 1");
  $tasaBase=null; if($rTasa && $row=$rTasa->fetch_assoc()){ $tasaBase=$row['usd_por_unidad']; }
  // Hash
  $concats=''; foreach($gastos as $g){ $concats.=$g['id'].'|'.$g['monto_usd'].'|'.$g['categoria'].';'; }
  $hash = hash('sha256',$concats);
  // Actualizar periodo
  $stmt=$conn->prepare('UPDATE periodos SET estado="pre_cerrado", total_gastos_usd=?, total_gastos_items=?, tasa_usd_ves_base=?, snapshot_hash=?, pre_cerrado_at=NOW(), pre_cerrado_por=? WHERE id=?');
  $countG = count($gastos);
  $stmt->bind_param('didsii',$totalUsd,$countG,$tasaBase,$hash,$u->id,$periodo_id);
  $stmt->execute();
  echo json_encode(['ok'=>true,'periodo_id'=>$periodo_id,'estado'=>'pre_cerrado','total_gastos_usd'=>$totalUsd,'items'=>$countG]);
  exit;
}

if ($method==='POST' && $action==='reabrir') {
  $in=json_input(); $periodo_id=intval($in['periodo_id']??0); $motivo=trim($in['motivo']??'');
  if(!$periodo_id){ http_response_code(400); echo json_encode(['error'=>'periodo_id requerido']); exit; }
  if(!in_array($u->rol,['superusuario','root'])) { http_response_code(403); echo json_encode(['error'=>'Solo roles altos reabren']); exit; }
  $stmt=$conn->prepare('SELECT estado FROM periodos WHERE id=?'); $stmt->bind_param('i',$periodo_id); $stmt->execute(); $row=$stmt->get_result()->fetch_assoc();
  if(!$row){ http_response_code(404); echo json_encode(['error'=>'Periodo no encontrado']); exit; }
  if($row['estado']!=='pre_cerrado'){ http_response_code(409); echo json_encode(['error'=>'Solo se puede reabrir un periodo pre_cerrado']); exit; }
  $sql="UPDATE periodos SET estado='abierto', reabierto_at=NOW(), reabierto_por=?, reporte_validacion=JSON_SET(COALESCE(reporte_validacion,'{}'), '$.ultimo_motivo_reapertura', ?) WHERE id=?";
  $stmt=$conn->prepare($sql);
  $stmt->bind_param('isi',$u->id,$motivo,$periodo_id); $stmt->execute();
  echo json_encode(['ok'=>true,'estado'=>'abierto']); exit;
}

// Cerrar definitivamente un periodo (solo si está pre_cerrado)
if ($method==='POST' && $action==='cerrar') {
  $in=json_input();
  $periodo_id = intval($in['periodo_id'] ?? 0);
  $forzar = isset($in['forzar']) ? (bool)$in['forzar'] : false; // permite cerrar aunque hash difiera (roles altos)
  if(!$periodo_id){ http_response_code(400); echo json_encode(['error'=>'periodo_id requerido']); exit; }
  $stmt=$conn->prepare('SELECT * FROM periodos WHERE id=? LIMIT 1');
  $stmt->bind_param('i',$periodo_id); $stmt->execute(); $per=$stmt->get_result()->fetch_assoc();
  if(!$per){ http_response_code(404); echo json_encode(['error'=>'Periodo no encontrado']); exit; }
  if($per['estado']!=='pre_cerrado'){ http_response_code(409); echo json_encode(['error'=>'Periodo debe estar en pre_cerrado']); exit; }
  // Recalcular hash y totales desde snapshots
  $snap = $conn->prepare('SELECT gasto_id,monto_usd,categoria,subcategoria FROM periodo_gastos_snapshot WHERE periodo_id=? ORDER BY gasto_id');
  $snap->bind_param('i',$periodo_id); $snap->execute(); $rs=$snap->get_result();
  $conc = ''; $total=0; $items=0;
  while($r=$rs->fetch_assoc()) { $items++; $total += (float)$r['monto_usd']; $conc .= $r['gasto_id'].'|'.$r['monto_usd'].'|'.($r['subcategoria']?:$r['categoria']).';'; }
  $hashCalc = hash('sha256',$conc);
  $descuadre = false; $motivos=[];
  if (abs($total - (float)$per['total_gastos_usd']) > 0.0001) { $descuadre=true; $motivos[]='Total distinto'; }
  if ($items != (int)$per['total_gastos_items']) { $descuadre=true; $motivos[]='Cantidad items distinta'; }
  if ($hashCalc !== $per['snapshot_hash']) { $descuadre=true; $motivos[]='Hash distinto'; }
  if($descuadre && !($forzar && in_array($u->rol,['root','superusuario']))) {
    http_response_code(409);
    echo json_encode(['error'=>'Descuadre entre snapshot y periodo','motivos'=>$motivos,'hash_calc'=>$hashCalc,'hash_periodo'=>$per['snapshot_hash']]);
    exit;
  }
  // Actualizar periodo a cerrado y registrar verificación/descuadre
  $detalleValid = ['cerrado_por'=>$u->id,'descuadre'=>$descuadre,'motivos'=>$motivos];
  $jsonDetalle = json_encode($detalleValid, JSON_UNESCAPED_UNICODE);
  $sqlCierre = "UPDATE periodos SET estado='cerrado', cerrado_at=NOW(), cerrado_por=?, "
    . "reporte_validacion=JSON_SET(COALESCE(reporte_validacion, '{}'), '$.cierre', ?) WHERE id=?";
  $stmt=$conn->prepare($sqlCierre);
  $stmt->bind_param('isi',$u->id,$jsonDetalle,$periodo_id);
  $stmt->execute();
  echo json_encode(['ok'=>true,'estado'=>'cerrado','periodo_id'=>$periodo_id,'descuadre'=>$descuadre,'motivos'=>$motivos]);
  exit;
}

http_response_code(405); echo json_encode(['error'=>'Acción no soportada']);
