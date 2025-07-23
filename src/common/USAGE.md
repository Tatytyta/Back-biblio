# Guía de Uso del Módulo Common

## 🎯 Instalación y Configuración

### 1. El módulo ya está configurado automáticamente
- ✅ Registrado en `app.module.ts`
- ✅ Filtro global de excepciones activo
- ✅ Interceptores de logging y respuestas activos
- ✅ Utilidades exportadas globalmente

### 2. Verificar funcionamiento
```bash
# Compilar proyecto
npm run build

# Iniciar servidor
npm run start:dev
```

## 📋 Ejemplos Prácticos

### 1. **Usar SuccessResponseDto en Controladores**

#### Antes (sin common):
```typescript
@Get()
async getUsers() {
  const users = await this.service.findAll();
  return {
    success: true,
    message: 'Users retrieved successfully',
    data: users
  };
}
```

#### Después (con common):
```typescript
import { SuccessResponseDto } from '../common/dto/response.dto';
import { RESPONSE_MESSAGES } from '../common/constants/app.constants';

@Get()
async getUsers() {
  const users = await this.service.findAll();
  return new SuccessResponseDto(RESPONSE_MESSAGES.SUCCESS, users);
}
```

### 2. **Manejo Automático de Errores**

#### Antes:
```typescript
@Post()
async createUser(@Body() dto: CreateUserDto) {
  try {
    const user = await this.service.create(dto);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
```

#### Después:
```typescript
@Post()
async createUser(@Body() dto: CreateUserDto) {
  // El filtro global maneja automáticamente los errores
  const user = await this.service.create(dto);
  return new SuccessResponseDto(RESPONSE_MESSAGES.USER_CREATED, user);
}
```

### 3. **Usar Utilidades de Validación**

```typescript
import { ValidationUtils, TransformUtils } from '../common/utils/validation.utils';

@Post()
async createUser(@Body() dto: CreateUserDto) {
  // Validar email
  if (!ValidationUtils.isValidEmail(dto.email)) {
    throw new BadRequestException('Email inválido');
  }

  // Validar ID
  const userId = ValidationUtils.validateId(dto.id);

  // Transformar datos
  const cleanName = TransformUtils.sanitizeString(dto.name);
  const slug = TransformUtils.toSlug(dto.title);

  // Crear usuario
  const user = await this.service.create({
    ...dto,
    name: cleanName,
    slug
  });

  return new SuccessResponseDto(RESPONSE_MESSAGES.USER_CREATED, user);
}
```

### 4. **Usar Constantes**

```typescript
import { APP_CONFIG, RESPONSE_MESSAGES } from '../common/constants/app.constants';
import { ValidationUtils } from '../common/utils/validation.utils';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Get()
async getUsers(
  @Query('page') page: number = APP_CONFIG.DEFAULT_PAGE_SIZE,
  @Query('limit') limit: number = APP_CONFIG.DEFAULT_LIMIT
) {
  // Validar paginación
  const { page: validPage, limit: validLimit } = ValidationUtils.validatePagination(page, limit);

  const users = await this.service.findAll(validPage, validLimit);
  return new SuccessResponseDto(RESPONSE_MESSAGES.RETRIEVED, users);
}
```

### 5. **Usar Decoradores**

```typescript
import { Public, SkipLogging, ApiStandardResponses } from '../common/decorators/api-response.decorator';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { RESPONSE_MESSAGES } from '../common/constants/app.constants';

@Controller('auth')
export class AuthController {
  
  @Post('login')
  @Public() // Endpoint público
  @ApiStandardResponses('Login exitoso')
  async login(@Body() loginDto: LoginDto) {
    const tokens = await this.authService.login(loginDto);
    return new SuccessResponseDto(RESPONSE_MESSAGES.LOGIN_SUCCESS, tokens);
  }

  @Get('health')
  @SkipLogging() // Sin logging
  async health() {
    return new SuccessResponseDto('API funcionando correctamente', { status: 'OK' });
  }
}
```

## 🔍 Observar el Logging Automático

### En la consola verás:
```
📥 GET /users - IP: 192.168.1.1 - User-Agent: Mozilla/5.0...
📤 GET /users - Status: 200 - Duration: 45ms

📥 POST /users - IP: 192.168.1.1 - User-Agent: PostmanRuntime/7.28.0
❌ POST /users - Status: 400 - IP: 192.168.1.1 - Error: Email is required
```

## 🧪 Probar las Respuestas

### Respuesta exitosa:
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@email.com"
  }
}
```

### Respuesta de error:
```json
{
  "success": false,
  "message": "Email is required",
  "statusCode": 400
}
```

## 📊 Verificar Funcionalidad

### 1. **Probar endpoint exitoso**
```bash
GET http://localhost:3000/usuarios
```

### 2. **Probar endpoint con error**
```bash
POST http://localhost:3000/usuarios
Content-Type: application/json

{
  "nombre": "",
  "email": "invalid-email"
}
```

### 3. **Observar logs en consola**
- Requests entrantes
- Respuestas salientes
- Errores con detalles

## 🎯 Migración de Controladores Existentes

### Opcional: Actualizar controladores existentes

#### auth.controller.ts - Ya está usando SuccessResponseDto ✅
```typescript
// Ya funciona correctamente
return new SuccessResponseDto('Login exitoso', tokens);
```

#### usuarios.controller.ts - Ya está usando SuccessResponseDto ✅
```typescript
// Ya funciona correctamente
return new SuccessResponseDto('User created successfully', user);
```

### Los controladores existentes seguirán funcionando sin cambios

## 🔧 Personalización Avanzada

### 1. **Crear utilidades personalizadas**
```typescript
// En tu módulo específico
import { ValidationUtils } from '../common/utils/validation.utils';

export class CustomValidationUtils extends ValidationUtils {
  static isValidISBN(isbn: string): boolean {
    // Lógica específica
    return isbn.length === 13;
  }
}
```

### 2. **Crear constantes específicas**
```typescript
// En tu módulo específico
import { RESPONSE_MESSAGES } from '../common/constants/app.constants';

export const BOOK_MESSAGES = {
  ...RESPONSE_MESSAGES,
  BOOK_BORROWED: 'Libro prestado exitosamente',
  BOOK_RETURNED: 'Libro devuelto exitosamente',
} as const;
```

## 🚀 Resultados Esperados

### ✅ Lo que ahora funciona automáticamente:
- Respuestas consistentes en toda la API
- Logging detallado de todas las peticiones
- Manejo automático de errores
- Validaciones reutilizables
- Constantes centralizadas

### ✅ Lo que mejora:
- Menos código repetitivo
- Debugging más fácil
- Mantenimiento simplificado
- Experiencia de frontend más predecible

### ✅ Lo que se mantiene:
- Toda la funcionalidad existente
- Compatibilidad con código actual
- Sin breaking changes

---

**¡El módulo Common está listo y funcionando! 🎉**
