# 1. 🏢 MiCondominioOnline

**Sistema digital para la gestión transparente y participativa de condominios.**  
Desarrollado por **Jorge Luis Borges**, Presidente de Junta de Condominio y Desarrollador de Software Fullstack.

---

# 2. 📝 Reglas de desarrollo y toma de decisiones

- Todas las decisiones de arquitectura, lógica de negocio, flujos y diseño deben estar documentadas en este README.md.
- El desarrollo y las implementaciones siempre se guiarán por lo especificado aquí.
- Si surge una necesidad, funcionalidad o decisión que no esté documentada, se consultará primero al dueño del sistema antes de implementarla.
- Una vez tomada la decisión, se documentará en el README.md para mantener la trazabilidad y coherencia del proyecto.
- El README.md es la fuente de verdad para el contexto y las reglas del sistema.

---

# 3. 🏗️ Control de estructura y licenciamiento

La estructura de cada organización (condominio o urbanización) se define y controla de la siguiente manera:

- El equipo de soporte/implementación (no el administrador) crea la estructura inicial: sectores (edificios, manzanas), unidades habitacionales (apartamentos, casas) y asigna el administrador principal.
- La cantidad de unidades habitacionales determina el costo mensual de la licencia.
- Una vez activada la licencia, la estructura queda bloqueada: ni el administrador ni el equipo pueden editar o eliminar sectores/unidades.
- Solo el usuario ROOT puede modificar la estructura (agregar, editar o eliminar sectores/unidades) después de la activación.
- Si la organización requiere agregar unidades, debe solicitarlo a ROOT, quien realiza el cambio y ajusta la facturación.
- El administrador puede completar y actualizar la información operativa (propietarios, cuentas bancarias, reglamentos, documentos, etc.), pero no puede modificar la estructura base.
- Toda acción estructural relevante queda registrada en logs/auditoría para trazabilidad.

---

# 4. � Datos generales de la organización

Cada organización (condominio o urbanización) debe tener al menos los siguientes datos generales:

- **Nombre de la organización**
- **Tipo** (condominio / urbanización)
- **RIF o identificación fiscal**
- **Dirección completa**
- **Teléfonos de contacto**
- **Email de contacto**
- **Fecha de creación/registro**
- **Estado de la licencia** (activa/vencida)
- **Fecha de expiración de la licencia**

---



# 5. 📋 Datos generales de la organización

Cada organización (condominio o urbanización) debe tener al menos los siguientes datos generales:

- **Nombre de la organización**
- **Tipo** (condominio / urbanización)
- **RIF o identificación fiscal**
- **Dirección completa**
- **Teléfonos de contacto**
- **Email de contacto**
- **Fecha de creación/registro**
- **Estado de la licencia** (activa/vencida)
- **Fecha de expiración de la licencia**

Esta información debe estar disponible para el administrador y, según permisos, para los propietarios. La edición de la estructura está restringida según las reglas documentadas (solo ROOT puede modificar tras activación de la licencia).

---

# 6. 🏗️ Estructura y configuración de la organización

Cada organización debe tener registrada y visible la siguiente información estructural y de configuración:

## 6.1 Estructura

- **Sectores**: Lista de sectores (edificios, manzanas, bloques, etc.)
- **Unidades habitacionales**: Detalle de cada unidad (apartamento, casa), su número/código y sector asociado
- **Propietarios asignados**: Relación de propietarios actuales por unidad
- **Administrador principal**: Usuario responsable de la organización
- **Cantidad total de unidades**: Número total de apartamentos/casas registrados
- **Estado de la estructura**: (bloqueada/abierta, según licenciamiento)

## 6.2 Configuración

- **Cuentas bancarias**: Datos de cuentas para pagos y transferencias
- **Reglamento interno**: Documento(s) PDF o enlace(s) al reglamento vigente
- **Documentos oficiales**: Actas, estatutos, documentos legales relevantes
- **Parámetros de facturación**: Monto por unidad, ciclo de facturación, fecha de corte
- **Contactos de emergencia**: Teléfonos y correos de contacto rápido
- **Configuración de notificaciones**: Preferencias de avisos por email, SMS, etc.
- **Permisos y roles activos**: Listado de usuarios y sus roles actuales

Esta información debe estar disponible para el administrador y, según permisos, para los propietarios. La edición de la estructura está restringida según las reglas documentadas (solo ROOT puede modificar tras activación de la licencia).

---

La estructura de cada organización (condominio o urbanización) se define y controla de la siguiente manera:

