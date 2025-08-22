-- Tipos de cambio intradía
CREATE TABLE IF NOT EXISTS tipos_cambio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  moneda CHAR(3) NOT NULL, -- VES | EUR | USD
  usd_por_unidad DECIMAL(18,6) NOT NULL, -- 1 unidad de 'moneda' equivale a esta cantidad de USD (USD por 1 VES/EUR/USD)
  fuente VARCHAR(50) DEFAULT 'manual',
  efectivo_desde DATETIME NOT NULL, -- timestamp de vigencia
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_moneda CHECK (moneda IN ('VES','EUR','USD')),
  CONSTRAINT chk_tasa_positiva CHECK (usd_por_unidad > 0),
  UNIQUE KEY ux_moneda_efectivo (moneda, efectivo_desde),
  INDEX ix_moneda_vigencia (moneda, efectivo_desde)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Semillas opcionales: USD base = 1
INSERT INTO tipos_cambio (moneda, usd_por_unidad, fuente, efectivo_desde)
VALUES ('USD', 1.000000, 'base', NOW())
ON DUPLICATE KEY UPDATE usd_por_unidad = VALUES(usd_por_unidad);
