# Endpoints CRUD del Sistema de Autenticación

## 🎯 Resumen de Implementación

**✅ CRUD COMPLETO IMPLEMENTADO:**
- ✅ **Create** (Registro de usuarios)
- ✅ **Read** (Obtener usuarios, perfil, estadísticas)
- ✅ **Update** (Actualizar perfil, cambiar contraseña, etc.)
- ✅ **Delete** (Eliminar usuarios)

## 📋 Endpoints Disponibles

### **🔐 Autenticación Básica**
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/profile` - Obtener perfil actual
- `GET /auth/verify` - Verificar token

### **👥 Gestión de Usuarios (CRUD)**

#### **📖 READ - Lectura**
```http
GET /auth/users
```
**Descripción:** Obtener todos los usuarios con filtros y paginación
**Acceso:** Solo administradores
**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 100)
- `search` (opcional): Búsqueda por nombre o email
- `role` (opcional): Filtrar por rol ('usuario' | 'administrador')
- `activo` (opcional): Filtrar por estado (true | false)
- `sortBy` (opcional): Campo de ordenamiento ('nombre' | 'email' | 'createdAt' | 'updatedAt')
- `sortOrder` (opcional): Orden ('ASC' | 'DESC')

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuarios obtenidos exitosamente",
  "data": {
    "items": [...],
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

```http
GET /auth/users/:id
```
**Descripción:** Obtener usuario específico por ID
**Acceso:** Solo administradores
**Parámetros:** `id` (number) - ID del usuario

---

```http
GET /auth/users/stats/overview
```
**Descripción:** Obtener estadísticas generales de usuarios
**Acceso:** Solo administradores
**Respuesta:**
```json
{
  "success": true,
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "total": 150,
    "active": 140,
    "inactive": 10,
    "byRole": [
      { "role": "usuario", "count": "130" },
      { "role": "administrador", "count": "20" }
    ],
    "recentRegistrations": 25
  }
}
```

#### **✏️ UPDATE - Actualización**

```http
PUT /auth/profile
```
**Descripción:** Actualizar mi perfil
**Acceso:** Usuario autenticado
**Body:**
```json
{
  "nombre": "Nuevo Nombre",
  "email": "nuevo@email.com"
}
```

---

```http
PUT /auth/users/:id
```
**Descripción:** Actualizar cualquier usuario
**Acceso:** Solo administradores
**Body:**
```json
{
  "nombre": "Nombre Usuario",
  "email": "usuario@email.com",
  "role": "usuario",
  "activo": true
}
```

---

```http
PUT /auth/change-password
```
**Descripción:** Cambiar mi contraseña
**Acceso:** Usuario autenticado
**Body:**
```json
{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña"
}
```

---

```http
PUT /auth/users/:id/reset-password
```
**Descripción:** Resetear contraseña de un usuario
**Acceso:** Solo administradores
**Body:**
```json
{
  "newPassword": "nueva_contraseña"
}
```

---

```http
PUT /auth/users/:id/toggle-status
```
**Descripción:** Activar/Desactivar usuario
**Acceso:** Solo administradores
**Sin body** - Alterna el estado actual

---

```http
PUT /auth/deactivate-account
```
**Descripción:** Desactivar mi propia cuenta
**Acceso:** Usuario autenticado
**Body:**
```json
{
  "password": "mi_contraseña",
  "reason": "Razón opcional"
}
```

#### **🗑️ DELETE - Eliminación**

```http
DELETE /auth/users/:id
```
**Descripción:** Eliminar usuario permanentemente
**Acceso:** Solo administradores
**Parámetros:** `id` (number) - ID del usuario

## 🔒 Niveles de Acceso

### **🟢 Público (Sin autenticación)**
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`

### **🟡 Autenticado (Cualquier usuario)**
- `GET /auth/profile`
- `GET /auth/verify`
- `POST /auth/logout`
- `PUT /auth/profile`
- `PUT /auth/change-password`
- `PUT /auth/deactivate-account`

### **🔴 Administrador Únicamente**
- `GET /auth/users`
- `GET /auth/users/:id`
- `GET /auth/users/stats/overview`
- `PUT /auth/users/:id`
- `PUT /auth/users/:id/reset-password`
- `PUT /auth/users/:id/toggle-status`
- `DELETE /auth/users/:id`

## 🛡️ Seguridad Implementada

### **Validaciones**
- ✅ Validación de datos con class-validator
- ✅ Sanitización de inputs
- ✅ Verificación de permisos por rol
- ✅ Verificación de contraseñas actuales

### **Protecciones**
- ✅ Tokens JWT con expiración
- ✅ Refresh tokens con versioning
- ✅ Revocación automática de tokens
- ✅ Hashing seguro de contraseñas (bcrypt)

### **Auditoría**
- ✅ Logging de operaciones sensibles
- ✅ Registro de cambios de contraseña
- ✅ Tracking de activaciones/desactivaciones

## 📊 Casos de Uso Comunes

### **1. Panel de Administración**
```typescript
// Obtener usuarios con filtros
GET /auth/users?page=1&limit=10&role=usuario&activo=true

// Obtener estadísticas
GET /auth/users/stats/overview

// Desactivar usuario problemático
PUT /auth/users/123/toggle-status
```

### **2. Gestión de Perfil**
```typescript
// Actualizar mi perfil
PUT /auth/profile
Body: { "nombre": "Nuevo Nombre", "email": "nuevo@email.com" }

// Cambiar contraseña
PUT /auth/change-password
Body: { "currentPassword": "actual", "newPassword": "nueva" }
```

### **3. Administración de Usuarios**
```typescript
// Resetear contraseña de usuario
PUT /auth/users/123/reset-password
Body: { "newPassword": "temp123" }

// Eliminar usuario
DELETE /auth/users/123
```

## 🚀 Ejemplos de Respuestas

### **Éxito**
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

### **Error de Validación**
```json
{
  "success": false,
  "message": "Datos inválidos",
  "statusCode": 400,
  "error": [
    "El email debe tener un formato válido",
    "La contraseña debe tener al menos 6 caracteres"
  ]
}
```

### **Error de Permisos**
```json
{
  "success": false,
  "message": "No tienes permisos para realizar esta acción",
  "statusCode": 403
}
```

## 🔧 Configuración en Postman

### **Variables de Entorno**
- `base_url`: http://localhost:3000
- `access_token`: (se actualiza automáticamente)
- `refresh_token`: (se actualiza automáticamente)

### **Headers para Requests Autenticadas**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**🎉 El sistema de autenticación ahora tiene CRUD completo con todas las funcionalidades modernas de gestión de usuarios y seguridad avanzada.**
