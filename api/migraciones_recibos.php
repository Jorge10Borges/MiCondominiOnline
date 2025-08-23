<?php
header('Content-Type: application/json');
require_once 'config.php';

$conn = get_db_connection();
$conn->autocommit(true);

$statements = [];

$statements[] = "CREATE TABLE IF NOT EXISTS periodos (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  organizacion_id INT NOT NULL,\n  periodo CHAR(7) NOT NULL,\n  estado ENUM('abierto','pre_cerrado','cerrado') NOT NULL DEFAULT 'abierto',\n  total_gastos_usd DECIMAL(18,2) NULL,\n  total_gastos_items INT NULL,\n  tasa_usd_ves_base DECIMAL(18,8) NULL,\n  snapshot_hash CHAR(64) NULL,\n  reporte_validacion JSON NULL,\n  pre_cerrado_at DATETIME NULL,\n  pre_cerrado_por INT NULL,\n  reabierto_at DATETIME NULL,\n  reabierto_por INT NULL,\n  cerrado_at DATETIME NULL,\n  cerrado_por INT NULL,\n  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,\n  UNIQUE KEY uniq_periodo (organizacion_id, periodo),\n  KEY idx_estado (estado)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

$statements[] = "CREATE TABLE IF NOT EXISTS periodo_gastos_snapshot (\n  id BIGINT AUTO_INCREMENT PRIMARY KEY,\n  periodo_id INT NOT NULL,\n  gasto_id INT NOT NULL,\n  categoria VARCHAR(50) NULL,\n  subcategoria VARCHAR(50) NULL,\n  descripcion VARCHAR(255) NULL,\n  moneda_original VARCHAR(10) NULL,\n  monto_original DECIMAL(18,2) NULL,\n  monto_usd DECIMAL(18,4) NOT NULL,\n  proveedor VARCHAR(150) NULL,\n  fecha DATE NOT NULL,\n  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  KEY idx_periodo (periodo_id),\n  KEY idx_categoria (categoria),\n  KEY idx_subcategoria (subcategoria)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

$statements[] = "CREATE TABLE IF NOT EXISTS periodo_unidades_snapshot (\n  id BIGINT AUTO_INCREMENT PRIMARY KEY,\n  periodo_id INT NOT NULL,\n  unidad_id INT NOT NULL,\n  coeficiente DECIMAL(18,8) NULL,\n  activa TINYINT(1) NOT NULL DEFAULT 1,\n  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  KEY idx_periodo (periodo_id),\n  KEY idx_unidad (unidad_id)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

$statements[] = "CREATE TABLE IF NOT EXISTS periodo_cargos_unidad (\n  id BIGINT AUTO_INCREMENT PRIMARY KEY,\n  periodo_id INT NOT NULL,\n  unidad_id INT NOT NULL,\n  gasto_snapshot_id BIGINT NULL,\n  tipo_fuente ENUM('gasto','ajuste') NOT NULL DEFAULT 'gasto',\n  subcategoria VARCHAR(50) NULL,\n  descripcion VARCHAR(255) NULL,\n  monto_usd DECIMAL(18,4) NOT NULL,\n  coeficiente_utilizado DECIMAL(18,8) NULL,\n  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  KEY idx_periodo (periodo_id),\n  KEY idx_unidad (unidad_id),\n  KEY idx_gasto (gasto_snapshot_id),\n  KEY idx_subcat (subcategoria)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

$statements[] = "CREATE TABLE IF NOT EXISTS recibos (\n  id BIGINT AUTO_INCREMENT PRIMARY KEY,\n  periodo_id INT NOT NULL,\n  organizacion_id INT NOT NULL,\n  unidad_id INT NOT NULL,\n  numero INT NOT NULL,\n  monto_total_usd DECIMAL(18,4) NOT NULL,\n  tasa_ves_usd_emision DECIMAL(18,8) NULL,\n  estado ENUM('emitido','anulado','pagado_parcial','pagado_total') NOT NULL DEFAULT 'emitido',\n  emitido_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  emitido_por INT NULL,\n  anulado_at DATETIME NULL,\n  anulado_por INT NULL,\n  motivo_anulacion VARCHAR(255) NULL,\n  pagado_total_at DATETIME NULL,\n  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,\n  UNIQUE KEY uniq_recibo_unidad_periodo (periodo_id, unidad_id),\n  UNIQUE KEY uniq_org_numero (organizacion_id, numero),\n  KEY idx_periodo (periodo_id),\n  KEY idx_org (organizacion_id),\n  KEY idx_estado (estado),\n  KEY idx_unidad (unidad_id)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

$statements[] = "CREATE TABLE IF NOT EXISTS recibo_detalles (\n  id BIGINT AUTO_INCREMENT PRIMARY KEY,\n  recibo_id BIGINT NOT NULL,\n  periodo_id INT NOT NULL,\n  unidad_id INT NOT NULL,\n  cargo_unidad_id BIGINT NULL,\n  gasto_snapshot_id BIGINT NULL,\n  subcategoria VARCHAR(50) NULL,\n  descripcion VARCHAR(255) NULL,\n  monto_usd DECIMAL(18,4) NOT NULL,\n  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  KEY idx_recibo (recibo_id),\n  KEY idx_periodo (periodo_id),\n  KEY idx_unidad (unidad_id),\n  KEY idx_cargo (cargo_unidad_id),\n  KEY idx_gasto (gasto_snapshot_id),\n  KEY idx_subcat (subcategoria)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

$statements[] = "CREATE TABLE IF NOT EXISTS pagos_recibos (\n  id BIGINT AUTO_INCREMENT PRIMARY KEY,\n  recibo_id BIGINT NOT NULL,\n  periodo_id INT NOT NULL,\n  organizacion_id INT NOT NULL,\n  monto_usd DECIMAL(18,4) NOT NULL,\n  referencia VARCHAR(120) NULL,\n  metodo ENUM('transferencia','efectivo','pago_movil','tarjeta','otro') NULL,\n  observacion VARCHAR(255) NULL,\n  creado_por INT NULL,\n  creado_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  anulado TINYINT(1) NOT NULL DEFAULT 0,\n  anulado_at DATETIME NULL,\n  anulado_por INT NULL,\n  KEY idx_recibo (recibo_id),\n  KEY idx_periodo (periodo_id),\n  KEY idx_org (organizacion_id),\n  KEY idx_anulado (anulado),\n  KEY idx_referencia (referencia)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

$results = [];
foreach ($statements as $sql) {
    if ($conn->query($sql) === true) {
        $results[] = ['sql' => substr($sql,0,60).'...', 'ok' => true];
    } else {
        $results[] = ['sql' => substr($sql,0,60).'...', 'ok' => false, 'error' => $conn->error];
    }
}

// Asegurar columna alicuota en periodo_unidades_snapshot (puede existir sin ella de versiones previas)
$colCheck = $conn->query("SHOW COLUMNS FROM periodo_unidades_snapshot LIKE 'alicuota'");
if ($colCheck && $colCheck->num_rows === 0) {
    $alter = "ALTER TABLE periodo_unidades_snapshot ADD COLUMN alicuota DECIMAL(18,8) NULL AFTER coeficiente";
    if ($conn->query($alter) === true) {
        $results[] = ['sql'=>'ALTER periodo_unidades_snapshot add alicuota','ok'=>true];
    } else {
        $results[] = ['sql'=>'ALTER periodo_unidades_snapshot add alicuota','ok'=>false,'error'=>$conn->error];
    }
}

echo json_encode(['ok'=>true,'results'=>$results]);