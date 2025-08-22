-- Renombrar tabla pagos a cobros y ajustar índices (si aplica)
RENAME TABLE pagos TO cobros;

-- Renombrar índices si quieres (opcional, no es necesario para funcionar)
-- ALTER TABLE cobros RENAME INDEX idx_pagos_org_fecha TO idx_cobros_org_fecha;
-- ALTER TABLE cobros RENAME INDEX idx_pagos_sector_fecha TO idx_cobros_sector_fecha;
-- ALTER TABLE cobros RENAME INDEX idx_pagos_unidad_fecha TO idx_cobros_unidad_fecha;

-- Las constraints mantienen su nombre; puedes renombrarlas si deseas consistencia.
