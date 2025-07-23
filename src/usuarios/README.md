# Módulo de Usuarios

Este módulo maneja la gestión completa de usuarios del sistema de biblioteca, incluyendo creación, autenticación, autorización y administración.

## Características Principales

### 🔐 **Gestión de Usuarios**
- Registro y creación de usuarios
- Autenticación con JWT
- Roles (usuario, administrador)
- Activación/desactivación de cuentas
- Gestión de contraseñas seguras

### 📊 **Funcionalidades Avanzadas**
- Búsqueda y filtrado de usuarios
- Paginación eficiente
- Estadísticas de usuarios
- Validaciones robustas
- Manejo de errores completo

## Estructura del Módulo

```
usuarios/
├── dto/
│   ├── create-usuario.dto.ts      # DTO para crear usuarios
│   └── update-usuario.dto.ts      # DTOs para actualizar usuarios
├── usuario.entity.ts              # Entidad de base de datos
├── usuarios.controller.ts         # Controlador REST
├── usuarios.service.ts            # Lógica de negocio
├── usuarios.module.ts             # Configuración del módulo
├── usuarios.controller.spec.ts    # Pruebas del controlador
└── usuarios.service.spec.ts       # Pruebas del servicio
```

## Entidad Usuario

### Campos
- `id`: Identificador único (auto-generado)
- `nombre`: Nombre de usuario (único, 2-50 caracteres)
- `email`: Correo electrónico (único, formato válido)
- `password`: Contraseña hasheada (mínimo 6 caracteres con validaciones)
- `role`: Rol del usuario ('usuario' | 'administrador')
- `activo`: Estado de la cuenta (true/false)
- `tokenVersion`: Versión del token para invalidación
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

### Relaciones
- `prestamos`: Relación uno a muchos con préstamos

## DTOs (Data Transfer Objects)

### CreateUsuarioDto
```typescript
{
  nombre: string;        // 2-50 caracteres
  email: string;         // Formato email válido
  password: string;      // Mínimo 6 caracteres, con mayúscula, minúscula y número
  role?: string;         // 'usuario' | 'administrador'
}
```

### UpdateUsuarioDto
```typescript
{
  nombre?: string;
  email?: string;
  password?: string;
  role?: string;
  activo?: boolean;
}
```

### Otros DTOs
- `RegistroUsuarioDto`: Para registro público (sin role)
- `CambiarPasswordDto`: Para cambio de contraseña
- `FiltroUsuariosDto`: Para filtrado y búsqueda

## API Endpoints

### Endpoints Públicos
- `POST /usuarios/registro-publico` - Registro de nuevos usuarios

### Endpoints Autenticados
- `GET /usuarios/mi-perfil` - Obtener perfil del usuario actual
- `PUT /usuarios/mi-perfil` - Actualizar perfil propio
- `PATCH /usuarios/cambiar-password` - Cambiar contraseña

### Endpoints de Administrador
- `POST /usuarios` - Crear usuario (admin)
- `GET /usuarios` - Listar usuarios con filtros
- `GET /usuarios/estadisticas` - Estadísticas de usuarios
- `GET /usuarios/buscar` - Buscar usuarios
- `GET /usuarios/:id` - Obtener usuario por ID
- `PUT /usuarios/:id` - Actualizar usuario
- `PATCH /usuarios/:id/activar` - Activar usuario
- `PATCH /usuarios/:id/desactivar` - Desactivar usuario
- `DELETE /usuarios/:id` - Eliminar usuario

### Endpoints de Compatibilidad
- `POST /usuarios/create`
- `GET /usuarios/find-all`
- `GET /usuarios/find-one/:id`
- `PUT /usuarios/update/:id`
- `DELETE /usuarios/remove/:id`

## Filtros y Búsqueda

### Parámetros de Filtrado
- `search`: Búsqueda por nombre o email
- `role`: Filtrar por rol
- `activo`: Filtrar por estado activo
- `sortBy`: Campo de ordenamiento (nombre, email, createdAt, role)
- `sortOrder`: Orden (ASC, DESC)
- `page`: Página actual (default: 1)
- `limit`: Elementos por página (default: 10)

