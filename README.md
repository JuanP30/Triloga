# Triloga - Sistema de Gestión Hotelera

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

Sistema completo de gestión y reservas hoteleras desarrollado con arquitectura REST API. Permite administrar habitaciones, huéspedes, reservaciones y generar reportes de ocupación en tiempo real.

## 📋 Características

### Módulo de Habitaciones
- 📝 CRUD completo de habitaciones
- 💰 Gestión de precios por noche
- 🔍 Consulta de disponibilidad por fechas
- 🚫 Prevención de solapamientos en reservas

### Módulo de Huéspedes
- 👤 Registro de huéspedes con identificación
- 🔒 Validación de documentos únicos
- ✏️ Actualización y eliminación de datos

### Módulo de Reservaciones
- 📅 Creación de reservas con validación de fechas
- ✅ Confirmación y cancelación de reservas
- 💵 Cálculo automático del costo total
- ⚠️ Validación de disponibilidad antes de confirmar

### Módulo de Reportes
- 📊 Indicadores de ocupación por período
- 💰 Reportes de ingresos
- 🏨 Desglose por habitación
- 📈 Tasas de ocupación porcentuales

### Roles de Usuario
- 👑 **Administrador**: Acceso completo a todas las operaciones
- 👔 **Staff**: Gestión de huéspedes y reservas (solo lectura de habitaciones)

## 🏗️ Arquitectura

```
Triloga/
├── server.js           # API REST Express.js
├── package.json        # Dependencias Node.js
├── index.html          # Página de inicio / login
├── admin_dashboard.html # Panel de administrador
├── staff_dashboard.html # Panel de personal
├── habitaciones.html   # Gestión de habitaciones
├── reservaciones.html  # Sistema de reservas
├── disponibilidad.html # Calendario de disponibilidad
├── huespedes.html      # Gestión de huéspedes
├── reporte.html        # Reportes y estadísticas
├── css/
│   └── style.css       # Estilos globales
└── js/
    └── main.js         # Lógica frontend
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v14 o superior)
- MySQL / MariaDB
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/JuanP30/Triloga.git
cd Triloga
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar base de datos**
```sql
-- Crear base de datos
CREATE DATABASE triloga_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario (opcional)
CREATE USER 'triloga_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON triloga_db.* TO 'triloga_user'@'localhost';
FLUSH PRIVILEGES;
```

4. **Configurar variables de entorno** (opcional)
```bash
export DB_HOST=localhost
export DB_USER=triloga_user
export DB_PASSWORD=tu_password
export DB_NAME=triloga_db
export PORT=3000
```

5. **Inicializar la base de datos**
```bash
# Ejecutar script SQL inicial (si existe)
# mysql -u triloga_user -p triloga_db < database/init.sql
```

6. **Iniciar la aplicación**
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

## 🔑 Autenticación y Roles

El sistema utiliza cabeceras HTTP para identificación de roles:

```http
X-User-Role: ADMIN    # Acceso completo
X-User-Role: STAFF    # Acceso limitado
```

### Permisos por Rol

| Endpoint | ADMIN | STAFF |
|-----------|-------|-------|
| GET /api/rooms | ✅ | ✅ |
| POST /api/rooms | ✅ | ❌ |
| PUT /api/rooms/:id | ✅ | ❌ |
| DELETE /api/rooms/:id | ✅ | ❌ |
| GET /api/guests | ✅ | ✅ |
| POST /api/guests | ✅ | ✅ |
| PUT /api/guests/:id | ✅ | ✅ |
| DELETE /api/guests/:id | ✅ | ✅ |
| POST /api/reservations | ✅ | ✅ |
| PUT /api/reservations/:id/confirm | ✅ | ✅ |
| PUT /api/reservations/:id/cancel | ✅ | ✅ |
| GET /api/reports/occupancy | ✅ | ✅ |

## 📡 API Endpoints

### Habitaciones
```
GET    /api/rooms                    # Listar todas
GET    /api/rooms/availability        # Consultar disponibilidad
POST   /api/rooms                    # Crear nueva (ADMIN)
PUT    /api/rooms/:id                # Actualizar (ADMIN)
DELETE /api/rooms/:id                # Eliminar (ADMIN)
```

### Huéspedes
```
GET    /api/guests                   # Listar todos
POST   /api/guests                   # Registrar
PUT    /api/guests/:id               # Actualizar
DELETE /api/guests/:id               # Eliminar
```

### Reservaciones
```
GET    /api/reservations             # Listar todas
POST   /api/reservations             # Crear nueva
PUT    /api/reservations/:id/confirm # Confirmar reserva
PUT    /api/reservations/:id/cancel  # Cancelar reserva
```

### Reportes
```
GET    /api/reports/occupancy?from=YYYY-MM-DD&to=YYYY-MM-DD
```

## 🎨 Paleta de Colores

| Variable | Color | Uso |
|----------|-------|-----|
| `--primary` | `#2C5F2D` | Verde oliva principal |
| `--secondary` | `#97BC62` | Verde claro |
| `--accent` | `#E8F5E9` | Fondo claro |
| `--text-dark` | `#1B4332` | Texto principal |
| `--text-muted` | `#4A5568` | Texto secundario |

