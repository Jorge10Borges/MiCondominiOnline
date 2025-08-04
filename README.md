# 🏢 MiCondominioOnline

**Sistema digital para la gestión transparente y participativa de condominios.**  
Desarrollado por **Jorge Luis Borges**, Presidente de Junta de Condominio y Desarrollador de Software Fullstack.

---

## 🎯 Objetivo

Optimizar la administración de propiedades horizontales mediante herramientas web que promueven transparencia, eficiencia y participación comunitaria.

---

## 📱 Requisito fundamental: Diseño responsivo

Toda la aplicación debe ser **completamente responsiva**. Cada módulo, página, formulario, tabla y componente debe adaptarse correctamente a dispositivos móviles, tablets y pantallas de escritorio. El diseño responsivo es un criterio obligatorio y será considerado en cada etapa del desarrollo y revisión.

---

## ⚙️ Arquitectura Modular

El sistema se organiza en **tres módulos funcionales**, cada uno con acceso controlado y flujos específicos:


### 1. `admin/` – Gestión administrativa

**Módulos principales:**

- **Dashboard:** Resumen general, notificaciones y accesos rápidos.
- **Organizaciones:** Gestión de condominios/urbanizaciones.
- **Sectores:** Edificios, manzanas, bloques, etc.
- **Unidades:** Casas, apartamentos, asignación y gestión.
- **Propietarios:** Registro, edición, asignación a unidades.
- **Pagos:** Generación de cuotas, registro de pagos, morosidad.
- **Gastos:** Registro de gastos comunes, proveedores.
- **Comunicados:** Envío de avisos y notificaciones.
- **Reportes:** Exportación de información relevante.
- **Configuración:** Usuarios, roles, permisos, auditoría.

### 2. `residencia/` – Portal para propietarios
- Consulta del estado de cuenta.
- Descarga de recibos.
- Solicitudes a la Junta (documentos, reclamos).
- Panel seguro con acceso personalizado.

### 3. `comunidad/` – Módulo social y comunicacional
- Noticias, comunicados y calendario.
- Participación en encuestas y procesos vecinales.
- Acceso público o restringido según configuración.

---

## 🧰 Stack Tecnológico

| Herramienta       | Finalidad                                  |
|-------------------|---------------------------------------------|
| **React + Vite**  | Frontend modular, veloz y mantenible        |
| **Tailwind CSS**  | Diseño accesible, claro y responsivo        |
| **PHP puro**      | Backend robusto y controlado por el autor   |
| **JWT**           | Autenticación segura basada en roles        |
| **MySQL**         | Persistencia de datos relacional            |

---

## 🔒 Seguridad

- Autenticación con tokens JWT.
- Separación estricta de roles (`admin`, `propietario`, `visitante`).
- Acceso controlado por módulo y tipo de usuario.

---

## 🔄 Flujo funcional

1. El propietario accede al sistema con credenciales únicas.
2. Visualiza sus documentos, recibos y estado de cuenta.
3. Emite solicitudes formales a la Junta.
4. La Junta genera, valida y responde desde el panel `admin`.
5. La comunidad accede a contenido de interés vecinal.

---

## 📄 Documentación futura

- Manual técnico por módulo.
- Flujos administrativos estandarizados.
- Plantillas de presentación institucional.
- Guías para replicabilidad en otros condominios.

---

## 👤 Autor del proyecto

**Jorge Luis Borges**  
Presidente de la Junta de Condominio Residencias Francisco de Miranda – Edificio 11  
Desarrollador Fullstack especializado en arquitectura modular, UX/UI, trazabilidad digital y autenticación JWT.  
Comprometido con el desarrollo comunitario mediante tecnología accesible, transparente y replicable.

---

## 📌 Estado del proyecto


---

## 🏗️ Bases iniciales recomendadas

1. **Estructura de carpetas y módulos**

   - Definir carpetas para `admin`, `residencia` y `publico` en frontend (y backend si aplica).
   - `admin/`: Panel administrativo (privado)
   - `residencia/`: Portal de propietarios (privado)
   - `publico/`: Landing pública, noticias y secciones generales
   - Separar assets, componentes, servicios y utilidades.

   **Ejemplo de estructura para el frontend:**

   ```
   src/
     admin/
       components/
       pages/
       services/
       hooks/
       utils/
       assets/
       layouts/
     residencia/
       ...
     publico/
       ...
     components/   # Componentes generales reutilizables
     layout/       # Layouts generales
     assets/       # Recursos compartidos
   ```

   **Ejemplo de estructura para el módulo `admin` (frontend):**

   ```
   src/
     admin/
       components/   # Componentes reutilizables del panel administrativo
       pages/        # Vistas principales (Recibos, Pagos, Usuarios, etc.)
       services/     # Lógica de conexión con el backend (API)
       hooks/        # Custom hooks para lógica compartida
       utils/        # Utilidades y helpers
       assets/       # Imágenes, íconos o recursos propios del admin
       layouts/      # Estructuras de layout (menú lateral, header, etc.)
   ```