### Ejemplo de Uso
```http
GET /usuarios?search=juan&role=usuario&activo=true&page=1&limit=10
```

## Validaciones

### Contraseña Segura
- Mínimo 6 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Caracteres especiales permitidos: @$!%*?&

### Email
- Formato de email válido
- Único en el sistema
- Transformado a minúsculas

### Nombre
- 2-50 caracteres
- Único en el sistema
- Espacios recortados automáticamente

## Seguridad

### Autenticación
- JWT con guards personalizados
- Verificación de tokens
- Control de versión de tokens

### Autorización
- Roles basados en decoradores
- Guards de roles
- Middleware de validación

### Protección de Datos
- Contraseñas hasheadas con bcrypt (12 rounds)
- Validación de entrada robusta
- Sanitización de datos

## Estadísticas

El endpoint de estadísticas proporciona:
- Total de usuarios
- Usuarios activos/inactivos
- Distribución por roles
- Registros recientes (últimos 30 días)
- Últimos 5 usuarios registrados

## Manejo de Errores

### Errores Comunes
- `ConflictException`: Email o nombre duplicado
- `NotFoundException`: Usuario no encontrado
- `BadRequestException`: Datos inválidos
- `UnauthorizedException`: Token inválido
- `ForbiddenException`: Permisos insuficientes

### Validaciones de Negocio
- No se puede eliminar usuarios con préstamos activos
- No se puede desactivar usuarios con préstamos activos
- Verificación de contraseña actual para cambios

## Relaciones con Otros Módulos

### Módulo Auth
- Utiliza UsuariosService para autenticación
- Importa DTOs de usuario
- Maneja tokens y sesiones

### Módulo Prestamos
- Relación con préstamos de usuarios
- Validaciones de integridad referencial

### Módulo Actividad-Usuarios
- Registra actividades de usuarios
- Seguimiento de acciones

## Pruebas

### Cobertura de Pruebas
- Creación de usuarios
- Validación de duplicados
- Búsqueda y filtrado
- Métodos de compatibilidad
- Manejo de errores

### Ejecutar Pruebas
```bash
npm run test usuarios.service.spec.ts
npm run test usuarios.controller.spec.ts
```

## Configuración

### Dependencias
- TypeORM para base de datos
- bcrypt para hash de contraseñas
- class-validator para validaciones
- nestjs-typeorm-paginate para paginación

### Variables de Entorno
- JWT_SECRET: Secreto para tokens JWT
- JWT_EXPIRES_IN: Tiempo de expiración de tokens

## Uso Típico

### Registro de Usuario
```typescript
const nuevoUsuario = await usuariosService.crear({
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  password: 'Password123',
  role: 'usuario'
});
```

### Búsqueda con Filtros
```typescript
const usuarios = await usuariosService.obtenerTodos({
  page: 1,
  limit: 10,
  filtros: {
    search: 'juan',
    activo: true,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  }
});
```

### Cambio de Contraseña
```typescript
await usuariosService.cambiarPassword(userId, {
  passwordActual: 'oldPassword',
  nuevaPassword: 'NewPassword123'
});
```

## Mejores Prácticas

1. **Validación**: Siempre validar datos de entrada
2. **Seguridad**: Usar contraseñas seguras y tokens JWT
3. **Paginación**: Implementar paginación para listas grandes
4. **Filtrado**: Proporcionar opciones de filtrado flexibles
5. **Errores**: Manejar errores de forma consistente
6. **Pruebas**: Mantener cobertura de pruebas alta
7. **Documentación**: Documentar todos los endpoints y DTOs

## Notas de Migración

- Compatible con versiones anteriores
- Endpoints legacy mantenidos para compatibilidad
- Nuevos endpoints siguen convenciones mejoradas
- DTOs actualizados con validaciones avanzadas
