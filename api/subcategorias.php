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
    $codigo_cat = isset($_GET['codigo_cat']) ? strtoupper(trim($_GET['codigo_cat'])) : null;
    $sql = 'SELECT s.codigo_subcat, s.nombre, s.codigo_cat, c.nombre AS categoria_nombre FROM subcategorias s JOIN categorias c ON c.codigo_cat = s.codigo_cat';
    $params = [];
    if ($codigo_cat) { $sql .= ' WHERE s.codigo_cat = ?'; }
    $sql .= ' ORDER BY s.codigo_cat, s.nombre';
    $stmt = $conn->prepare($sql);
    if ($codigo_cat) { $stmt->bind_param('s', $codigo_cat); }
    $stmt->execute();
    $res = $stmt->get_result();
    $items = [];
    while ($row = $res->fetch_assoc()) { $items[] = $row; }
    echo json_encode(['subcategorias' => $items]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $codigo_subcat = strtoupper(trim($input['codigo_subcat'] ?? ''));
    $nombre = trim($input['nombre'] ?? '');
    $codigo_cat = strtoupper(trim($input['codigo_cat'] ?? ''));

    // Validaciones básicas
    if (!$codigo_cat || strlen($codigo_cat) !== 2) { http_response_code(400); echo json_encode(['error'=>'codigo_cat inválido']); exit; }
    if (!$codigo_subcat || !preg_match('/^[A-Z]{2}-[A-Z0-9]{2,4}$/', $codigo_subcat)) { http_response_code(400); echo json_encode(['error'=>'codigo_subcat inválido']); exit; }
    if (strpos($codigo_subcat, $codigo_cat.'-') !== 0) { http_response_code(400); echo json_encode(['error'=>'codigo_subcat no pertenece a la categoría']); exit; }
    if (!$nombre) { http_response_code(400); echo json_encode(['error'=>'nombre requerido']); exit; }

    // Upsert
    $stmt = $conn->prepare('INSERT INTO subcategorias (codigo_subcat, nombre, codigo_cat) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), codigo_cat = VALUES(codigo_cat)');
    $stmt->bind_param('sss', $codigo_subcat, $nombre, $codigo_cat);
    if (!$stmt->execute()) { http_response_code(500); echo json_encode(['error'=>'No se pudo guardar subcategoría']); exit; }
    echo json_encode(['ok'=>true]);
    exit;
}

echo json_encode(['error'=>'Método no soportado']);
