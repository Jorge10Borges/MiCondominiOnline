<?php
require_once 'config.php';
require_once 'vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function validar_jwt() {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Token no proporcionado']);
        exit;
    }
    $authHeader = $headers['Authorization'];
    if (strpos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Formato de token inválido']);
        exit;
    }
    $token = substr($authHeader, 7);
    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        return $decoded;
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['error' => 'Token inválido o expirado', 'detalle' => $e->getMessage()]);
        exit;
    }
}
