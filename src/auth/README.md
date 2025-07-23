# Módulo de Autenticación

## Resumen de Cambios Realizados

### 1. **Consistencia en Payloads JWT**
- Estandarizado el payload JWT para incluir: `id`, `username`, `email`, `role`
- Los payloads son consistentes entre login y register

### 2. **Mejoras en AuthService**
- Agregado soporte para login con email o username
- Verificación de usuario activo antes del login
- Mejores mensajes de error y logging
- Métodos adicionales: `validateUser()` y `verifyToken()`

### 3. **JWT Strategy mejorado**
- Uso consistente de `ConfigService` en lugar de `process.env`
- Tipado fuerte con interfaces personalizadas
- Validación robusta del payload

### 4. **Decoradores útiles**
- `@GetUser()`: Obtiene el usuario actual del request
- `@Roles()`: Define roles requeridos para endpoints

### 5. **Guards mejorados**
- `JwtAuthGuard`: Autenticación JWT estándar
- `RolesGuard`: Autorización basada en roles (mejorado)

### 6. **Tipado TypeScript**
- Interfaces `AuthUser` y `JwtPayload` para mejor tipado
- Eliminación de tipos `any`

### 7. **Mejor manejo de errores**
- Excepciones específicas con mensajes claros
- Logging estructurado para debugging

## Uso del Módulo

### Autenticación en Controladores

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../auth/types/auth.types';

@Controller('protected')
export class ProtectedController {
  
  // Endpoint que requiere autenticación
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() user: AuthUser) {
    return { message: 'Perfil del usuario', user };
  }

  // Endpoint que requiere autenticación y rol específico
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  getAdminData(@GetUser() user: AuthUser) {
    return { message: 'Datos de administrador', user };
  }
}
```

### Endpoints de Autenticación

- `POST /auth/login`: Login con username/email y password
- `POST /auth/register`: Registro de nuevo usuario
- `GET /auth/profile`: Obtener perfil del usuario autenticado
- `GET /auth/verify`: Verificar validez del token

### Estructura del Token JWT

```json
{
  "id": 1,
  "username": "nombreUsuario",
  "email": "usuario@email.com",
  "role": "usuario",
  "iat": 1640995200,
  "exp": 1640998800
}
```

### Variables de Entorno Requeridas

```env
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRES_IN=1h
```

## Archivos Creados/Modificados

### Nuevos Archivos:
- `auth/decorators/roles.decorator.ts`
- `auth/decorators/get-user.decorator.ts`
- `auth/types/auth.types.ts`

### Archivos Modificados:
- `auth/auth.service.ts`
- `auth/auth.controller.ts`
- `auth/auth.module.ts`
- `auth/jwt.strategy.ts`
- `auth/guards/roles.guard.ts`
- `auth/dto/login.dto.ts`
- `usuarios/usuarios.service.ts`

## Ventajas de los Cambios

1. **Consistencia**: Todos los componentes usan las mismas estructuras
2. **Flexibilidad**: Login con email o username
3. **Seguridad**: Verificación de usuario activo y roles
4. **Mantenibilidad**: Código bien tipado y documentado
5. **Escalabilidad**: Base sólida para futuras funcionalidades
6. **Debugging**: Mejor logging y manejo de errores
