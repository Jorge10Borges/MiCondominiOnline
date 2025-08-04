-- Script de creación de tablas principales para MiCondominioOnline

CREATE TABLE organizaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  tipo ENUM('condominio','urbanizacion') NOT NULL
);

CREATE TABLE sectores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organizacion_id INT,
  nombre VARCHAR(100),
  tipo ENUM('edificio','manzana') NOT NULL,
  FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id)
);

CREATE TABLE unidades_habitacionales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organizacion_id INT,
  sector_id INT NULL,
  numero VARCHAR(50),
  tipo ENUM('apartamento','casa') NOT NULL,
  FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id),
  FOREIGN KEY (sector_id) REFERENCES sectores(id)
);

CREATE TABLE propietarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cedula VARCHAR(20) UNIQUE,
  nombre VARCHAR(100),
  email VARCHAR(100)
);

CREATE TABLE propietario_unidad (
  propietario_id INT,
  unidad_id INT,
  PRIMARY KEY (propietario_id, unidad_id),
  FOREIGN KEY (propietario_id) REFERENCES propietarios(id),
  FOREIGN KEY (unidad_id) REFERENCES unidades_habitacionales(id)
);
