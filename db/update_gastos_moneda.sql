-- Migración: agregar columnas de moneda y monto_usd a gastos
-- Ejecutar una vez en la base de datos
ALTER TABLE gastos
  ADD COLUMN moneda VARCHAR(3) NOT NULL DEFAULT 'USD' AFTER monto,
  ADD COLUMN monto_usd DECIMAL(18,6) NOT NULL DEFAULT 0 AFTER moneda;

-- Inicializar monto_usd para registros existentes asumiendo que 'monto' estaba en USD previamente
UPDATE gastos SET monto_usd = monto WHERE moneda = 'USD' OR moneda IS NULL;
