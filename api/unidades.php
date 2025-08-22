<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS, DELETE');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
require_once 'config.php';
require_once 'auth.php';

// Validar JWT
$usuario = validar_jwt();

// Solo superusuario, admin y root pueden consultar unidades
if (!in_array($usuario->rol, ['superusuario', 'admin', 'root'])) {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permisos para ver unidades']);
    exit;
}

$conn = get_db_connection();

// Crear/Actualizar unidad (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Payload inválido']);
        exit;
    }

    $id = isset($input['id']) ? intval($input['id']) : null;
    $sector_id = isset($input['sector_id']) ? intval($input['sector_id']) : null;
    $numero_orden = isset($input['numero_orden']) ? intval($input['numero_orden']) : null;
    $identificador = isset($input['identificador']) ? trim($input['identificador']) : '';
    // Campos según la tabla unidades real
    $propietario = array_key_exists('propietario', $input) ? trim((string)$input['propietario']) : null;
    $dni = array_key_exists('dni', $input) ? trim((string)$input['dni']) : null;
    $telefono = array_key_exists('telefono', $input) ? trim((string)$input['telefono']) : null;
    $alicuota = array_key_exists('alicuota', $input) ? floatval($input['alicuota']) : null;

    if ($identificador === '') {
        http_response_code(400);
        echo json_encode(['error' => 'El identificador es requerido']);
        exit;
    }

    if (!$id && (!$sector_id || !$numero_orden)) {
        http_response_code(400);
        echo json_encode(['error' => 'sector_id y numero_orden son requeridos para crear']);
        exit;
    }

    // Si hay id, actualizar directo; si no, upsert por (sector_id, numero_orden)
    if ($id) {
        // Construir actualización dinámica según campos presentes
        $sets = ['identificador = ?'];
        $types = 's';
        $params = [$identificador];
        if ($propietario !== null) { $sets[] = 'propietario = ?'; $types .= 's'; $params[] = $propietario; }
        if ($dni !== null) { $sets[] = 'dni = ?'; $types .= 's'; $params[] = $dni; }
        if ($telefono !== null) { $sets[] = 'telefono = ?'; $types .= 's'; $params[] = $telefono; }
        if ($alicuota !== null) { $sets[] = 'alicuota = ?'; $types .= 'd'; $params[] = $alicuota; }
        $types .= 'i';
        $params[] = $id;
        $sql = 'UPDATE unidades SET ' . implode(', ', $sets) . ' WHERE id = ?';
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        if (!$stmt->execute()) {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo actualizar la unidad']);
            exit;
        }
        $stmt->close();
    } else {
        // Buscar si ya existe una unidad para ese slot
        $stmt = $conn->prepare('SELECT id FROM unidades WHERE sector_id = ? AND numero_orden = ? LIMIT 1');
        $stmt->bind_param('ii', $sector_id, $numero_orden);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        $stmt->close();
        if ($row) {
            $id = intval($row['id']);
            // Actualizar existente
            $sets = ['identificador = ?'];
            $types = 's';
            $params = [$identificador];
            if ($propietario !== null) { $sets[] = 'propietario = ?'; $types .= 's'; $params[] = $propietario; }
            if ($dni !== null) { $sets[] = 'dni = ?'; $types .= 's'; $params[] = $dni; }
            if ($telefono !== null) { $sets[] = 'telefono = ?'; $types .= 's'; $params[] = $telefono; }
            if ($alicuota !== null) { $sets[] = 'alicuota = ?'; $types .= 'd'; $params[] = $alicuota; }
            $types .= 'i';
            $params[] = $id;
            $sql = 'UPDATE unidades SET ' . implode(', ', $sets) . ' WHERE id = ?';
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            if (!$stmt->execute()) {
                http_response_code(500);
                echo json_encode(['error' => 'No se pudo actualizar la unidad existente']);
                exit;
            }
            $stmt->close();
        } else {
            // Crear nueva unidad acorde al esquema actual
            $stmt = $conn->prepare('INSERT INTO unidades (identificador, estado, sector_id, numero_orden, propietario, dni, telefono, alicuota) VALUES (?, NULL, ?, ?, ?, ?, ?, ?)');
            $stmt->bind_param('siisssd', $identificador, $sector_id, $numero_orden, $propietario, $dni, $telefono, $alicuota);
            if (!$stmt->execute()) {
                http_response_code(500);
                echo json_encode(['error' => 'No se pudo crear la unidad']);
                exit;
            }
            $id = $stmt->insert_id;
            $stmt->close();
        }
    }

    // Obtener datos resultantes acorde al esquema actual, incluyendo usuario_email (si existe)
    $stmt = $conn->prepare('
        SELECT 
            u.id, u.sector_id, u.numero_orden, u.identificador, 
            u.propietario AS propietario_nombre, u.dni, u.telefono, u.alicuota,
            COALESCE(MAX(us.email), NULL) AS usuario_email
        FROM unidades u
        LEFT JOIN usuario_unidad uu ON uu.unidad_id = u.id
        LEFT JOIN usuarios us ON us.id = uu.usuario_id
        WHERE u.id = ?
        GROUP BY u.id
    ');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $res = $stmt->get_result();
    $out = $res->fetch_assoc();
    $stmt->close();

    echo json_encode(['ok' => true, 'unidad' => $out]);
    exit;
}

