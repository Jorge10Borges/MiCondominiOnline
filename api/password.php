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
require_once 'vendor/autoload.php';
require_once 'auth.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$conn = get_db_connection();

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$old = (string)($data['old_password'] ?? '');
$new = (string)($data['new_password'] ?? '');

if ($email === '' || $new === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

// Obtener usuario
$stmt = $conn->prepare('SELECT id, email, password FROM usuarios WHERE email = ? AND activo = 1 LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Usuario no encontrado']);
    exit;
}
$user = $res->fetch_assoc();
$stmt->close();

// Si se envía old_password, verificarla; si no, permitir cambio si la bandera must_change_password existe y está en 1
$mustCheckOld = $old !== '';
if (!$mustCheckOld) {
    // evaluar must_change_password si existe
    $hasMust = false; $mustVal = 0;
    if ($result = $conn->query("SHOW COLUMNS FROM usuarios LIKE 'must_change_password'")) {
        $hasMust = $result->num_rows > 0; $result->close();
    }
    if ($hasMust) {
        $stmt = $conn->prepare('SELECT must_change_password FROM usuarios WHERE id = ?');
        $stmt->bind_param('i', $user['id']);
        $stmt->execute();
        $rs = $stmt->get_result();
        $row = $rs->fetch_assoc();
        $mustVal = (int)($row['must_change_password'] ?? 0);
        $stmt->close();
        if ($mustVal !== 1) {
            http_response_code(400);
            echo json_encode(['error' => 'Se requiere la contraseña actual']);
            exit;
        }
    } else {
        // No existe must_change_password y no se envió old_password
        http_response_code(400);
        echo json_encode(['error' => 'Se requiere la contraseña actual']);
        exit;
    }
} else {
    if (!password_verify($old, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Contraseña actual incorrecta']);
        exit;
    }
}

// Actualizar contraseña y limpiar bandera must_change_password si existe
$hash = password_hash($new, PASSWORD_DEFAULT);
$hasMust = false; $hasChangedAt = false;
if ($result = $conn->query("SHOW COLUMNS FROM usuarios LIKE 'must_change_password'")) { $hasMust = $result->num_rows > 0; $result->close(); }
if ($result = $conn->query("SHOW COLUMNS FROM usuarios LIKE 'password_changed_at'")) { $hasChangedAt = $result->num_rows > 0; $result->close(); }

$sql = 'UPDATE usuarios SET password = ?';
$types = 's';
$params = [$hash];
if ($hasMust) { $sql .= ', must_change_password = 0'; }
if ($hasChangedAt) { $sql .= ', password_changed_at = NOW()'; }
$sql .= ' WHERE id = ?';
$types .= 'i';
$params[] = $user['id'];

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo actualizar la contraseña']);
    exit;
}
$stmt->close();

echo json_encode(['ok' => true]);
