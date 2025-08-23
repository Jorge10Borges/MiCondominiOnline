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
if ($_SERVER['REQUEST_METHOD']!=='GET'){ http_response_code(405); echo json_encode(['error'=>'Método no soportado']); exit; }

$organizacion_id = isset($_GET['organizacion_id']) ? intval($_GET['organizacion_id']) : 0;
if(!$organizacion_id){ http_response_code(400); echo json_encode(['error'=>'organizacion_id requerido']); exit; }
$sector_id = isset($_GET['sector_id']) && $_GET['sector_id']!=='' ? intval($_GET['sector_id']) : null;
$limit = isset($_GET['limit']) ? max(1,min(100,intval($_GET['limit']))) : 12;
$offset = isset($_GET['offset']) ? max(0,intval($_GET['offset'])) : 0;

$conn = get_db_connection();

// Construir SQL dinámico.
// Nota: si se filtra por sector, solo se consideran recibos de unidades de ese sector.
if($sector_id){
  $sql = "SELECT p.id periodo_id, p.periodo, p.estado estado_periodo,
    COUNT(r.id) total_recibos,
    COALESCE(SUM(r.monto_total_usd),0) monto_total_usd,
    SUM(CASE WHEN r.estado='emitido' THEN 1 ELSE 0 END) c_emitido,
    SUM(CASE WHEN r.estado='pagado_parcial' THEN 1 ELSE 0 END) c_pagado_parcial,
    SUM(CASE WHEN r.estado='pagado_total' THEN 1 ELSE 0 END) c_pagado_total,
    SUM(CASE WHEN r.estado='anulado' THEN 1 ELSE 0 END) c_anulado,
    COALESCE((SELECT SUM(pg.monto_usd) FROM pagos_recibos pg JOIN recibos rr ON rr.id=pg.recibo_id JOIN unidades uu ON uu.id=rr.unidad_id WHERE rr.periodo_id=p.id AND pg.anulado=0 AND uu.sector_id=?),0) pagado_usd
    FROM periodos p
    LEFT JOIN recibos r ON r.periodo_id=p.id
    LEFT JOIN unidades u ON u.id=r.unidad_id
    WHERE p.organizacion_id=? AND u.sector_id=?
    GROUP BY p.id
    ORDER BY p.periodo DESC
    LIMIT ? OFFSET ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param('iiiii',$sector_id,$organizacion_id,$sector_id,$limit,$offset);
} else {
  $sql = "SELECT p.id periodo_id, p.periodo, p.estado estado_periodo,
    COUNT(r.id) total_recibos,
    COALESCE(SUM(r.monto_total_usd),0) monto_total_usd,
    SUM(CASE WHEN r.estado='emitido' THEN 1 ELSE 0 END) c_emitido,
    SUM(CASE WHEN r.estado='pagado_parcial' THEN 1 ELSE 0 END) c_pagado_parcial,
    SUM(CASE WHEN r.estado='pagado_total' THEN 1 ELSE 0 END) c_pagado_total,
    SUM(CASE WHEN r.estado='anulado' THEN 1 ELSE 0 END) c_anulado,
    COALESCE((SELECT SUM(pg.monto_usd) FROM pagos_recibos pg JOIN recibos rr ON rr.id=pg.recibo_id WHERE rr.periodo_id=p.id AND pg.anulado=0),0) pagado_usd
    FROM periodos p
    LEFT JOIN recibos r ON r.periodo_id=p.id
    WHERE p.organizacion_id=?
    GROUP BY p.id
    ORDER BY p.periodo DESC
    LIMIT ? OFFSET ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param('iii',$organizacion_id,$limit,$offset);
}

if(!$stmt->execute()){ http_response_code(500); echo json_encode(['error'=>'Error consultando resumen']); exit; }
$res = $stmt->get_result();
$rows = []; $periodosIds=[];
while($r = $res->fetch_assoc()){
  $pagado = (float)$r['pagado_usd'];
  $total = (float)$r['monto_total_usd'];
  $saldo = $total - $pagado;
  $rows[] = [
    'periodo_id'=>(int)$r['periodo_id'],
    'periodo'=>$r['periodo'],
    'estado_periodo'=>$r['estado_periodo'],
    'total_recibos'=>(int)$r['total_recibos'],
    'monto_total_usd'=>$total,
    'pagado_usd'=>$pagado,
    'saldo_usd'=>round($saldo,4),
    'estados'=>[
      'emitido'=>(int)$r['c_emitido'],
      'pagado_parcial'=>(int)$r['c_pagado_parcial'],
      'pagado_total'=>(int)$r['c_pagado_total'],
      'anulado'=>(int)$r['c_anulado']
    ],
    'porcentaje_cobrado'=>$total>0? round(($pagado/$total)*100,2):0.0
  ];
  $periodosIds[] = (int)$r['periodo_id'];
}

echo json_encode([
  'resumen_periodos'=>$rows,
  'limit'=>$limit,
  'offset'=>$offset
]);
?>