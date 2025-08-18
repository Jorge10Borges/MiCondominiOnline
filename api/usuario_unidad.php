<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';
require_once 'auth.php';

// Validar JWT
$usuario = validar_jwt();
if (!in_array($usuario->rol, ['superusuario', 'admin', 'root'])) {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permisos para asignar usuarios a unidades']);
    exit;
}

$conn = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Payload inválido']);
        exit;
    }
    $usuario_id = isset($input['usuario_id']) ? intval($input['usuario_id']) : 0;
    $unidad_id = isset($input['unidad_id']) ? intval($input['unidad_id']) : 0;
    if ($usuario_id <= 0 || $unidad_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'usuario_id y unidad_id son requeridos']);
        exit;
    }

    // Verificar existencia de usuario y unidad
    $stmt = $conn->prepare('SELECT id FROM usuarios WHERE id = ?');
    $stmt->bind_param('i', $usuario_id);
    $stmt->execute();
    $res = $stmt->get_result();
    if (!$res->fetch_assoc()) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuario no encontrado']);
        exit;
    }
    $stmt->close();

    $stmt = $conn->prepare('SELECT id FROM unidades WHERE id = ?');
    $stmt->bind_param('i', $unidad_id);
    $stmt->execute();
    $res = $stmt->get_result();
    if (!$res->fetch_assoc()) {
        http_response_code(404);
        echo json_encode(['error' => 'Unidad no encontrada']);
        exit;
    }
    $stmt->close();

    // Evitar duplicados: comprobar si ya existe la relación
    $stmt = $conn->prepare('SELECT 1 FROM usuario_unidad WHERE usuario_id = ? AND unidad_id = ? LIMIT 1');
    $stmt->bind_param('ii', $usuario_id, $unidad_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $exists = (bool) $res->fetch_row();
    $stmt->close();

    if ($exists) {
        echo json_encode(['ok' => true, 'assigned' => false, 'message' => 'El usuario ya está asignado a la unidad']);
        exit;
    }

    // Insertar relación
    $stmt = $conn->prepare('INSERT INTO usuario_unidad (usuario_id, unidad_id) VALUES (?, ?)');
    $stmt->bind_param('ii', $usuario_id, $unidad_id);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['error' => 'No se pudo asignar el usuario a la unidad']);
        exit;
    }
    $stmt->close();

    echo json_encode(['ok' => true, 'assigned' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
?>
