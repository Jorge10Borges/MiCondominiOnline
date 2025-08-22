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

// GET list
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $organizacion_id = isset($_GET['organizacion_id']) ? intval($_GET['organizacion_id']) : 0;
    if ($organizacion_id <= 0) { http_response_code(400); echo json_encode(['error'=>'organizacion_id requerido']); exit; }
    $unidad_id = isset($_GET['unidad_id']) ? intval($_GET['unidad_id']) : null;
        $sector_id = isset($_GET['sector_id']) ? intval($_GET['sector_id']) : 0;
    $desde = isset($_GET['desde']) ? $_GET['desde'] : null; // YYYY-MM-DD
    $hasta = isset($_GET['hasta']) ? $_GET['hasta'] : null; // YYYY-MM-DD

    $sql = 'SELECT p.*, u.identificador AS unidad_identificador FROM pagos p JOIN unidades u ON u.id = p.unidad_id WHERE p.organizacion_id = ?';
    $types = 'i'; $params = [$organizacion_id];
    if ($unidad_id) { $sql .= ' AND p.unidad_id = ?'; $types .= 'i'; $params[] = $unidad_id; }
        if ($sector_id) { $sql .= ' AND p.sector_id = ?'; $types .= 'i'; $params[] = $sector_id; }
    if ($desde) { $sql .= ' AND p.fecha >= ?'; $types .= 's'; $params[] = $desde; }
    if ($hasta) { $sql .= ' AND p.fecha <= ?'; $types .= 's'; $params[] = $hasta; }
    $sql .= ' ORDER BY p.fecha DESC, p.id DESC';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $res = $stmt->get_result();
    $items = [];
    while ($row = $res->fetch_assoc()) { $items[] = $row; }
    echo json_encode(['pagos' => $items]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

// POST create (registrar pago)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $organizacion_id = intval($input['organizacion_id'] ?? 0);
    $unidad_id = intval($input['unidad_id'] ?? 0);
    $fecha = $input['fecha'] ?? null;
        $sector_id = isset($input['sector_id']) ? intval($input['sector_id']) : null;
    $monto = isset($input['monto']) ? floatval($input['monto']) : null;
    $metodo = $input['metodo'] ?? null;
    $referencia = $input['referencia'] ?? null;

    if ($organizacion_id <= 0 || $unidad_id <= 0 || !$fecha || $monto === null) {
        http_response_code(400); echo json_encode(['error' => 'organizacion_id, unidad_id, fecha, monto requeridos']); exit;
    }

    // Recibo: simple incremental por organización (placeholder)
    $recibo_num = null;
    $res = $conn->query('SELECT LPAD(COALESCE(MAX(id)+1,1), 6, "0") AS nextnum FROM pagos WHERE organizacion_id = '.intval($organizacion_id));
    if ($row = $res->fetch_assoc()) { $recibo_num = $row['nextnum']; }

    $stmt = $conn->prepare('INSERT INTO pagos (organizacion_id, unidad_id, fecha, monto, metodo, referencia, recibo_num, usuario_id) VALUES (?,?,?,?,?,?,?,?)');
    $uid = intval($usuario->id ?? 0);
        $stmt->bind_param('iiisdsssi', $organizacion_id, $sector_id, $unidad_id, $fecha, $monto, $metodo, $referencia, $recibo_num, $uid);
    if (!$stmt->execute()) { http_response_code(500); echo json_encode(['error'=>'No se pudo registrar pago']); exit; }
    echo json_encode(['ok'=>true, 'id'=>$stmt->insert_id, 'recibo_num'=>$recibo_num]);
    exit;
}

// PUT anular
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $estado = $input['estado'] ?? null;
    if (!in_array($estado, ['registrado','anulado'], true)) { http_response_code(400); echo json_encode(['error'=>'estado inválido']); exit; }
    $stmt = $conn->prepare('UPDATE pagos SET estado = ? WHERE id = ?');
    $stmt->bind_param('si', $estado, $id);
    if (!$stmt->execute()) { http_response_code(500); echo json_encode(['error'=>'No se pudo actualizar pago']); exit; }
    echo json_encode(['ok'=>true]);
    exit;
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare('DELETE FROM pagos WHERE id = ?');
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) { http_response_code(500); echo json_encode(['error'=>'No se pudo eliminar pago']); exit; }
    echo json_encode(['ok'=>true]);
    exit;
}

echo json_encode(['error'=>'Método no soportado']);
