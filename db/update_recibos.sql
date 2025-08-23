-- Tablas para emisión de recibos y almacenamiento de cargos por periodo

-- Cargos prorrateados por unidad antes de emitir recibos
CREATE TABLE IF NOT EXISTS periodo_cargos_unidad (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  periodo_id INT NOT NULL,
  unidad_id INT NOT NULL,
  gasto_snapshot_id BIGINT NULL,         -- Referencia al gasto del snapshot que originó el cargo (si aplica)
  tipo_fuente ENUM('gasto','ajuste') NOT NULL DEFAULT 'gasto',
  subcategoria VARCHAR(50) NULL,         -- Código de subcategoría (p.ej. MT-EL)
  descripcion VARCHAR(255) NULL,
  monto_usd DECIMAL(18,4) NOT NULL,      -- Monto asignado a esta unidad en USD
  coeficiente_utilizado DECIMAL(18,8) NULL, -- Coeficiente aplicado (para auditoría)
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_periodo (periodo_id),
  KEY idx_unidad (unidad_id),
  KEY idx_gasto (gasto_snapshot_id),
  KEY idx_subcat (subcategoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Recibos emitidos por unidad / periodo
CREATE TABLE IF NOT EXISTS recibos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  periodo_id INT NOT NULL,
  organizacion_id INT NOT NULL,
  unidad_id INT NOT NULL,
  numero INT NOT NULL,                      -- Secuencia interna por organización (se genera en lógica de negocio)
  monto_total_usd DECIMAL(18,4) NOT NULL,
  tasa_ves_usd_emision DECIMAL(18,8) NULL,  -- Tasa usada para mostrar equivalencia VES (si se requiere)
  estado ENUM('emitido','anulado','pagado_parcial','pagado_total') NOT NULL DEFAULT 'emitido',
  emitido_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  emitido_por INT NULL,
  anulado_at DATETIME NULL,
  anulado_por INT NULL,
  motivo_anulacion VARCHAR(255) NULL,
  pagado_total_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_recibo_unidad_periodo (periodo_id, unidad_id),
  UNIQUE KEY uniq_org_numero (organizacion_id, numero),
  KEY idx_periodo (periodo_id),
  KEY idx_org (organizacion_id),
  KEY idx_estado (estado),
  KEY idx_unidad (unidad_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Detalle de cada concepto dentro del recibo (alineado a los cargos prorrateados)
CREATE TABLE IF NOT EXISTS recibo_detalles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  recibo_id BIGINT NOT NULL,
  periodo_id INT NOT NULL,
  unidad_id INT NOT NULL,
  cargo_unidad_id BIGINT NULL,            -- Referencia a periodo_cargos_unidad para trazabilidad
  gasto_snapshot_id BIGINT NULL,          -- Derivado (redundante) para consultas directas
  subcategoria VARCHAR(50) NULL,
  descripcion VARCHAR(255) NULL,
  monto_usd DECIMAL(18,4) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_recibo (recibo_id),
  KEY idx_periodo (periodo_id),
  KEY idx_unidad (unidad_id),
  KEY idx_cargo (cargo_unidad_id),
  KEY idx_gasto (gasto_snapshot_id),
  KEY idx_subcat (subcategoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- (Opcional futuro) Tabla de pagos; no solicitada explícitamente en esta fase.
-- CREATE TABLE IF NOT EXISTS pagos_recibo (...);

-- Notas:
-- 1. Se asume que la generación de recibos consumirá primero periodo_cargos_unidad agrupando por unidad.
-- 2. recibo_detalles se rellena copiando cada fila de periodo_cargos_unidad correspondiente a la unidad.
-- 3. Integridad referencial (FOREIGN KEY) se puede añadir luego cuando las tablas base tengan índices adecuados y/o si se decide cascada.
-- 4. Para auditoría adicional podría añadirse hash de recibo y firma digital en una versión posterior.
