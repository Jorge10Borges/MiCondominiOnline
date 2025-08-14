<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
require_once 'config.php';
require_once 'auth.php';

// Validar JWT
$usuario = validar_jwt();

// Solo superusuario, admin y root pueden consultar unidades
if (!in_array($usuario->rol, ['superusuario', 'admin', 'root'])) {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permisos para ver unidades']);
    exit;
}

$conn = get_db_connection();

// Si se pasa ?id=, devolver solo esa unidad
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare('SELECT * FROM unidades WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $unidad = $result->fetch_assoc();
    if ($unidad) {
        echo json_encode(['unidad' => $unidad]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Unidad no encontrada']);
    }
    exit;
}

// Si se pasa ?organizacion_id=, devolver solo las unidades de esa organización (relacionando por sector)
if (isset($_GET['organizacion_id'])) {
    $organizacion_id = intval($_GET['organizacion_id']);
    $stmt = $conn->prepare('SELECT u.*, s.nombre AS sector, o.nombre AS organizacion FROM unidades u LEFT JOIN sectores s ON u.sector_id = s.id LEFT JOIN organizaciones o ON s.organizacion_id = o.id WHERE s.organizacion_id = ?');
    $stmt->bind_param('i', $organizacion_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $unidades = [];
    while ($row = $result->fetch_assoc()) {
        $unidades[] = $row;
    }
    $stmt->close();
} else {
    $result = $conn->query('SELECT u.*, s.nombre AS sector, o.nombre AS organizacion FROM unidades u LEFT JOIN sectores s ON u.sector_id = s.id LEFT JOIN organizaciones o ON s.organizacion_id = o.id');
    $unidades = [];
    while ($row = $result->fetch_assoc()) {
        $unidades[] = $row;
    }
}

// Respuesta
echo json_encode([
    'unidades' => $unidades,
    'usuario' => [
        'id' => $usuario->id,
        'email' => $usuario->email,
        'rol' => $usuario->rol
    ]
]);
