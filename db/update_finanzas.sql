-- Finanzas: tablas básicas para Gastos y Pagos (cobranzas)

-- Tabla de gastos operativos del condominio
CREATE TABLE IF NOT EXISTS gastos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizacion_id INT NOT NULL,
  sector_id INT NULL,
  fecha DATE NOT NULL,
  categoria VARCHAR(100) NULL,
  descripcion TEXT NULL,
  monto DECIMAL(12,2) NOT NULL,
  proveedor VARCHAR(150) NULL,
  comprobante VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_gastos_org FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id),
  CONSTRAINT fk_gastos_sector FOREIGN KEY (sector_id) REFERENCES sectores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_gastos_org_fecha ON gastos (organizacion_id, fecha);
CREATE INDEX idx_gastos_sector_fecha ON gastos (sector_id, fecha);

-- Tabla de pagos de propietarios (cobranzas)
CREATE TABLE IF NOT EXISTS cobros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizacion_id INT NOT NULL,
  sector_id INT NULL,
  unidad_id INT NOT NULL,
  fecha DATE NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  metodo VARCHAR(50) NULL,
  referencia VARCHAR(100) NULL,
  recibo_num VARCHAR(50) NULL,
  estado ENUM('registrado','anulado') NOT NULL DEFAULT 'registrado',
  usuario_id INT NULL, -- usuario admin que registró el pago
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cobros_org FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id),
  CONSTRAINT fk_cobros_sector FOREIGN KEY (sector_id) REFERENCES sectores(id),
  CONSTRAINT fk_cobros_unidad FOREIGN KEY (unidad_id) REFERENCES unidades(id),
  CONSTRAINT fk_cobros_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_cobros_org_fecha ON cobros (organizacion_id, fecha);
CREATE INDEX idx_cobros_sector_fecha ON cobros (sector_id, fecha);
CREATE INDEX idx_cobros_unidad_fecha ON cobros (unidad_id, fecha);
