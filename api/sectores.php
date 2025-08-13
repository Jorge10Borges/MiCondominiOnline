<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Max-Age: 86400');


require_once 'auth.php';
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$usuario = validar_jwt();

// Solo superusuario, admin y root pueden gestionar sectores
if (!in_array($usuario->rol, ['superusuario', 'admin', 'root'])) {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permisos para gestionar sectores']);
    exit;
}

$conn = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $orgId = isset($_GET['organizacion_id']) ? intval($_GET['organizacion_id']) : 0;
    if ($orgId <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de organización requerido']);
        exit;
    }
    $stmt = $conn->prepare('SELECT id, organizacion_id, nombre, tipo, numero_unidades FROM sectores WHERE organizacion_id = ?');
    $stmt->bind_param('i', $orgId);
    $stmt->execute();
    $result = $stmt->get_result();
    $sectores = [];
    while ($row = $result->fetch_assoc()) {
        $sectores[] = $row;
    }
    echo json_encode(['sectores' => $sectores]);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['organizacion_id']) || !isset($data['nombre'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos incompletos']);
        exit;
    }
    $stmt = $conn->prepare('INSERT INTO sectores (organizacion_id, nombre, tipo, numero_unidades) VALUES (?, ?, ?, ?)');
    $tipo = isset($data['tipo']) ? $data['tipo'] : '';
    $numero_unidades = isset($data['numero_unidades']) ? intval($data['numero_unidades']) : 0;
    $stmt->bind_param('issi', $data['organizacion_id'], $data['nombre'], $tipo, $numero_unidades);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al crear sector']);
    }
    exit;
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id']) || $data['id'] === '' || !isset($data['nombre']) || $data['nombre'] === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Datos incompletos']);
        exit;
    }
    $stmt = $conn->prepare('UPDATE sectores SET nombre = ?, tipo = ?, numero_unidades = ? WHERE id = ?');
    $tipo = isset($data['tipo']) ? $data['tipo'] : '';
    $numero_unidades = isset($data['numero_unidades']) ? intval($data['numero_unidades']) : 0;
    $stmt->bind_param('ssii', $data['nombre'], $tipo, $numero_unidades, $data['id']);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al actualizar sector']);
    }
    exit;
}

if ($method === 'DELETE') {
    // Espera id por query string: sectores.php?id=123
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de sector requerido']);
        exit;
    }
    // Verificar si existen unidades asociadas
    $check = $conn->prepare('SELECT COUNT(*) as total FROM unidades WHERE sector_id = ?');
    $check->bind_param('i', $id);
    $check->execute();
    $result = $check->get_result();
    $row = $result->fetch_assoc();
    if ($row['total'] > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'No se puede eliminar el sector porque tiene unidades asociadas.']);
        exit;
    }
    // Eliminar sector
    $del = $conn->prepare('DELETE FROM sectores WHERE id = ?');
    $del->bind_param('i', $id);
    if ($del->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al eliminar sector']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no soportado']);
exit;
