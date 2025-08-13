<?php
require_once 'CORS.php'; // Include CORS headers

// api/usuarios.php

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

$usuario = null;
try {
    $usuario = validar_jwt();
    // Si el token está expirado o inválido, validar_jwt debe lanzar una excepción
    if (!$usuario || !isset($usuario->rol)) {
        header('Location: /administracion/micondominionline/index.html');
        exit;
    }
} catch (Exception $e) {
    header('Location: /administracion/micondominionline/index.html');
    exit;
}

// Solo superusuario, admin y root pueden consultar usuarios
if (!in_array($usuario->rol, ['superusuario', 'admin', 'root'])) {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permisos para ver usuarios']);
    exit;
}

// Validar JWT si lo usas
// $usuario = validar_jwt();

$conn = get_db_connection();

$filtroRol = $_GET['rol'] ?? '';
$filtroOrg = $_GET['organizacion'] ?? '';

$sql = "SELECT u.id, u.nombre, u.email, u.rol, o.nombre AS organizacion_nombre
        FROM usuarios u
        JOIN usuario_organizacion uo ON u.id = uo.usuario_id
        JOIN organizaciones o ON uo.organizacion_id = o.id
        WHERE 1=1";
$params = [];
$types = '';

if ($filtroRol) {
    $sql .= " AND u.rol = ?";
    $params[] = $filtroRol;
    $types .= 's';
}
if ($filtroOrg) {
    $sql .= " AND o.nombre = ?";
    $params[] = $filtroOrg;
    $types .= 's';
}

$stmt = $conn->prepare($sql . " ORDER BY u.nombre ASC");
if ($params) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();
$usuarios = [];
while ($row = $result->fetch_assoc()) {
    // Asegura que los campos requeridos existan para el frontend
    $row['nombre'] = $row['nombre'] ?? '';
    $row['email'] = $row['email'] ?? '';
    $row['rol'] = $row['rol'] ?? '';
    $row['organizacion_nombre'] = $row['organizacion_nombre'] ?? '';
    $usuarios[] = $row;
}
$stmt->close();
$conn->close();

echo json_encode($usuarios);
