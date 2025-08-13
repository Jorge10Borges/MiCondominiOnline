<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Max-Age: 86400');


// api/verificar_usuario.php
header('Content-Type: application/json');
require_once 'config.php';

$email = $_GET['email'] ?? '';
if (!$email) {
    echo json_encode(['existe' => false, 'error' => 'Email requerido']);
    exit;
}

$stmt = $conn->prepare('SELECT id FROM usuarios WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['existe' => true]);
} else {
    echo json_encode(['existe' => false]);
}
$stmt->close();
$conn->close();
