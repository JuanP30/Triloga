# Documentación del Proyecto T7: Sistema de Reservas de Hotel

De acuerdo con lo desarrollado e implementado en el código, a continuación se detallan los requerimientos del sistema clasificados en funcionales y no funcionales.

## 1. Requisitos Funcionales (RF)

### 1.1 Gestión de Habitaciones (Inventario)
* **RF-1.1.1:** El sistema debe permitir al rol Administrador crear nuevas habitaciones registrando su Identificador UUID, número de habitación, tipo (Sencilla, Doble, Suite, etc.) y precio por noche.
* **RF-1.1.2:** El sistema debe permitir la consulta, actualización y eliminación (CRUD completo) del catálogo de habitaciones.

### 1.2 Gestión de Huéspedes
* **RF-1.2.1:** El sistema debe permitir registrar los datos de los clientes/huéspedes incluyendo Nombre Completo y Documento de Identidad (ID).
* **RF-1.2.2:** El sistema debe validar que el Documento de Identidad sea único de tal forma que no existan documentos duplicados en la base de datos de los huéspedes.
* **RF-1.2.3:** El sistema debe permitir la consulta, modificación y eliminación (CRUD) del registro de huéspedes.

### 1.3 Gestión del Flujo de Reservas
* **RF-1.3.1:** El sistema debe permitir asociar un Cliente (huésped) a un Producto (habitación) mediante fechas de entrada (`check_in`) y salida (`check_out`).
* **RF-1.3.2 Validación de Integridad Cronológica:** El sistema debe impedir la creación de cualquier reserva donde la fecha de *Check-in* sea mayor o igual a la de *Check-out*.
* **RF-1.3.3 Prevención de Over-Booking (Solapamiento):** El sistema debe bloquear la confirmación de una nueva reserva sobre una habitación si ya existe una reservación `CONFIRMADA` que cruza sus fechas con la nueva solicitud.
* **RF-1.3.4 Transición y Máquina de Estados:** Las reservas deben mantener el control de sus ciclos de vida a través de una enumeración de estados: `CREADA`, `CONFIRMADA` o `CANCELADA`.
* **RF-1.3.5 Validaciones Estrictas de Cancelación:** El sistema debe impedir irrevocablemente que una reserva etiquetada como `CANCELADA` pueda ser transicionada nuevamente a estado  `CONFIRMADA`.
* **RF-1.3.6 Motor de Precios Dinámico:** El backend debe calcular y fijar automáticamente el costo total (`total_cost`) multiplicando el valor por noche de la habitación asignada por la métrica de total de días solicitados.

### 1.4 Búsqueda y Manejo de Información Compartida (Reportes)
* **RF-1.4.1 Búsqueda de Disponibilidad:** El sistema proveerá una funcionalidad donde, al ingresar un rango de fechas de ingreso y salida, devolverá exhaustivamente sobre la base de datos sólo aquellas habitaciones que carezcan de cualquier reserva confirmada durante dicho bloque de días.
* **RF-1.4.2 Reporte de Ocupación Visual e Ingresos:** El sistema agrupará numéricamente las reservas cruzadas en cierto lapso de días para derivar: la proporción matemática de reservas (`% de ocupación del hotel`) sobre noches disponibles y el cálculo numérico estipulado de los ingresos estimados generados en ese mismo periodo de tiempo.

### 1.5 Roles y Privilegios
* **RF-1.5.1:** El sistema debe poseer un componente de validación de privilegios basado en perfiles (`ADMIN` y `STAFF`).
* **RF-1.5.2:** El rol central `ADMIN` tendrá dominio operativo para manejar habitaciones y estadísticas financieras (Reportes).
* **RF-1.5.3:** Ciertas interfaces y subyacentes operativos estarán ocultos o directamente prohibidos a nivel Backend para el usuario `STAFF`, resguardándolo a tareas diarias (Huéspedes y Reservaciones).


---


## 2. Requisitos No Funcionales (RNF)

* **RNF-2.1 Estructura Arquitectónica (Cliente/Servidor):** Separar estictamente la interacción gráfica (HTML, CSS y Javascript clásico Vanilla) de la lógica de negocio (Server NodeJS + Express).
* **RNF-2.2 Integridad de los Datos (UUID):** Para robustecer la persistencia referencial y reducir escalamientos predecibles de ID's autoincrementales, todo el modelo de datos backend se basa en identificadores UUID de 128-bits generados por la API Crypto nativa (`crypto.randomUUID()`).
* **RNF-2.3 Protocolos de Interconexión (Fetch APIs):** Establecer conexiones asíncronas vía Rest (Endpoints CRUD) para no forzar la recarga del árbol DOM por cada submit en el Frontend.
* **RNF-2.4 Seguridad (Middleware Híbrido):** Construcción de un cortafuegos para autorización, inyectando sobre cada petición una cabecera nativa HTTP con llave `x-user-role`, evaluada por intercepctores pre-rutas de Express. 
* **RNF-2.5 Respuesta Visual y UX:** Implementación de librerías visuales Open-Source como `Chart.js` renderizando en lienzos Canvas (`<canvas>`) para facilitar métricas amigables al usuario sin procesamiento masivo al cliente. Uso extenso de modales UI customizados y alertas volátiles inyectadas en Javascript.
* **RNF-2.6 Compatibilidad:** Todo código Frontend usará estándares soportados por la mayoría de navegadores (ES6 JavaScript), librerías por CDN e íconos en FontAwesome sin requerir compilación WebPack u otro Bundler externo.
