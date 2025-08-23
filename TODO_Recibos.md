# TODO Recibos (Generación y Gestión de Recibos de Condominio)

## Fases del Proceso
1. Selección / Cierre preliminar del período
2. Validaciones previas
3. Definir reglas de prorrateo
4. Consolidar y normalizar gastos
5. Distribución (cálculo por unidad)
6. Previsualización y ajustes
7. Generar lote (borrador)
8. Emisión (congelar datos)
9. Publicación / notificaciones
10. Pagos y seguimiento
11. Cierre o reapertura controlada

---
## Detalle de Fases y Acciones
### 1. Selección / Cierre preliminar
- Usuario elige período (YYYY-MM).
- Mostrar resumen: total gastos USD, cantidad, última modificación.
- Acción: Botón "Preparar recibos".

### 2. Validaciones previas (bloqueantes)
- Gastos eliminados pendientes -> decidir restaurar o ignorar.
- Todos los gastos con categoría + subcategoría válidas.
- Todos normalizados (monto_usd no nulo).
- Unidades activas con coeficiente / factor definido.
- No existe lote emitido para (organización, período).
- (Opcional) Advertir si hay gastos ingresados en fechas fuera del mes.

### 3. Reglas de prorrateo
Métodos soportados (MVP):
- Por coeficiente (alícuota).
- Igualitario (mismo monto todas las unidades).
- Directo (asignado manualmente a una o varias unidades).
- (Futuro) Por consumo.
Acciones:
- Autodetectar categorías/subcategorías usadas en el período.
- UI de selección de método por fila.
- Guardar plantilla reutilizable por organización.

### 4. Consolidación de gastos
- Cargar gastos activos del período.
- Normalizar: (id_gasto, categoria, subcategoria, monto_usd, regla).
- (Opcional) Agrupar gastos de misma subcategoría si la regla no requiere detalle línea a línea.

### 5. Motor de distribución
Para cada gasto:
- Determinar regla.
- Calcular monto por unidad.
  - Coeficiente: monto * coef_u / Σcoef.
  - Igualitario: monto / N.
  - Directo: montos asignados manualmente (validar suma = total gasto).
- Redondeo: 2 decimales; calcular delta (total líneas vs gasto original).
- Ajuste: aplicar delta a unidad de mayor coeficiente o crear línea "Ajuste".
Salida: lista (unidad_id, gasto_id, monto_usd, tipo_linea, regla, factor).

### 6. Previsualización y ajustes
UI:
- Tabla de unidades: coeficiente, subtotal USD, subtotal VES, %.
- Expansión para ver detalle de líneas.
- Permitir agregar líneas de ajuste / descuentos manuales.
- Botón "Recalcular" si cambian reglas.
Estado aún no definitivo (memoria o tablas *_temp).

### 7. Generar lote (borrador)
Tablas nuevas (ver más abajo):
- Crear registro en `recibos_lotes` (periodo, tasa_usd_ves usada, totales, generado_por, estado=borrador).
- Insertar recibos (estado=pendiente, borrador=1) + detalles (incluye ajustes y directos).
- Congelar tasa (almacenar `tasa_usd_ves` numérica).
- Guardar snapshot opcional de nombre unidad / propietario.

### 8. Emisión
- Numerar recibos secuencialmente (por organización+periodo).
- Marcar lote: borrador -> emitido.
- Marcar recibos borrador=0, set `emitido_at`.
- Bloquear edición/eliminación de gastos del período (requerir reapertura).
- Guardar hash de integridad (checksum de sumas) para auditoría (opcional).

### 9. Publicación / Notificaciones
- Crear notificaciones para propietarios.
- (Opcional) Enviar email con PDF (generar bajo demanda o batch).
- Portal propietarios: listar recibos (estado, saldo, detalle, botón pago).

### 10. Pagos y seguimiento
- Tabla `pagos`: (recibo_id, fecha, metodo, referencia, monto, moneda, tasa_usd_ves, creado_por, conciliado).
- Actualizar saldo y estado recibo: pendiente -> parcial -> pagado.
- Conciliación manual o automática (futuro).

### 11. Cierre / Reapertura
- Cierre: lote emitido -> cerrado (todos pagados o fin de periodo).
- Reapertura (solo rol alto): anular recibos (o marcarlos reabiertos), permitir recalcular.
- Registrar motivo de reapertura y auditoría.

