-- Datos de ejemplo para MiCondominioOnline

-- Organizaciones
INSERT INTO organizaciones (id, nombre, tipo) VALUES
  (1, 'Residencias Miranda', 'condominio'),
  (2, 'Urbanización Los Robles', 'urbanizacion'),
  (3, 'Residencias El Sol', 'condominio');

-- Sectores (edificios y manzanas)
INSERT INTO sectores (id, organizacion_id, nombre, tipo) VALUES
  (1, 1, 'Edificio A', 'edificio'),
  (2, 1, 'Edificio B', 'edificio'),
  (3, 2, 'Manzana Norte', 'manzana'),
  (4, 2, 'Manzana Sur', 'manzana'),
  (5, 3, 'Edificio Único', 'edificio'),
  (6, 2, 'Manzana Central', 'manzana');

-- Unidades habitacionales (casas y apartamentos)
INSERT INTO unidades_habitacionales (id, organizacion_id, sector_id, numero, tipo) VALUES
  -- Apartamentos en Edificio A
  (1, 1, 1, 'A-101', 'apartamento'),
  (2, 1, 1, 'A-102', 'apartamento'),
  (3, 1, 1, 'A-201', 'apartamento'),
  -- Apartamentos en Edificio B
  (4, 1, 2, 'B-101', 'apartamento'),
  (5, 1, 2, 'B-102', 'apartamento'),
  (6, 1, 2, 'B-201', 'apartamento'),
  -- Apartamentos en Edificio Único
  (7, 3, 5, 'U-101', 'apartamento'),
  (8, 3, 5, 'U-102', 'apartamento'),
  (9, 3, 5, 'U-201', 'apartamento'),
  (10, 3, 5, 'U-202', 'apartamento'),
  -- Casas en Manzana Norte
  (11, 2, 3, 'Casa 1', 'casa'),
  (12, 2, 3, 'Casa 2', 'casa'),
  -- Casas en Manzana Sur
  (13, 2, 4, 'Casa 3', 'casa'),
  (14, 2, 4, 'Casa 4', 'casa'),
  -- Casa en Manzana Central
  (15, 2, 6, 'Casa 5', 'casa');

-- Propietarios
INSERT INTO propietarios (id, cedula, nombre, email) VALUES
  (1, 'V12345678', 'Juan Pérez', 'juanperez@mail.com'),
  (2, 'V87654321', 'Ana Gómez', 'anagomez@mail.com'),
  (3, 'V11223344', 'Carlos Ruiz', 'carlosruiz@mail.com'),
  (4, 'V99887766', 'María Díaz', 'mariadiaz@mail.com'),
  (5, 'V55667788', 'Pedro López', 'pedrolopez@mail.com'),
  (6, 'V22334455', 'Luis Torres', 'luistorres@mail.com'),
  (7, 'V33445566', 'Sofía Méndez', 'sofiamendez@mail.com'),
  (8, 'V44556677', 'Ricardo Peña', 'ricardopena@mail.com'),
  (9, 'V66778899', 'Gabriela Silva', 'gabrielasilva@mail.com'),
  (10, 'V77889900', 'Elena Rivas', 'elenarivas@mail.com');

-- Relación propietarios-unidades (algunos propietarios con varias unidades y en diferentes organizaciones)
INSERT INTO propietario_unidad (propietario_id, unidad_id) VALUES
  (1, 1), (1, 11), -- Juan Pérez: A-101 y Casa 1
  (2, 2), (2, 3),  -- Ana Gómez: A-102 y A-201
  (3, 4), (3, 12), -- Carlos Ruiz: B-101 y Casa 2
  (4, 5),          -- María Díaz: B-102
  (5, 6), (5, 13), -- Pedro López: B-201 y Casa 3
  (6, 7), (6, 8),  -- Luis Torres: U-101 y U-102
  (7, 9),          -- Sofía Méndez: U-201
  (8, 10), (8, 14),-- Ricardo Peña: U-202 y Casa 4
  (9, 15),         -- Gabriela Silva: Casa 5
  (10, 12), (10, 2); -- Elena Rivas: Casa 2 y A-102
