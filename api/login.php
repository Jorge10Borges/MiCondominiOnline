<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
require_once 'config.php';
require_once 'vendor/autoload.php'; // JWT
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Clave secreta para JWT (define en config.php)
$jwt_secret = JWT_SECRET;

// Recibe email y password por POST
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Email y contraseña requeridos']);
    exit;
}

$conn = get_db_connection();
$stmt = $conn->prepare('SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ? AND activo = 1 LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario o contraseña incorrectos']);
    exit;
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario o contraseña incorrectos']);
    exit;
}

$payload = [
    'id' => $user['id'],
    'email' => $user['email'],
    'rol' => $user['rol'],
    'exp' => time() + 3600 // 1 hora
];
$token = JWT::encode($payload, $jwt_secret, 'HS256');

// Respuesta
echo json_encode([
    'token' => $token,
    'usuario' => [
        'id' => $user['id'],
        'nombre' => $user['nombre'],
        'email' => $user['email'],
        'rol' => $user['rol']
    ]
]);
