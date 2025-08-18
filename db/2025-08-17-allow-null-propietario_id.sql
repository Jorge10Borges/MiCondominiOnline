-- Migración: permitir NULL en propietario_id de la tabla unidades
-- Fecha: 2025-08-17

-- Nota: Esta migración asume que la tabla `unidades` existe y que `propietario_id` es de tipo INT.
-- Si el tipo difiere (por ejemplo, UNSIGNED), ajuste el comando según corresponda.

START TRANSACTION;

ALTER TABLE unidades
  MODIFY COLUMN propietario_id INT NULL;

COMMIT;
