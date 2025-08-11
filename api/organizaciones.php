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

// Ejemplo: solo superusuario y admin pueden consultar organizaciones
if (!in_array($usuario->rol, ['superusuario', 'admin', 'root'])) {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permisos para ver organizaciones']);
    exit;
}


$conn = get_db_connection();

// PUT: editar organización
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos inválidos']);
        exit;
    }
    // Solo superusuario y admin pueden editar
    if (!in_array($usuario->rol, ['superusuario', 'admin', 'root'])) {
        http_response_code(403);
        echo json_encode(['error' => 'No tienes permisos para editar organizaciones']);
        exit;
    }
    $stmt = $conn->prepare('UPDATE organizaciones SET nombre=?, tipo=?, rif=?, direccion=?, telefonos=?, email=?, estado_licencia=?, fecha_expiracion=?, tipo_licencia=?, costo_licencia=? WHERE id=?');
    $stmt->bind_param(
        'ssssssssssi',
        $input['nombre'],
        $input['tipo'],
        $input['rif'],
        $input['direccion'],
        $input['telefonos'],
        $input['email'],
        $input['estado_licencia'],
        $input['fecha_expiracion'],
        $input['tipo_licencia'],
        $input['costo_licencia'],
        $id
    );
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar organización']);
    }
    exit;
}

// Si se pasa ?id=, devolver solo esa organización
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare('SELECT * FROM organizaciones WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $org = $result->fetch_assoc();
    if ($org) {
        echo json_encode(['organizacion' => $org]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Organización no encontrada']);
    }
    exit;
}

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
