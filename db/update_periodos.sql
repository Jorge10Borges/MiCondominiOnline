-- Tablas para gestión de cierre preliminar de períodos y snapshots de gastos

CREATE TABLE IF NOT EXISTS periodos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizacion_id INT NOT NULL,
  periodo CHAR(7) NOT NULL, -- YYYY-MM
  estado ENUM('abierto','pre_cerrado','cerrado') NOT NULL DEFAULT 'abierto',
  total_gastos_usd DECIMAL(18,2) NULL,
  total_gastos_items INT NULL,
  tasa_usd_ves_base DECIMAL(18,8) NULL,
  snapshot_hash CHAR(64) NULL,
  reporte_validacion JSON NULL,
  pre_cerrado_at DATETIME NULL,
  pre_cerrado_por INT NULL,
  reabierto_at DATETIME NULL,
  reabierto_por INT NULL,
  cerrado_at DATETIME NULL,
  cerrado_por INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_periodo (organizacion_id, periodo),
  KEY idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS periodo_gastos_snapshot (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  periodo_id INT NOT NULL,
  gasto_id INT NOT NULL,
  categoria VARCHAR(50) NULL,
  subcategoria VARCHAR(50) NULL,
  descripcion VARCHAR(255) NULL,
  moneda_original VARCHAR(10) NULL,
  monto_original DECIMAL(18,2) NULL,
  monto_usd DECIMAL(18,4) NOT NULL,
  proveedor VARCHAR(150) NULL,
  fecha DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_periodo (periodo_id),
  KEY idx_categoria (categoria),
  KEY idx_subcategoria (subcategoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- (Opcional, depende de existencia de tabla unidades)
CREATE TABLE IF NOT EXISTS periodo_unidades_snapshot (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  periodo_id INT NOT NULL,
  unidad_id INT NOT NULL,
  coeficiente DECIMAL(18,8) NULL,           -- Valor usado para prorrateo (usaremos alicuota)
  alicuota DECIMAL(18,8) NULL,              -- Alicuota original (%) almacenada para auditoría
  activa TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_periodo (periodo_id),
  KEY idx_unidad (unidad_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