- El equipo de soporte/implementación (no el administrador) crea la estructura inicial: sectores (edificios, manzanas), unidades habitacionales (apartamentos, casas) y asigna el administrador principal.
- La cantidad de unidades habitacionales determina el costo mensual de la licencia.
- Una vez activada la licencia, la estructura queda bloqueada: ni el administrador ni el equipo pueden editar o eliminar sectores/unidades.
- Solo el usuario ROOT puede modificar la estructura (agregar, editar o eliminar sectores/unidades) después de la activación.
- Si la organización requiere agregar unidades, debe solicitarlo a ROOT, quien realiza el cambio y ajusta la facturación.
- El administrador puede completar y actualizar la información operativa (propietarios, cuentas bancarias, reglamentos, documentos, etc.), pero no puede modificar la estructura base.
- Toda acción estructural relevante queda registrada en logs/auditoría para trazabilidad.
# � Licenciamiento y control de estructura

- El costo de la licencia es por unidad habitacional (apartamento o casa). Ejemplo: 50 unidades = $50 mensuales.
- La estructura inicial de la organización (sectores, edificios, unidades) es creada por el equipo de soporte/implementación antes de activar la licencia.
- Una vez activada la licencia, la estructura queda bloqueada: ni el administrador ni el equipo pueden editar o eliminar sectores/unidades.
- Solo el usuario ROOT puede modificar la estructura (agregar, editar o eliminar sectores/unidades) después de la activación.
- Si la organización requiere agregar unidades, debe solicitarlo a ROOT (flujo de upgrade y ajuste de facturación).
- El administrador solo puede gestionar la operación diaria (propietarios, pagos, documentos, etc.), pero no la estructura base.
# �📋 Datos generales de una organización

Cada organización (condominio o urbanización) debe tener al menos los siguientes datos generales:

- **Nombre de la organización**
- **Tipo** (condominio / urbanización)
- **RIF o identificación fiscal**
- **Dirección completa**
- **Teléfonos de contacto**
- **Email de contacto**
- **Fecha de creación/registro**
- **Estado de la licencia** (activa/vencida)
- **Fecha de expiración de la licencia**

---

## 📝 Reglas de desarrollo y toma de decisiones

- Todas las decisiones de arquitectura, lógica de negocio, flujos y diseño deben estar documentadas en este README.md.
- El desarrollo y las implementaciones siempre se guiarán por lo especificado aquí.
- Si surge una necesidad, funcionalidad o decisión que no esté documentada, se consultará primero al dueño del sistema antes de implementarla.
- Una vez tomada la decisión, se documentará en el README.md para mantener la trazabilidad y coherencia del proyecto.
- El README.md es la fuente de verdad para el contexto y las reglas del sistema.
# 🏢 MiCondominioOnline

Esta información debe estar disponible para el administrador y, según permisos, para los propietarios. La edición de la estructura está restringida según las reglas documentadas (solo ROOT puede modificar tras activación de la licencia).

**Sistema digital para la gestión transparente y participativa de condominios.**  
Desarrollado por **Jorge Luis Borges**, Presidente de Junta de Condominio y Desarrollador de Software Fullstack.

---


---

# 6. 🎯 Objetivo

Optimizar la administración de propiedades horizontales mediante herramientas web que promueven transparencia, eficiencia y participación comunitaria.

---

# 7. 📱 Requisito fundamental: Diseño responsivo

Toda la aplicación debe ser **completamente responsiva**. Cada módulo, página, formulario, tabla y componente debe adaptarse correctamente a dispositivos móviles, tablets y pantallas de escritorio. El diseño responsivo es un criterio obligatorio y será considerado en cada etapa del desarrollo y revisión.

---

# 8. ⚙️ Arquitectura Modular

El sistema se organiza en **tres módulos funcionales**, cada uno con acceso controlado y flujos específicos:

## 8.1 `admin/` – Gestión administrativa

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

## 8.2 `residencia/` – Portal para propietarios
- Consulta del estado de cuenta.
- Descarga de recibos.
- Solicitudes a la Junta (documentos, reclamos).
- Panel seguro con acceso personalizado.

## 8.3 `comunidad/` – Módulo social y comunicacional
- Noticias, comunicados y calendario.
- Participación en encuestas y procesos vecinales.
- Acceso público o restringido según configuración.

---

# 9. 🧰 Stack Tecnológico

| Herramienta       | Finalidad                                  |
|-------------------|---------------------------------------------|
| **React + Vite**  | Frontend modular, veloz y mantenible        |
| **Tailwind CSS**  | Diseño accesible, claro y responsivo        |
| **PHP puro**      | Backend robusto y controlado por el autor   |
| **JWT**           | Autenticación segura basada en roles        |
| **MySQL**         | Persistencia de datos relacional            |

---

# 10. 🔒 Seguridad y Jerarquía de Roles

- Autenticación con tokens JWT.
- Separación estricta de roles y privilegios.
- Acceso controlado por módulo y tipo de usuario.

## 10.1 Jerarquía de usuarios y roles

