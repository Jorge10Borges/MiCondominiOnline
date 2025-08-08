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

// Ejemplo: solo superusuario y admin pueden consultar organizaciones
if (!in_array($usuario->rol, ['superusuario', 'admin', 'root'])) {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permisos para ver organizaciones']);
    exit;
}

$conn = get_db_connection();
$result = $conn->query('SELECT * FROM organizaciones');
$organizaciones = [];
while ($row = $result->fetch_assoc()) {
    $organizaciones[] = $row;
}

// Respuesta
echo json_encode([
    'organizaciones' => $organizaciones,
    'usuario' => [
        'id' => $usuario->id,
        'email' => $usuario->email,
        'rol' => $usuario->rol
    ]
]);
