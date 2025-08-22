<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once 'config.php';
require_once 'auth.php';

$usuario = validar_jwt();
if (!in_array($usuario->rol, ['superusuario','admin','root'])) {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$conn = get_db_connection();

// Helpers de autorización y consistencia
function usuario_tiene_acceso_org(mysqli $conn, $usuario, int $organizacion_id): bool {
    $rol = $usuario->rol ?? '';
    if (in_array($rol, ['root','superusuario'], true)) return true;
    if ($rol === 'admin') {
        $stmt = $conn->prepare('SELECT 1 FROM usuario_organizacion WHERE usuario_id = ? AND organizacion_id = ? LIMIT 1');
        $uid = intval($usuario->id ?? 0);
        $stmt->bind_param('ii', $uid, $organizacion_id);
        $stmt->execute();
        $r = $stmt->get_result();
        return (bool)$r->fetch_row();
    }
    return false;
}

function sector_pertenece_a_org(mysqli $conn, int $sector_id, int $organizacion_id): bool {
    if ($sector_id <= 0) return true; // opcional
    $stmt = $conn->prepare('SELECT 1 FROM sectores WHERE id = ? AND organizacion_id = ? LIMIT 1');
    $stmt->bind_param('ii', $sector_id, $organizacion_id);
    $stmt->execute();
    $r = $stmt->get_result();
    return (bool)$r->fetch_row();
}

// GET list
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $organizacion_id = isset($_GET['organizacion_id']) ? intval($_GET['organizacion_id']) : 0;
    $sector_id = isset($_GET['sector_id']) ? intval($_GET['sector_id']) : 0;
    $desde = isset($_GET['desde']) ? $_GET['desde'] : null; // YYYY-MM-DD
    $hasta = isset($_GET['hasta']) ? $_GET['hasta'] : null; // YYYY-MM-DD

    if ($organizacion_id <= 0) { http_response_code(400); echo json_encode(['error'=>'organizacion_id requerido']); exit; }
    if (!usuario_tiene_acceso_org($conn, $usuario, $organizacion_id)) { http_response_code(403); echo json_encode(['error'=>'Sin acceso a la organización']); exit; }
    if ($sector_id && !sector_pertenece_a_org($conn, $sector_id, $organizacion_id)) { http_response_code(400); echo json_encode(['error'=>'sector_id no pertenece a la organización']); exit; }

    $sql = 'SELECT * FROM gastos WHERE organizacion_id = ?';
    $types = 'i'; $params = [$organizacion_id];
    if ($sector_id) { $sql .= ' AND sector_id = ?'; $types .= 'i'; $params[] = $sector_id; }
    if ($desde) { $sql .= ' AND fecha >= ?'; $types .= 's'; $params[] = $desde; }
    if ($hasta) { $sql .= ' AND fecha <= ?'; $types .= 's'; $params[] = $hasta; }
    $sql .= ' ORDER BY fecha DESC, id DESC';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $res = $stmt->get_result();
    $items = [];
    while ($row = $res->fetch_assoc()) { $items[] = $row; }
    echo json_encode(['gastos' => $items]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

// POST create
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $organizacion_id = intval($input['organizacion_id'] ?? 0);
    $sector_id = isset($input['sector_id']) ? intval($input['sector_id']) : null;
    $fecha = $input['fecha'] ?? null;
    $monto = isset($input['monto']) ? floatval($input['monto']) : null; // monto en la moneda indicada
    $moneda = strtoupper(trim($input['moneda'] ?? 'USD'));
    if (!in_array($moneda, ['USD','VES','EUR'])) { $moneda = 'USD'; }
    $monto_usd = null; // calcularemos más abajo
    $categoria = $input['categoria'] ?? null;
    $descripcion = $input['descripcion'] ?? null;
    $proveedor = $input['proveedor'] ?? null;
    $comprobante = $input['comprobante'] ?? null;

    if ($organizacion_id <= 0 || !$fecha || $monto === null) {
        http_response_code(400); echo json_encode(['error' => 'organizacion_id, fecha, monto requeridos']); exit;
    }

    if (!usuario_tiene_acceso_org($conn, $usuario, $organizacion_id)) { http_response_code(403); echo json_encode(['error'=>'Sin acceso a la organización']); exit; }
    if ($sector_id && !sector_pertenece_a_org($conn, $sector_id, $organizacion_id)) { http_response_code(400); echo json_encode(['error'=>'sector_id no pertenece a la organización']); exit; }

    // Calcular monto_usd según moneda
    if ($moneda === 'USD') {
        $monto_usd = $monto;
    } else {
        // Obtener tasa vigente (usd_por_unidad) para moneda y para VES si aplica
        if ($moneda === 'VES') {
            $stmtT = $conn->prepare("SELECT usd_por_unidad FROM tipos_cambio WHERE moneda='VES' AND efectivo_desde <= ? ORDER BY efectivo_desde DESC LIMIT 1");
            $mom = $fecha.' 23:59:59'; // usar fin del día del gasto como referencia (simple)
            $stmtT->bind_param('s', $mom);
            $stmtT->execute();
            $rT = $stmtT->get_result()->fetch_assoc();
            if ($rT) { $usd_por_ves = (float)$rT['usd_por_unidad']; if ($usd_por_ves > 0) $monto_usd = $monto * $usd_por_ves; }
        } elseif ($moneda === 'EUR') {
            // Necesitamos usd_por_unidad(EUR)
            $stmtT = $conn->prepare("SELECT usd_por_unidad FROM tipos_cambio WHERE moneda='EUR' AND efectivo_desde <= ? ORDER BY efectivo_desde DESC LIMIT 1");
            $mom = $fecha.' 23:59:59';
            $stmtT->bind_param('s', $mom);
            $stmtT->execute();
            $rT = $stmtT->get_result()->fetch_assoc();
            if ($rT) { $usd_por_eur = (float)$rT['usd_por_unidad']; if ($usd_por_eur > 0) $monto_usd = $monto * $usd_por_eur; }
        }
    }
    if ($monto_usd === null) { $monto_usd = $monto; }

    $stmt = $conn->prepare('INSERT INTO gastos (organizacion_id, sector_id, fecha, categoria, descripcion, monto, moneda, monto_usd, proveedor, comprobante) VALUES (?,?,?,?,?,?,?,?,?,?)');
    $stmt->bind_param('iisssdsdss', $organizacion_id, $sector_id, $fecha, $categoria, $descripcion, $monto, $moneda, $monto_usd, $proveedor, $comprobante);
    if (!$stmt->execute()) { http_response_code(500); echo json_encode(['error'=>'No se pudo crear gasto']); exit; }
    echo json_encode(['ok'=>true, 'id'=>$stmt->insert_id]);
    exit;
}

// PUT update
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    // Cargar registro original y validar acceso
    $stmtOrig = $conn->prepare('SELECT organizacion_id, sector_id FROM gastos WHERE id = ?');
    $stmtOrig->bind_param('i', $id);
    $stmtOrig->execute();
    $resOrig = $stmtOrig->get_result();
    $orig = $resOrig->fetch_assoc();
    if (!$orig) { http_response_code(404); echo json_encode(['error'=>'Gasto no encontrado']); exit; }
    if (!usuario_tiene_acceso_org($conn, $usuario, intval($orig['organizacion_id']))) { http_response_code(403); echo json_encode(['error'=>'Sin acceso a la organización del gasto']); exit; }

    $campos = [];$types='';$params=[];
    $camposPermitidos = ['organizacion_id','sector_id','fecha','categoria','descripcion','monto','moneda','proveedor','comprobante'];
    foreach ($camposPermitidos as $k) {
        if (array_key_exists($k, $input)) {
            $campos[] = "$k = ?";
            if ($k === 'organizacion_id' || $k === 'sector_id') { $types.='i'; $params[] = intval($input[$k]); }
            else if ($k === 'monto') { $types.='d'; $params[] = floatval($input[$k]); }
            else if ($k === 'moneda') { $types.='s'; $params[] = in_array(strtoupper($input[$k]), ['USD','VES','EUR']) ? strtoupper($input[$k]) : 'USD'; }
            else { $types.='s'; $params[] = $input[$k]; }
        }
    }
    // Si cambia monto o moneda recalculamos monto_usd
    $recalcularUSD = (array_key_exists('monto',$input) || array_key_exists('moneda',$input));
    if ($recalcularUSD) {
        $nuevoMonto = array_key_exists('monto',$input) ? floatval($input['monto']) : null;
        $nuevaMoneda = array_key_exists('moneda',$input) ? strtoupper($input['moneda']) : null;
        if (!$nuevoMonto) {
            // obtener actual
            $stmtAct = $conn->prepare('SELECT monto, moneda, fecha FROM gastos WHERE id=?');
            $stmtAct->bind_param('i', $id);
            $stmtAct->execute();
            $curr = $stmtAct->get_result()->fetch_assoc();
            $nuevoMonto = $curr ? (float)$curr['monto'] : 0;
            if (!$nuevaMoneda) $nuevaMoneda = $curr ? $curr['moneda'] : 'USD';
            $fechaRef = $curr ? $curr['fecha'] : date('Y-m-d');
        } else {
            $stmtAct = $conn->prepare('SELECT fecha FROM gastos WHERE id=?');
            $stmtAct->bind_param('i', $id);
            $stmtAct->execute();
            $curr = $stmtAct->get_result()->fetch_assoc();
            $fechaRef = $curr ? $curr['fecha'] : date('Y-m-d');
        }
        $nuevaMoneda = $nuevaMoneda && in_array($nuevaMoneda,['USD','VES','EUR']) ? $nuevaMoneda : 'USD';
        $montoUsdCalc = $nuevoMonto;
        if ($nuevaMoneda === 'VES') {
            $stmtT2 = $conn->prepare("SELECT usd_por_unidad FROM tipos_cambio WHERE moneda='VES' AND efectivo_desde <= ? ORDER BY efectivo_desde DESC LIMIT 1");
            $mom2 = $fechaRef.' 23:59:59';
            $stmtT2->bind_param('s', $mom2);
            $stmtT2->execute();
            if ($r2 = $stmtT2->get_result()->fetch_assoc()) { $upv = (float)$r2['usd_por_unidad']; if ($upv>0) $montoUsdCalc = $nuevoMonto * $upv; }
        } elseif ($nuevaMoneda === 'EUR') {
            $stmtT3 = $conn->prepare("SELECT usd_por_unidad FROM tipos_cambio WHERE moneda='EUR' AND efectivo_desde <= ? ORDER BY efectivo_desde DESC LIMIT 1");
            $mom3 = $fechaRef.' 23:59:59';
            $stmtT3->bind_param('s', $mom3);
            $stmtT3->execute();
            if ($r3 = $stmtT3->get_result()->fetch_assoc()) { $upe = (float)$r3['usd_por_unidad']; if ($upe>0) $montoUsdCalc = $nuevoMonto * $upe; }
        }
        $campos[] = 'monto_usd = ?';
        $types .= 'd';
        $params[] = $montoUsdCalc;
    }
    // Validaciones si cambian org/sector
    $targetOrg = array_key_exists('organizacion_id', $input) ? intval($input['organizacion_id']) : intval($orig['organizacion_id']);
    $targetSector = array_key_exists('sector_id', $input) ? intval($input['sector_id']) : intval($orig['sector_id']);
    if (!usuario_tiene_acceso_org($conn, $usuario, $targetOrg)) { http_response_code(403); echo json_encode(['error'=>'Sin acceso a la organización destino']); exit; }
    if ($targetSector && !sector_pertenece_a_org($conn, $targetSector, $targetOrg)) { http_response_code(400); echo json_encode(['error'=>'sector destino no pertenece a la organización']); exit; }
    if (!$campos) { echo json_encode(['ok'=>true]); exit; }
    $types.='i'; $params[]=$id;
    $sql = 'UPDATE gastos SET '.implode(',', $campos).' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    if (!$stmt->execute()) { http_response_code(500); echo json_encode(['error'=>'No se pudo actualizar gasto']); exit; }
    echo json_encode(['ok'=>true]);
    exit;
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    // Validar acceso antes de eliminar
    $stmtC = $conn->prepare('SELECT organizacion_id FROM gastos WHERE id = ?');
    $stmtC->bind_param('i', $id);
    $stmtC->execute();
    $rC = $stmtC->get_result();
    $orig = $rC->fetch_assoc();
    if (!$orig) { http_response_code(404); echo json_encode(['error'=>'Gasto no encontrado']); exit; }
    if (!usuario_tiene_acceso_org($conn, $usuario, intval($orig['organizacion_id']))) { http_response_code(403); echo json_encode(['error'=>'Sin acceso a la organización del gasto']); exit; }

    $stmt = $conn->prepare('DELETE FROM gastos WHERE id = ?');
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) { http_response_code(500); echo json_encode(['error'=>'No se pudo eliminar gasto']); exit; }
    echo json_encode(['ok'=>true]);
    exit;
}
echo json_encode(['error'=>'Método no soportado']);