---
## Tablas Propuestas (SQL Esquemático)
```sql
-- Lote de recibos
CREATE TABLE recibos_lotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizacion_id INT NOT NULL,
  periodo CHAR(7) NOT NULL,               -- 'YYYY-MM'
  tasa_usd_ves DECIMAL(18,8) NOT NULL,    -- congelada
  total_usd DECIMAL(18,2) NOT NULL,
  total_ves DECIMAL(18,2) NOT NULL,
  estado ENUM('borrador','emitido','reabierto','cerrado') NOT NULL DEFAULT 'borrador',
  generado_por INT NOT NULL,
  emitido_at DATETIME NULL,
  cerrado_at DATETIME NULL,
  reabierto_at DATETIME NULL,
  reabierto_por INT NULL,
  motivo_reapertura TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_lote (organizacion_id, periodo)
);

-- Recibos
CREATE TABLE recibos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lote_id INT NOT NULL,
  unidad_id INT NOT NULL,
  numero VARCHAR(30) NULL,                -- asignado al emitir
  subtotal_usd DECIMAL(18,2) NOT NULL,
  subtotal_ves DECIMAL(18,2) NOT NULL,
  saldo_usd DECIMAL(18,2) NOT NULL,
  saldo_ves DECIMAL(18,2) NOT NULL,
  estado ENUM('pendiente','parcial','pagado','anulado') NOT NULL DEFAULT 'pendiente',
  emitido_at DATETIME NULL,
  anulado_at DATETIME NULL,
  anulado_por INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_lote (lote_id)
);

-- Detalle de recibos
CREATE TABLE recibo_detalles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recibo_id INT NOT NULL,
  gasto_id INT NULL,                      -- NULL para ajuste u otros
  tipo_linea ENUM('gasto','ajuste','directo') NOT NULL DEFAULT 'gasto',
  categoria VARCHAR(20) NULL,
  subcategoria VARCHAR(30) NULL,
  descripcion VARCHAR(255) NULL,
  monto_usd DECIMAL(18,4) NOT NULL,
  regla VARCHAR(20) NOT NULL,             -- coeficiente|igualitario|directo|ajuste
  factor DECIMAL(18,8) NULL,              -- coeficiente relativo, 1/N, etc.
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recibo (recibo_id)
);

-- Pagos
CREATE TABLE pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recibo_id INT NOT NULL,
  fecha DATE NOT NULL,
  metodo VARCHAR(50) NOT NULL,
  referencia VARCHAR(100) NULL,
  moneda VARCHAR(10) NOT NULL DEFAULT 'USD',
  monto DECIMAL(18,2) NOT NULL,
  tasa_usd_ves DECIMAL(18,8) NULL,        -- si pago en VES
  creado_por INT NOT NULL,
  conciliado TINYINT(1) NOT NULL DEFAULT 0,
  conciliado_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recibo (recibo_id)
);
```
*(Añadir claves foráneas más adelante según integridad y performance.)*

---
## Endpoints (MVP)
- POST   /recibos/lotes (body: periodo, organizacion_id) -> genera cálculo y guarda borrador.
- GET    /recibos/lotes?organizacion_id=&periodo= -> info lote + estado.
- POST   /recibos/lotes/{id}/emitir -> numerar y emitir.
- POST   /recibos/lotes/{id}/reabrir (rol alto) -> anula y permite recalcular.
- POST   /recibos/lotes/{id}/cerrar -> marcar cerrado.
- GET    /recibos?lote_id= -> lista recibos + saldos.
- GET    /recibos/{id} -> detalle + líneas.
- POST   /recibos/{id}/pagos -> registrar pago.
- GET    /recibos/{id}/pagos -> listar pagos.

### Opcionales
- POST /recibos/lotes/{id}/previsualizar (sin persistir) – si se quiere separar pre-cálculo.
- GET  /recibos/lotes/{id}/export (xlsx/pdf).

---
## Estados y Transiciones
Lote:
- borrador -> emitido -> (reabierto)* -> emitido -> cerrado.
Recibo:
- pendiente -> parcial -> pagado; pendiente/parcial -> anulado.
Pago:
- registrado -> conciliado.

---
## Validaciones Clave (Checklist)
- [ ] Total distribuido == Σ gastos (ajuste <= 0.01 USD)
- [ ] No existe lote emitido mismo periodo
- [ ] Todos los gastos con subcategoría
- [ ] Todas las unidades con coeficiente
- [ ] Tasa congelada registrada
- [ ] Al emitir: números secuenciales consistentes
- [ ] Al registrar pago: saldo no negativo

---
## Auditoría
- Guardar usuario y timestamp en cambios críticos (emitir, reabrir, cerrar, anular recibo, registrar pago).
- (Opcional) Hash de integridad: SHA256 de concatenación ordenada (recibo_id|subtotal_usd|...) para detectar alteraciones.

---
## Iteración Sugerida
1. Tablas + endpoint POST /recibos/lotes (cálculo + persistencia borrador).
2. GET lote + GET recibos.
3. Emisión (numeración + congelar).
4. Registro de pagos y actualización de saldos.
5. Reapertura / cierre.
6. UI Wizard.
7. PDF/Email.

---
## Preguntas Pendientes / Decisiones
- ¿Coeficientes vienen de tabla sectores/unidades? (definir origen exacto).
- ¿Se permiten ajustes manuales negativos (descuentos)?
- ¿Método de numeración multi-sector o global por organización?
- ¿Límite para reaperturas (número máximo / ventana de tiempo)?
- ¿Moneda oficial de los recibos siempre USD con conversión VES informativa?

---
## Próximo Paso Inmediato
Crear migración SQL de las tablas y esqueleto de endpoint POST /recibos/lotes.

