-- Clasificación de gastos: categorías y subcategorías
-- Ejecutar en la base de datos micondominionline

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE IF NOT EXISTS categorias (
  codigo_cat VARCHAR(2) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  PRIMARY KEY (codigo_cat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subcategorias (
  codigo_subcat VARCHAR(6) NOT NULL, -- Formato CC-SSS
  nombre VARCHAR(100) NOT NULL,
  codigo_cat VARCHAR(2) NOT NULL,
  PRIMARY KEY (codigo_subcat),
  KEY idx_subcategorias_cat (codigo_cat),
  CONSTRAINT fk_subcategorias_cat FOREIGN KEY (codigo_cat)
    REFERENCES categorias (codigo_cat)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales de categorías
INSERT INTO categorias (codigo_cat, nombre) VALUES
  ('OP', 'Operativos')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO categorias (codigo_cat, nombre) VALUES
  ('MT', 'Mantenimiento')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO categorias (codigo_cat, nombre) VALUES
  ('LG', 'Legales')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO categorias (codigo_cat, nombre) VALUES
  ('FR', 'Fondo de Reserva')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO categorias (codigo_cat, nombre) VALUES
  ('EX', 'Extraordinarios')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Datos iniciales de subcategorías
INSERT INTO subcategorias (codigo_subcat, nombre, codigo_cat) VALUES
  ('OP-SEG', 'Operativos – Seguridad', 'OP')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO subcategorias (codigo_subcat, nombre, codigo_cat) VALUES
  ('OP-SER', 'Operativos – Servicios Públicos', 'OP')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO subcategorias (codigo_subcat, nombre, codigo_cat) VALUES
  ('MT-PRE', 'Mantenimiento – Preventivo', 'MT')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO subcategorias (codigo_subcat, nombre, codigo_cat) VALUES
  ('MT-COR', 'Mantenimiento – Correctivo', 'MT')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO subcategorias (codigo_subcat, nombre, codigo_cat) VALUES
  ('LG-SEG', 'Legales – Seguros', 'LG')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO subcategorias (codigo_subcat, nombre, codigo_cat) VALUES
  ('FR-URG', 'Fondo de Reserva – Urgencias', 'FR')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO subcategorias (codigo_subcat, nombre, codigo_cat) VALUES
  ('EX-EVC', 'Extraordinarios – Eventos Comunitarios', 'EX')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