## 📱 Interfaz de Usuario

La interfaz está diseñada con un enfoque **mobile-first** y sigue principios de diseño minimalista:

- **Tipografía**: Inter (Google Fonts)
- **Iconos**: Font Awesome 6
- **Transiciones suaves** en todas las interacciones
- **Indicadores visuales** de estado de reservas
- **Responsive** en todos los dispositivos

## 🔍 Validaciones

### Reservas
- ✅ Fecha de check-in anterior a check-out
- ✅ Habitación debe existir
- ✅ Huésped debe existir
- ✅ No solapamiento con reservas confirmadas
- ✅ Cálculo correcto de noches y costo total

### Huéspedes
- ✅ Nombre y documento obligatorios
- ✅ Documento único (no duplicados)
- ✅ Limpieza automática de espacios en blanco

### Habitaciones
- ✅ Número, tipo y precio obligatorios
- ✅ Precio convertido a float

## 📄 Estructura de Datos

### Room
```json
{
  "id": "uuid",
  "number": "101",
  "type": "SIMPLE",
  "price_per_night": 150.00
}
```

### Guest
```json
{
  "id": "uuid",
  "name": "Juan Pérez",
  "doc_id": "12345678"
}
```

### Reservation
```json
{
  "id": "uuid",
  "room_id": "uuid",
  "guest_id": "uuid",
  "check_in": "2024-12-01",
  "check_out": "2024-12-05",
  "status": "CREADA|CONFIRMADA|CANCELADA",
  "total_cost": 600.00
}
```

## 🧪 Testing

Para pruebas manuales con Postman/Insomnia:

1. Importar colección desde `docs/api-collection.json` (si existe)
2. Establecer cabecera `X-User-Role: ADMIN` o `STAFF`
3. Probar endpoints en orden:
   - Crear habitaciones
   - Registrar huéspedes
   - Crear reservas
   - Confirmar/Cancelar

## 🐛 Troubleshooting

### Error: "Permission denied (publickey)"
```bash
# Verificar SSH
ssh -T git@github.com

# Cambiar a HTTPS
git remote set-url origin https://github.com/JuanP30/Triloga.git
```

### Puerto 3000 ocupado
```bash
# Cambiar puerto
export PORT=3001
npm run dev
```

### Base de datos no conecta
```bash
# Verificar servicio MySQL
mysql -u root -p -e "SHOW DATABASES;"

# Revisar variables de entorno
echo $DB_HOST $DB_USER $DB_PASSWORD $DB_NAME
```

## 📝 Notas de Desarrollo

- **Estado actual**: Producción listo
- **Base de datos**: En memoria (arrays) - *Pendiente integración MySQL*
- **Autenticación**: Por cabeceras (sin JWT)
- **Frontend**: Vanilla JS, sin framework

## 🚀 Mejoras Futuras

- [ ] Integración con MySQL/MongoDB persistente
- [ ] Sistema de autenticación con JWT
- [ ] Panel de administración React/Vue
- [ ] API pública para integraciones
- [ ] Notificaciones por email
- [ ] Módulo de pagos
- [ ] Multidioma (ES/EN)
- [ ] PWA para móviles

