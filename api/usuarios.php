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
require_once 'email_service.php';

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

// Crear usuario (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Payload inválido']);
        exit;
    }
    $nombre = isset($input['nombre']) ? trim($input['nombre']) : '';
    $email = isset($input['email']) ? trim($input['email']) : '';
    $dni = isset($input['dni']) ? trim($input['dni']) : '';
    $password = isset($input['password']) ? (string)$input['password'] : ($dni ?: generateTemporaryPassword());
    // Rol por política: usuarios creados desde aquí deben ser 'propietario'
    $rol = isset($input['rol']) ? trim($input['rol']) : 'propietario';
    $rolesPermitidos = ['root','superusuario','admin','propietario'];
    if (!in_array($rol, $rolesPermitidos, true)) {
        $rol = 'propietario';
    }

    if ($nombre === '' || $email === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Nombre y email son requeridos']);
        exit;
    }

    // Verificar email único
    $stmt = $conn->prepare('SELECT id FROM usuarios WHERE email = ? LIMIT 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->fetch_assoc()) {
        http_response_code(409);
        echo json_encode(['error' => 'El email ya está registrado']);
        exit;
    }
    $stmt->close();

    $hash = password_hash($password, PASSWORD_DEFAULT);
    // Intentar insertar con columnas condicionales según existan en la tabla
    $columns = ['nombre', 'email', 'password', 'rol', 'activo'];
    $placeholders = ['?', '?', '?', '?', '1'];
    $types = 'ssss';
    $params = [$nombre, $email, $hash, $rol];

    // Verificar si existe columna dni
    $hasDni = false;
    if ($result = $conn->query("SHOW COLUMNS FROM usuarios LIKE 'dni'")) {
        $hasDni = $result->num_rows > 0;
        $result->close();
    }
    if ($hasDni) {
        $columns[] = 'dni';
        $placeholders[] = '?';
        $types .= 's';
        $params[] = $dni;
    }

    // Forzar cambio de contraseña en primer inicio si existe la columna must_change_password
    $hasMustChange = false;
    if ($result = $conn->query("SHOW COLUMNS FROM usuarios LIKE 'must_change_password'")) {
        $hasMustChange = $result->num_rows > 0;
        $result->close();
    }
    if ($hasMustChange) {
        $columns[] = 'must_change_password';
        $placeholders[] = '1';
    }
    $sql = "INSERT INTO usuarios (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $placeholders) . ")";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['error' => 'No se pudo crear el usuario']);
        exit;
    }
    $newId = $stmt->insert_id;
    $stmt->close();

    $stmt = $conn->prepare('SELECT id, nombre, email, rol FROM usuarios WHERE id = ?');
    $stmt->bind_param('i', $newId);
    $stmt->execute();
    $res = $stmt->get_result();
    $user = $res->fetch_assoc();
    $stmt->close();
    // Enviar contraseña temporal por correo (mejor no bloquear si falla el email)
    $emailRes = sendTemporaryPasswordEmail($email, $nombre, $password);
    echo json_encode(['ok' => true, 'usuario' => $user, 'email_enviado' => $emailRes['ok']]);
    exit;
}

// Búsqueda rápida por email: devuelve {existe: bool, usuario?: {...}}
if (isset($_GET['email'])) {
    $email = trim($_GET['email']);
    if ($email === '') {
        echo json_encode(['existe' => false]);
        exit;
    }
    $stmt = $conn->prepare('SELECT id, nombre, email, rol FROM usuarios WHERE email = ? LIMIT 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $res = $stmt->get_result();
    $user = $res->fetch_assoc();
    $stmt->close();
    echo json_encode($user ? ['existe' => true, 'usuario' => $user] : ['existe' => false]);
    exit;
}

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