2. **Modelo de datos principal**

   **Diagrama de flujo: Creación de urbanización de solo casas**
   
   **Diagrama de flujo: Creación de junta de condominio con edificios**

   ```
   [Inicio]
      |
      v
   [Registrar organización (tipo: condominio)]
      |
      v
   [Registrar cada edificio como sector (tipo: edificio)]
      |
      v
   [Registrar apartamentos]
      (asociados a cada edificio)
      |
      v
   [Registrar propietarios]
      |
      v
   [Asociar propietarios a apartamentos]
      |
      v
   [Fin]
   ```

   ```
   [Inicio]
      |
      v
   [Registrar organización (tipo: urbanización)]
      |
      v
   ¿La urbanización tiene manzanas?
      |                 
   +--Sí----------------No--+
   |                          |
   v                          v
 [Registrar cada manzana]   [Omitir]
   |                          |
   v                          v
 [Registrar casas]         [Registrar casas]
   (asociadas a manzana)   (sin sector)
   |                          |
   v                          v
 [Registrar propietarios]
      |
      v
 [Asociar propietarios a casas]
      |
      v
   [Fin]
   ```

   - Esquema de usuarios (roles: admin, propietario, visitante).
   - Esquema de recibos, pagos, solicitudes y noticias/eventos.

   **Modelo jerárquico adaptable:**

   ```json
   {
     "organizacion": "Residencias Miranda",
     "tipo": "condominio", // o "urbanizacion"
     "edificios": [
       {
         "nombre": "Edificio 1",
         "unidades": [
           { "numero": "A-1", "propietario": "Juan Pérez" },
           { "numero": "A-2", "propietario": "Ana Gómez" }
         ]
       }
     ],
     "manzanas": [
       {
         "nombre": "Manzana A",
         "casas": [
           { "numero": "Casa 1", "propietario": "Pedro López" }
         ]
       }
     ],
     "casas": [
       { "numero": "Casa 101", "propietario": "Luis Torres" }
     ]
   }
   ```

   **Diagrama jerárquico:**


   ```
   Organización (Condominio/Urbanización)
   │
   ├── Sectores (tipo: edificio o manzana, opcional)
   │     └── Unidades habitacionales (tipo: apartamento o casa)
   │           └── Propietario
   │
   └── Unidades habitacionales (tipo: casa, si no hay sectores)
         └── Propietario
   ```

   **Tablas SQL sugeridas:**

   ```sql
   -- Organización principal (condominio o urbanización)
   CREATE TABLE organizaciones (
     id INT PRIMARY KEY AUTO_INCREMENT,
     nombre VARCHAR(100) NOT NULL,
     tipo ENUM('condominio','urbanizacion') NOT NULL
   );

   -- Sectores (pueden ser edificios o manzanas, opcional)
   CREATE TABLE sectores (
     id INT PRIMARY KEY AUTO_INCREMENT,
     organizacion_id INT,
     nombre VARCHAR(100),
     tipo ENUM('edificio','manzana') NOT NULL,
     FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id)
   );

   -- Unidades habitacionales (casas o apartamentos)
   CREATE TABLE unidades_habitacionales (
     id INT PRIMARY KEY AUTO_INCREMENT,
     organizacion_id INT,
     sector_id INT NULL,
     numero VARCHAR(50),
     tipo ENUM('apartamento','casa') NOT NULL,
     FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id),
     FOREIGN KEY (sector_id) REFERENCES sectores(id)
   );

   -- Propietarios
   CREATE TABLE propietarios (
     id INT PRIMARY KEY AUTO_INCREMENT,
     nombre VARCHAR(100),
     email VARCHAR(100)
   );

   -- Relación propietarios-unidades habitacionales
   CREATE TABLE propietario_unidad (
     propietario_id INT,
     unidad_id INT,
     PRIMARY KEY (propietario_id, unidad_id),
     FOREIGN KEY (propietario_id) REFERENCES propietarios(id),
     FOREIGN KEY (unidad_id) REFERENCES unidades_habitacionales(id)
   );
   ```

3. **Sistema de autenticación y control de acceso**
   - Flujo de login y registro.
   - Implementación base de JWT y middleware para proteger rutas según rol.

4. **Configuración base del frontend**
   - Integración de React, Vite y Tailwind.
   - Rutas protegidas y públicas según módulo.
   - Layouts básicos para cada módulo.

5. **Configuración base del backend**
   - Estructura de endpoints RESTful en PHP.
   - Conexión a MySQL y archivos de configuración.
   - Endpoints iniciales: login, registro, consulta de usuario.

6. **Variables de entorno y configuración**
   - Definir archivos `.env` para credenciales, claves JWT, etc.

7. **Documentación y convenciones**
   - Convenciones de nombres, estructura de commits y documentación mínima por módulo.

---

🚧 En desarrollo activo (2025).  
🔐 Autenticación JWT en fase de implementación.  
🌐 Dominio registrado: [micondominionline.com](http://micondominionline.com) *(pendiente de despliegue)*

---

## 📫 Contacto

Para colaboración técnica o institucional, contactar al autor por canales definidos en la Junta.
