<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, OPTIONS');
if ($_SERVER['REQUEST_METHOD']==='OPTIONS'){ http_response_code(200); exit; }
require_once 'config.php';
require_once 'auth.php';
$u = validar_jwt();
if (!in_array($u->rol,['admin','superusuario','root'])) { http_response_code(403); echo json_encode(['error'=>'No autorizado']); exit; }
if ($_SERVER['REQUEST_METHOD']!=='GET') { http_response_code(405); echo json_encode(['error'=>'Método no soportado']); exit; }

$conn = get_db_connection();

// Parametros
$organizacion_id = isset($_GET['organizacion_id']) ? intval($_GET['organizacion_id']) : 0;
if(!$organizacion_id){ http_response_code(400); echo json_encode(['error'=>'organizacion_id requerido']); exit; }
$periodo = $_GET['periodo'] ?? null; // YYYY-MM
$unidad_id = isset($_GET['unidad_id']) ? intval($_GET['unidad_id']) : null;
$sector_id = isset($_GET['sector_id']) ? intval($_GET['sector_id']) : null; // nuevo filtro
$estado = $_GET['estado'] ?? null; // emitido, anulado, pagado_parcial, pagado_total
$numero = isset($_GET['numero']) ? intval($_GET['numero']) : null;
$recibo_id = isset($_GET['id']) ? intval($_GET['id']) : null;
$withDetalles = isset($_GET['with_detalles']) && intval($_GET['with_detalles']) === 1;
$limit = isset($_GET['limit']) ? max(1,min(100,intval($_GET['limit']))) : 50;
$offset = isset($_GET['offset']) ? max(0,intval($_GET['offset'])) : 0;

// Caso single por id
if ($recibo_id) {
  $stmt = $conn->prepare('SELECT r.*, p.periodo FROM recibos r JOIN periodos p ON p.id=r.periodo_id WHERE r.id=? AND r.organizacion_id=? LIMIT 1');
  $stmt->bind_param('ii',$recibo_id,$organizacion_id); $stmt->execute(); $rec=$stmt->get_result()->fetch_assoc();
  if(!$rec){ http_response_code(404); echo json_encode(['error'=>'Recibo no encontrado']); exit; }
  $detalles=[];
  if ($withDetalles) {
    $sd = $conn->prepare('SELECT id, cargo_unidad_id, gasto_snapshot_id, subcategoria, descripcion, monto_usd FROM recibo_detalles WHERE recibo_id=? ORDER BY id');
    $sd->bind_param('i',$recibo_id); $sd->execute(); $rd=$sd->get_result(); while($d=$rd->fetch_assoc()){ $detalles[]=$d; }
  }
  echo json_encode(['recibo'=>$rec,'detalles'=>$detalles]); exit;
}

$where = 'WHERE r.organizacion_id=?'; $types='i'; $params=[$organizacion_id];
if($periodo){ if(!preg_match('/^\d{4}-\d{2}$/',$periodo)){ http_response_code(400); echo json_encode(['error'=>'periodo formato inválido']); exit; } $where.=' AND p.periodo=?'; $types.='s'; $params[]=$periodo; }
if($unidad_id){ $where.=' AND r.unidad_id=?'; $types.='i'; $params[]=$unidad_id; }
if($sector_id){ $where.=' AND u.sector_id=?'; $types.='i'; $params[]=$sector_id; }
if($estado && in_array($estado,['emitido','anulado','pagado_parcial','pagado_total'])){ $where.=' AND r.estado=?'; $types.='s'; $params[]=$estado; }
if($numero){ $where.=' AND r.numero=?'; $types.='i'; $params[]=$numero; }

$sql = "SELECT SQL_CALC_FOUND_ROWS r.*, p.periodo FROM recibos r JOIN periodos p ON p.id=r.periodo_id LEFT JOIN unidades u ON u.id=r.unidad_id $where ORDER BY r.numero DESC LIMIT ? OFFSET ?";
$types.='ii'; $params[]=$limit; $params[]=$offset;
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute(); $res = $stmt->get_result(); $rows=[]; $reciboIds=[]; while($row=$res->fetch_assoc()){ $rows[]=$row; $reciboIds[]=$row['id']; }
$totalFound = $conn->query('SELECT FOUND_ROWS() f')->fetch_assoc()['f'] ?? count($rows);

// Resumen por estado y total monto (ajustado para sector/unidad/periodo)
$summary = [];
$summaryWhere = 'WHERE r.organizacion_id=?'; $sumTypes='i'; $sumParams=[$organizacion_id];
$joinSummary = '';
if($periodo){ $summaryWhere .= ' AND r.periodo_id=(SELECT id FROM periodos WHERE organizacion_id=? AND periodo=? LIMIT 1)'; $sumTypes.='is'; $sumParams[]=$organizacion_id; $sumParams[]=$periodo; }
if($unidad_id){ $summaryWhere .= ' AND r.unidad_id=?'; $sumTypes.='i'; $sumParams[]=$unidad_id; }
if($sector_id){ $joinSummary = ' LEFT JOIN unidades us ON us.id=r.unidad_id '; $summaryWhere .= ' AND us.sector_id=?'; $sumTypes.='i'; $sumParams[]=$sector_id; }
$sqlSummary = "SELECT r.estado, COUNT(*) c, COALESCE(SUM(r.monto_total_usd),0) t FROM recibos r $joinSummary $summaryWhere GROUP BY r.estado";
$qSummary = $conn->prepare($sqlSummary);
$qSummary->bind_param($sumTypes, ...$sumParams);
$qSummary->execute(); $rS=$qSummary->get_result(); $totalMonto=0; while($s=$rS->fetch_assoc()){ $summary[$s['estado']] = ['count'=>(int)$s['c'],'monto_usd'=>(float)$s['t']]; $totalMonto += (float)$s['t']; }

$detallesMap = [];
if ($withDetalles && $rows) {
  // Limitar detalles si demasiados recibos
  if (count($reciboIds) > 25) { $withDetalles = false; } else {
    $inPlaceholders = implode(',', array_fill(0,count($reciboIds),'?'));
    $typesDet = str_repeat('i', count($reciboIds));
    $sqlDet = "SELECT recibo_id, id, cargo_unidad_id, gasto_snapshot_id, subcategoria, descripcion, monto_usd FROM recibo_detalles WHERE recibo_id IN ($inPlaceholders) ORDER BY recibo_id, id";
    $stmtDet = $conn->prepare($sqlDet);
    $stmtDet->bind_param($typesDet, ...$reciboIds);
    $stmtDet->execute(); $rd=$stmtDet->get_result();
    while($d=$rd->fetch_assoc()){ $rid=$d['recibo_id']; unset($d['recibo_id']); $detallesMap[$rid][]=$d; }
  }
}

if ($withDetalles) {
  foreach($rows as &$r){ $r['detalles'] = $detallesMap[$r['id']] ?? []; }
}

echo json_encode([
  'recibos'=>$rows,
  'total'=>$totalFound,
  'limit'=>$limit,
  'offset'=>$offset,
  'resumen'=>$summary,
  'monto_total_usd'=>$totalMonto,
  'detalles_incluidos'=>$withDetalles
]);
