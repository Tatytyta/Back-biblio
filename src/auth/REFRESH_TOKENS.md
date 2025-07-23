# Sistema de Refresh Tokens - Documentación

## ¿Qué es un Refresh Token?

Un **Refresh Token** es un token de larga duración que se utiliza para obtener nuevos Access Tokens sin que el usuario tenga que volver a autenticarse. Esto mejora significativamente la experiencia del usuario y la seguridad.

## Beneficios del Sistema

### 🔒 **Seguridad**
- Los Access Tokens tienen vida corta (1 hora por defecto)
- Los Refresh Tokens se pueden revocar individualmente
- Control granular sobre las sesiones de usuario

### 🚀 **Experiencia de Usuario**
- No necesita volver a loguearse frecuentemente
- Renovación automática de tokens
- Sesiones persistentes pero seguras

### 📱 **Facilidad en Postman**
- Auto-refresh automático con scripts
- Manejo transparente de tokens expirados
- Headers informativos sobre el estado del token

## Endpoints Nuevos

### `POST /auth/refresh`
Renueva un Access Token usando un Refresh Token válido.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token renovado exitosamente",
  "data": {
    "access_token": "nuevo_access_token",
    "expires_in": 3600
  }
}
```

### `POST /auth/logout`
Revoca todos los Refresh Tokens del usuario (cierre de sesión en todos los dispositivos).

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente",
  "data": null
}
```

## Respuestas Actualizadas

### Login y Register
Ahora devuelven ambos tokens:

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer"
  }
}
```

## Configuración en Postman

### 1. Variables de Entorno
Crear las siguientes variables en tu entorno de Postman:

- `base_url`: http://localhost:3000
- `access_token`: (se llenará automáticamente)
- `refresh_token`: (se llenará automáticamente)
- `token_expiry`: (se llenará automáticamente)

### 2. Scripts Pre-Request
Agregar el script de `postman-scripts/auto-refresh.js` como **Pre-request Script** en:
- Todas las requests que requieren autenticación
- O mejor aún, a nivel de colección para aplicar a todas las requests

### 3. Scripts de Test
Agregar el script de test a los endpoints de login/register para guardar automáticamente los tokens.

### 4. Configuración Automática
Una vez configurado, Postman:
- ✅ Guardará automáticamente los tokens después del login
- ✅ Verificará automáticamente si el token está próximo a expirar
- ✅ Renovará automáticamente el token cuando sea necesario
- ✅ Actualizará el header Authorization automáticamente

## Ejemplo de Uso Manual

### 1. Login inicial
```bash
POST /auth/login
{
  "username": "usuario@email.com",
  "password": "password123"
}
```

### 2. Usar el Access Token
```bash
GET /auth/profile
Authorization: Bearer <access_token>
```

### 3. Cuando el token expire (automático en Postman)
```bash
POST /auth/refresh
{
  "refreshToken": "<refresh_token>"
}
```

### 4. Logout (opcional)
```bash
POST /auth/logout
Authorization: Bearer <access_token>
```

## Headers Informativos

El sistema incluye headers que te informan sobre el estado del token:

- `X-Token-Refresh-Required: true` - Indica que el token expira pronto

## Configuración del Servidor

### Variables de Entorno Requeridas:
```env
JWT_SECRET=tu_clave_secreta_access_token
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=tu_clave_secreta_refresh_token
JWT_REFRESH_EXPIRES_IN=7d
```

### Tiempos Recomendados:
- **Access Token**: 1 hora (corto por seguridad)
- **Refresh Token**: 7 días (balance entre seguridad y usabilidad)

## Seguridad Implementada

### Token Versioning
- Cada usuario tiene un `tokenVersion` que se incrementa al revocar tokens
- Previene el uso de tokens robados después de un logout

### Validaciones
- Verificación de usuario activo
- Validación de versión de token
- Verificación de expiración

### Revocación
- Logout revoca todos los refresh tokens del usuario
- Útil para cerrar sesión en todos los dispositivos

## Migración de Base de Datos

Se agregó el campo `tokenVersion` a la tabla usuarios:

```sql
ALTER TABLE usuarios ADD COLUMN tokenVersion INTEGER DEFAULT 0;
```

## Ejemplo de Flujo Completo

1. **Usuario se loguea** → Recibe access_token + refresh_token
2. **Usuario hace requests** → Usa access_token (válido por 1 hora)
3. **Token próximo a expirar** → Postman detecta automáticamente
4. **Auto-refresh** → Postman renueva automáticamente usando refresh_token
5. **Continúa usando la app** → Sin interrupciones
6. **Usuario hace logout** → Todos los tokens se revocan

Este sistema proporciona una experiencia fluida y segura tanto para desarrollo como para producción.
