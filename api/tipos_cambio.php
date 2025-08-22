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

// GET: obtener la tasa vigente para fecha/hora dada (o ahora), y opcionalmente histórico
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $moneda = isset($_GET['moneda']) ? strtoupper(trim($_GET['moneda'])) : '';
    $momento = isset($_GET['momento']) ? trim($_GET['momento']) : null; // 'YYYY-MM-DD HH:MM:SS'
    $historico = isset($_GET['historico']) ? (intval($_GET['historico']) === 1) : false;

    if (!in_array($moneda, ['USD','VES','EUR'])) { http_response_code(400); echo json_encode(['error'=>'Moneda inválida']); exit; }

    if ($historico) {
        $stmt = $conn->prepare('SELECT id, moneda, usd_por_unidad, fuente, efectivo_desde, created_at FROM tipos_cambio WHERE moneda = ? ORDER BY efectivo_desde DESC');
        $stmt->bind_param('s', $moneda);
        $stmt->execute();
        $res = $stmt->get_result();
        $items = [];
        while ($row = $res->fetch_assoc()) { $items[] = $row; }
        echo json_encode(['tipos_cambio' => $items]);
        exit;
    }

    // Vigente al momento
    if (!$momento) { $momento = date('Y-m-d H:i:s'); }
    $stmt = $conn->prepare('SELECT moneda, usd_por_unidad, fuente, efectivo_desde FROM tipos_cambio WHERE moneda = ? AND efectivo_desde <= ? ORDER BY efectivo_desde DESC LIMIT 1');
    $stmt->bind_param('ss', $moneda, $momento);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    if (!$row) { http_response_code(404); echo json_encode(['error'=>'No hay tasa vigente para el momento indicado']); exit; }
    echo json_encode(['tasa' => $row]);
    exit;
}

// POST: registrar nueva tasa con vigencia (intradía)
$input = json_decode(file_get_contents('php://input'), true) ?? [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $moneda = strtoupper(trim($input['moneda'] ?? ''));
    $usd_por_unidad = isset($input['usd_por_unidad']) ? floatval($input['usd_por_unidad']) : 0;
    $efectivo_desde = trim($input['efectivo_desde'] ?? ''); // 'YYYY-MM-DD HH:MM:SS'
    $fuente = trim($input['fuente'] ?? 'manual');

    if (!in_array($moneda, ['USD','VES','EUR'])) { http_response_code(400); echo json_encode(['error'=>'Moneda inválida']); exit; }
    if ($usd_por_unidad <= 0) { http_response_code(400); echo json_encode(['error'=>'usd_por_unidad debe ser > 0']); exit; }
    if (!$efectivo_desde || !preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $efectivo_desde)) { http_response_code(400); echo json_encode(['error'=>'efectivo_desde inválido']); exit; }

    $stmt = $conn->prepare('INSERT INTO tipos_cambio (moneda, usd_por_unidad, fuente, efectivo_desde) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('sdss', $moneda, $usd_por_unidad, $fuente, $efectivo_desde);
    if (!$stmt->execute()) { http_response_code(500); echo json_encode(['error'=>'No se pudo registrar la tasa']); exit; }
    echo json_encode(['ok'=>true, 'id'=>$stmt->insert_id]);
    exit;
}

echo json_encode(['error'=>'Método no soportado']);
