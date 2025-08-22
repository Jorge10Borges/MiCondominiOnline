-- Alter tables to add sector_id and indexes if they already exist without sector_id

ALTER TABLE gastos
  ADD COLUMN sector_id INT NULL AFTER organizacion_id,
  ADD CONSTRAINT fk_gastos_sector FOREIGN KEY (sector_id) REFERENCES sectores(id);

CREATE INDEX idx_gastos_sector_fecha ON gastos (sector_id, fecha);

ALTER TABLE pagos
  ADD COLUMN sector_id INT NULL AFTER organizacion_id,
  ADD CONSTRAINT fk_pagos_sector FOREIGN KEY (sector_id) REFERENCES sectores(id);

CREATE INDEX idx_pagos_sector_fecha ON pagos (sector_id, fecha);