1. **ROOT (Dueño/Desarrollador)**
   - Acceso total a todo el sistema, incluso a la gestión de superusuarios.
   - Puede ver, crear, editar y eliminar superusuarios, organizaciones, administradores, propietarios, configuraciones globales, logs, auditoría, facturación SaaS, etc.
   - Puede realizar tareas de soporte, mantenimiento y ver todo el historial del sistema.
   - Es el único que puede eliminar organizaciones o superusuarios.

2. **Superusuario**
   - Acceso a la gestión de todas las organizaciones y administradores.
   - Puede crear, editar y eliminar organizaciones y administradores.
   - No puede modificar ni eliminar usuarios ROOT.
   - No accede a configuraciones SaaS globales ni a la facturación del sistema.

3. **Administrador**
   - Administra una organización específica.
   - Puede gestionar propietarios, unidades, pagos, gastos, reportes, etc. dentro de su organización.
   - No puede ver ni modificar otras organizaciones.
   - No puede crear superusuarios ni ROOT.

4. **Propietario**
   - Solo puede ver y gestionar su propia información, pagos, reportes y comunicaciones de su unidad.
   - No puede modificar datos de la organización ni de otros propietarios.

**Ventajas de tener un usuario ROOT:**
- Seguridad: Nadie puede escalar privilegios hasta ROOT desde la interfaz.
- Control: Puedes intervenir en cualquier organización, usuario o configuración.
- Auditoría: Puedes ver logs y auditorías de todo el sistema.
- Mantenimiento: Puedes realizar tareas críticas sin depender de otros roles.
- Facturación SaaS: Solo ROOT puede ver y modificar la facturación y los planes del sistema.

**Recomendaciones técnicas:**
- El usuario ROOT debe estar definido explícitamente en la base de datos y no debe poder ser eliminado por ningún otro usuario.
- El login de ROOT puede estar restringido por IP, 2FA o mecanismos adicionales de seguridad.
- En el frontend, muestra u oculta opciones según el rol (`root`, `superusuario`, `admin`, `propietario`).
- En el backend, valida siempre el rol antes de permitir acciones críticas.

---

# 11. 🔄 Flujo funcional

1. El propietario accede al sistema con credenciales únicas.
2. Visualiza sus documentos, recibos y estado de cuenta.
3. Emite solicitudes formales a la Junta.
4. La Junta genera, valida y responde desde el panel `admin`.
5. La comunidad accede a contenido de interés vecinal.

---

# 12. 📄 Documentación futura

- Manual técnico por módulo.
- Flujos administrativos estandarizados.
- Plantillas de presentación institucional.
- Guías para replicabilidad en otros condominios.

---

# 13. 👤 Autor del proyecto

**Jorge Luis Borges**  
Presidente de la Junta de Condominio Residencias Francisco de Miranda – Edificio 11  
Desarrollador Fullstack especializado en arquitectura modular, UX/UI, trazabilidad digital y autenticación JWT.  
Comprometido con el desarrollo comunitario mediante tecnología accesible, transparente y replicable.

---

# 14. 📌 Estado del proyecto

🚧 En desarrollo activo (2025).  
🔐 Autenticación JWT en fase de implementación.  
🌐 Dominio registrado: [micondominionline.com](http://micondominionline.com) *(pendiente de despliegue)*

---

# 15. 🏗️ Bases iniciales recomendadas

1. **Estructura de carpetas y módulos**
   - Definir carpetas para `admin`, `residencia` y `publico` en frontend (y backend si aplica).
   - `admin/`: Panel administrativo (privado)
   - `residencia/`: Portal de propietarios (privado)
   - `publico/`: Landing pública, noticias y secciones generales
   - Separar assets, componentes, servicios y utilidades.

   **Ejemplo de estructura para el frontend:**

```sql
CREATE TABLE organizaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  rif VARCHAR(20) DEFAULT NULL,
  direccion VARCHAR(255) DEFAULT NULL,
  telefonos VARCHAR(100) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  fecha_creacion DATE DEFAULT NULL,
  estado_licencia VARCHAR(20) DEFAULT 'activa',
  fecha_expiracion DATE DEFAULT NULL,
  tipo_licencia VARCHAR(20) DEFAULT NULL,
  costo_licencia DECIMAL(10,2) DEFAULT NULL
);
```
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

# 16. 📫 Contacto

Para colaboración técnica o institucional, contactar al autor por canales definidos en la Junta.

---

## Estilos de botones principales

Para todos los botones principales de agregar (por ejemplo: "Agregar organización", "Agregar sector", "Agregar apartamento/casa"), se debe usar la siguiente clase:

```
bg-Regalia text-white px-4 py-2 rounded shadow hover:bg-purple-800 transition cursor-pointer
```

Esto asegura consistencia visual y accesibilidad en toda la aplicación.
