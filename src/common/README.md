# Módulo Common

El módulo `common` proporciona utilidades, filtros, interceptores y funcionalidades compartidas para toda la aplicación NestJS.

## 🏗️ Estructura

```
common/
├── constants/
│   └── app.constants.ts      # Constantes globales
├── decorators/
│   └── api-response.decorator.ts  # Decoradores para API
├── dto/
│   └── response.dto.ts       # DTOs de respuesta
├── filters/
│   └── http-exception.filter.ts   # Filtro global de excepciones
├── interceptors/
│   ├── logging.interceptor.ts     # Interceptor de logging
│   └── response.interceptor.ts    # Interceptor de respuestas
├── utils/
│   └── validation.utils.ts   # Utilidades de validación
└── common.module.ts          # Módulo principal
```

## 🚀 Características

### 1. **Respuestas Estandarizadas**
```typescript
// SuccessResponseDto
{
  success: true,
  message: "Operación exitosa",
  data: { ... }
}

// ErrorResponseDto
{
  success: false,
  message: "Error específico",
  statusCode: 400,
  error: { ... }
}
```

### 2. **Filtro Global de Excepciones**
- Captura automáticamente todos los errores
- Convierte excepciones en respuestas consistentes
- Logging detallado de errores
- Información de debug en desarrollo

### 3. **Interceptores**

#### **LoggingInterceptor**
- Registra todas las peticiones HTTP
- Mide tiempo de respuesta
- Información detallada de IP y User-Agent

#### **ResponseInterceptor**
- Estandariza respuestas automáticamente
- Envuelve respuestas simples en SuccessResponseDto
- Respeta respuestas ya estructuradas

### 4. **Utilidades de Validación**
```typescript
// ValidationUtils
ValidationUtils.isValidEmail(email);
ValidationUtils.validatePagination(page, limit);
ValidationUtils.validateId(id);

// TransformUtils
TransformUtils.toBoolean(value);
TransformUtils.sanitizeString(value);
TransformUtils.toSlug(value);

// DateUtils
DateUtils.getStartOfDay(date);
DateUtils.daysDifference(date1, date2);
```

### 5. **Constantes Globales**
```typescript
// Configuración
APP_CONFIG.DEFAULT_PAGE_SIZE
APP_CONFIG.MIN_PASSWORD_LENGTH

// Mensajes
RESPONSE_MESSAGES.SUCCESS
RESPONSE_MESSAGES.USER_CREATED

// Estados HTTP
HTTP_STATUS.OK
HTTP_STATUS.BAD_REQUEST
```

### 6. **Decoradores**
```typescript
// Para documentación de API
@ApiSuccessResponse('Usuario creado')
@ApiErrorResponse('Error de validación', 400)
@ApiStandardResponses('Operación exitosa')

// Para configuración
@Public() // Endpoint público
@SkipLogging() // Sin logging
```

## 📋 Uso

### En Controladores
```typescript
import { SuccessResponseDto } from '../common/dto/response.dto';
import { RESPONSE_MESSAGES } from '../common/constants/app.constants';

@Controller('users')
export class UsersController {
  @Get()
  async getUsers() {
    const users = await this.service.findAll();
    return new SuccessResponseDto(RESPONSE_MESSAGES.SUCCESS, users);
  }
}
```

### Con Utilidades
```typescript
import { ValidationUtils, TransformUtils } from '../common/utils/validation.utils';

// Validación
const isValid = ValidationUtils.isValidEmail(email);
const { page, limit } = ValidationUtils.validatePagination(1, 10);

// Transformación
const slug = TransformUtils.toSlug(title);
const cleanString = TransformUtils.sanitizeString(input);
```

### Con Constantes
```typescript
import { APP_CONFIG, RESPONSE_MESSAGES } from '../common/constants/app.constants';

// Usar constantes
const pageSize = APP_CONFIG.DEFAULT_PAGE_SIZE;
const message = RESPONSE_MESSAGES.USER_CREATED;
```

## 🔧 Configuración

### Automática
El módulo `CommonModule` está marcado como `@Global()` y se registra automáticamente:
- Filtro global de excepciones
- Interceptores de logging y respuestas
- Proveedores exportables

### Manual
```typescript
// Si necesitas usar componentes específicos
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  // ...
})
export class MyModule {}
```

## 🌟 Beneficios

### 1. **Consistencia Total**
- Todas las respuestas siguen el mismo formato
- Manejo uniforme de errores
- Logging estandarizado

### 2. **Menos Código**
- Respuestas automáticamente estructuradas
- Utilidades reutilizables
- Constantes centralizadas

### 3. **Mejor Debugging**
- Logging detallado automático
- Información de contexto en errores
- Stack traces en desarrollo

### 4. **Escalabilidad**
- Fácil agregar nuevas utilidades
- Módulo global reutilizable
- Cambios centralizados

### 5. **Mejor UX para Frontend**
- Respuestas predecibles
- Manejo de errores consistente
- Estructura tipada

## 🔍 Logging

### Requests
```
📥 GET /users - IP: 192.168.1.1 - User-Agent: Mozilla/5.0...
📤 GET /users - Status: 200 - Duration: 45ms
```

### Errores
```
❌ POST /users - Status: 400 - IP: 192.168.1.1 - Error: Email is required
```

## 📊 Monitoreo

El módulo permite:
- Tracking de performance por endpoint
- Conteo de errores por tipo
- Análisis de patrones de uso
- Métricas de respuesta

## 🛡️ Seguridad

- Sanitización automática de strings
- Validación de entrada centralizada
- Logging de actividad sospechosa
- Ocultación de stack traces en producción

## 🔄 Evolución

### Próximas características:
- Métricas de performance
- Cache de respuestas
- Rate limiting
- Compresión automática
- Versionado de API

---

**El módulo Common es la base fundamental para una aplicación NestJS profesional, escalable y mantenible.**