// Eliminar unidad (DELETE)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'id es requerido']);
        exit;
    }
    $id = intval($_GET['id']);
    // Eliminar en transacción: primero relaciones en usuario_unidad, luego la unidad
    $conn->begin_transaction();
    try {
        // Borrar relaciones usuario_unidad si existen
        $stmtRel = $conn->prepare('DELETE FROM usuario_unidad WHERE unidad_id = ?');
        $stmtRel->bind_param('i', $id);
        if (!$stmtRel->execute()) {
            throw new Exception('No se pudo eliminar relaciones usuario_unidad');
        }
        $stmtRel->close();

        // Borrar la unidad
        $stmt = $conn->prepare('DELETE FROM unidades WHERE id = ?');
        $stmt->bind_param('i', $id);
        if (!$stmt->execute()) {
            throw new Exception('No se pudo eliminar la unidad');
        }
        $stmt->close();

        $conn->commit();
        echo json_encode(['ok' => true]);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage() ?: 'Error al eliminar la unidad']);
    }
    exit;
}

// Si se pasa ?id=, devolver solo esa unidad
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare('
        SELECT 
            u.id, u.sector_id, u.numero_orden, u.identificador,
            u.propietario AS propietario_nombre, u.dni, u.telefono, u.alicuota,
            COALESCE(MAX(us.email), NULL) AS usuario_email
        FROM unidades u
        LEFT JOIN usuario_unidad uu ON uu.unidad_id = u.id
        LEFT JOIN usuarios us ON us.id = uu.usuario_id
        WHERE u.id = ?
        GROUP BY u.id
    ');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $unidad = $result->fetch_assoc();
    if ($unidad) {
        echo json_encode(['unidad' => $unidad]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Unidad no encontrada']);
    }
    exit;
}

// Filtrar por sector_id si se proporciona
if (isset($_GET['sector_id'])) {
    $sector_id = intval($_GET['sector_id']);
    $stmt = $conn->prepare('
        SELECT 
            u.id, u.sector_id, u.numero_orden, u.identificador, u.telefono, u.alicuota,
            u.propietario AS propietario_nombre, u.dni,
            COALESCE(MAX(us.email), NULL) AS usuario_email
        FROM unidades u
        LEFT JOIN usuario_unidad uu ON uu.unidad_id = u.id
        LEFT JOIN usuarios us ON us.id = uu.usuario_id
        WHERE u.sector_id = ?
        GROUP BY u.id
    ');
    $stmt->bind_param('i', $sector_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $unidades = [];
    while ($row = $result->fetch_assoc()) {
        $unidades[] = $row;
    }
    $stmt->close();
} else if (isset($_GET['organizacion_id'])) {
    $organizacion_id = intval($_GET['organizacion_id']);
    $stmt = $conn->prepare('
        SELECT 
            u.id, u.sector_id, u.numero_orden, u.identificador, 
            u.propietario AS propietario_nombre, u.dni, u.telefono, u.alicuota,
            COALESCE(MAX(us.email), NULL) AS usuario_email
        FROM unidades u
        INNER JOIN sectores s ON u.sector_id = s.id
        LEFT JOIN usuario_unidad uu ON uu.unidad_id = u.id
        LEFT JOIN usuarios us ON us.id = uu.usuario_id
        WHERE s.organizacion_id = ?
        GROUP BY u.id
    ');
    $stmt->bind_param('i', $organizacion_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $unidades = [];
    while ($row = $result->fetch_assoc()) {
        $unidades[] = $row;
    }
    $stmt->close();
} else {
    $result = $conn->query('SELECT 
            u.id, u.sector_id, u.numero_orden, u.identificador,
            u.propietario AS propietario_nombre, u.dni, u.telefono, u.alicuota,
            COALESCE(MAX(us.email), NULL) AS usuario_email
        FROM unidades u
        LEFT JOIN usuario_unidad uu ON uu.unidad_id = u.id
        LEFT JOIN usuarios us ON us.id = uu.usuario_id
        GROUP BY u.id');
    $unidades = [];
    while ($row = $result->fetch_assoc()) {
        $unidades[] = $row;
    }
}

// Respuesta
echo json_encode([
    'unidades' => $unidades,
    'usuario' => [
        'id' => $usuario->id,
        'email' => $usuario->email,
        'rol' => $usuario->rol
    ]
]);
