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
$metodo = $in['metodo'] ?? 'coeficiente'; // reservado para futuros métodos
if (!$organizacion_id || !preg_match('/^\d{4}-\d{2}$/',$periodo)) { http_response_code(400); echo json_encode(['error'=>'organizacion_id y periodo (YYYY-MM) requeridos']); exit; }

$conn = get_db_connection();
// Obtener periodo
$stmt = $conn->prepare('SELECT id, estado FROM periodos WHERE organizacion_id=? AND periodo=? LIMIT 1');
$stmt->bind_param('is',$organizacion_id,$periodo); $stmt->execute(); $per = $stmt->get_result()->fetch_assoc();
if (!$per) { http_response_code(404); echo json_encode(['error'=>'Periodo no encontrado']); exit; }
if (!in_array($per['estado'],['pre_cerrado','cerrado'])) { http_response_code(409); echo json_encode(['error'=>'Periodo debe estar pre_cerrado o cerrado']); exit; }
$periodo_id = intval($per['id']);

// Cargar snapshot de gastos
$gq = $conn->prepare('SELECT id, gasto_id, subcategoria, descripcion, monto_usd FROM periodo_gastos_snapshot WHERE periodo_id=? ORDER BY id');
$gq->bind_param('i',$periodo_id); $gq->execute(); $rg = $gq->get_result(); $gastos=[]; while($row=$rg->fetch_assoc()) { $gastos[]=$row; }
if (!count($gastos)) { http_response_code(422); echo json_encode(['error'=>'No hay gastos snapshot para el periodo']); exit; }
// Cargar unidades snapshot
$uq = $conn->prepare('SELECT unidad_id, coeficiente, alicuota, activa FROM periodo_unidades_snapshot WHERE periodo_id=? AND activa=1');
$uq->bind_param('i',$periodo_id); $uq->execute(); $ru=$uq->get_result(); $unidades=[]; $totalAbs=0.0; while($r=$ru->fetch_assoc()){ $coef = ($r['coeficiente']!==null)? (float)$r['coeficiente'] : 0.0; $totalAbs += abs($coef); $unidades[]=['unidad_id'=>$r['unidad_id'],'coef'=>$coef,'alicuota'=>$r['alicuota']]; }
if (!$unidades) { http_response_code(422); echo json_encode(['error'=>'No hay unidades activas en snapshot']); exit; }
if ($totalAbs <= 0) { http_response_code(422); echo json_encode(['error'=>'Todos los coeficientes son cero']); exit; }

// Borrar cargos anteriores para este periodo
$conn->query('DELETE FROM periodo_cargos_unidad WHERE periodo_id='.(int)$periodo_id);

$ins = $conn->prepare('INSERT INTO periodo_cargos_unidad (periodo_id, unidad_id, gasto_snapshot_id, tipo_fuente, subcategoria, descripcion, monto_usd, coeficiente_utilizado) VALUES (?,?,?,?,?,?,?,?)');
$tipoFuente='gasto';
$totalDistribuido = 0.0; $filas=0; $gastosProcesados=0;
foreach($gastos as $g) {
  $monto = (float)$g['monto_usd'];
  if ($monto <= 0) { continue; }
  $gastosProcesados++;
  $restante = $monto; $lastIndex = count($unidades)-1; $acumulado=0.0;
  foreach($unidades as $i=>$uRow) {
    $propor = abs($uRow['coef']) / $totalAbs; $asignadoBase = $monto * $propor; // distribución por magnitud
    // Mantener signo del coeficiente (si coef negativo, cargo negativo)
    $asignado = round($asignadoBase * ($uRow['coef']<0 ? -1 : 1), 4);
    $acumulado += $asignado;
    if ($i === $lastIndex) { // ajustar última unidad para que cuadre exactamente
      $diferencia = round($monto - $acumulado, 4);
      if (abs($diferencia) >= 0.0001) { $asignado += $diferencia; $acumulado += $diferencia; }
    }
    if ($asignado <= 0) continue;
  $ins->bind_param('iissssdd',
      $periodo_id,
      $uRow['unidad_id'],
      $g['id'],
      $tipoFuente,
      $g['subcategoria'],
      $g['descripcion'],
      $asignado,
      $uRow['coef']
    );
    $ins->execute();
    $filas++; $totalDistribuido += $asignado;
  }
}

echo json_encode([
  'ok'=>true,
  'periodo_id'=>$periodo_id,
  'periodo'=>$periodo,
  'gastos_snapshot'=>count($gastos),
  'gastos_procesados'=>$gastosProcesados,
  'unidades'=>count($unidades),
  'suma_coeficientes_abs'=>round($totalAbs,8),
  'cargos_insertados'=>$filas,
  'total_distribuido_usd'=>round($totalDistribuido,4)
]);
