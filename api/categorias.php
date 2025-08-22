<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once 'config.php';
require_once 'auth.php';

$usuario = validar_jwt();
if (!in_array($usuario->rol, ['superusuario','admin','root'])) {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$conn = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $res = $conn->query('SELECT codigo_cat, nombre FROM categorias ORDER BY nombre');
    $items = [];
    while ($row = $res->fetch_assoc()) { $items[] = $row; }
    echo json_encode(['categorias' => $items]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $codigo_cat = strtoupper(trim($input['codigo_cat'] ?? ''));
    $nombre = trim($input['nombre'] ?? '');
    if (!$codigo_cat || strlen($codigo_cat) !== 2 || !$nombre) { http_response_code(400); echo json_encode(['error'=>'Datos inválidos']); exit; }
    $stmt = $conn->prepare('INSERT INTO categorias (codigo_cat, nombre) VALUES (?, ?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)');
    $stmt->bind_param('ss', $codigo_cat, $nombre);
    if (!$stmt->execute()) { http_response_code(500); echo json_encode(['error'=>'No se pudo guardar categoría']); exit; }
    echo json_encode(['ok'=>true]);
    exit;
}

echo json_encode(['error'=>'Método no soportado']);
