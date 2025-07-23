# Módulo de Actividad de Usuarios

## Resumen de Mejoras Implementadas

### 🚀 **Funcionalidades Nuevas**

#### **1. Sistema de Tipos de Actividad**
- Enum `TipoActividad` con 8 tipos predefinidos:
  - `BUSQUEDA` - Búsquedas de libros
  - `PRESTAMO` - Préstamos realizados
  - `DEVOLUCION` - Devoluciones de libros
  - `RESENA` - Reseñas creadas
  - `LOGIN` - Inicios de sesión
  - `LOGOUT` - Cierres de sesión
  - `REGISTRO` - Registros de usuarios
  - `VISUALIZACION` - Visualizaciones de libros

#### **2. Schema MongoDB Mejorado**
- **Índices optimizados** para consultas frecuentes
- **Campos adicionales**: `ipAddress`, `userAgent`, `metadata`
- **Contadores**: `totalEventos`, `ultimaActividad`
- **Validaciones**: Enum para tipos de actividad

#### **3. Autenticación y Autorización**
- **JWT Guards** en todos los endpoints
- **Roles** diferenciados (administrador vs usuario)
- **Endpoints personales** para usuarios normales
- **Endpoints administrativos** para administradores

#### **4. Endpoints Ampliados**

##### **Públicos (Requieren autenticación)**
- `POST /mi-actividad` - Registrar actividad propia
- `GET /mi-actividad` - Ver mi actividad
- `GET /mis-estadisticas` - Ver mis estadísticas

##### **Administrativos (Requieren rol admin)**
- `POST /:idUsuario` - Registrar actividad para cualquier usuario
- `GET /` - Ver todas las actividades
- `GET /estadisticas` - Estadísticas globales
- `GET /usuario/:idUsuario` - Actividad de usuario específico
- `GET /usuario/:idUsuario/estadisticas` - Estadísticas de usuario
- `DELETE /:id` - Eliminar actividad completa
- `DELETE /usuario/:idUsuario/evento/:eventoId` - Eliminar evento específico
- `POST /limpiar-antiguas` - Limpiar actividades antiguas

#### **5. Filtros y Búsqueda Avanzada**
- **Paginación completa** con metadatos
- **Filtros por fecha** (inicio y fin)
- **Filtros por tipo** de actividad
- **Búsqueda de texto** en descripciones y consultas
- **Ordenamiento** por fecha descendente

#### **6. Estadísticas Avanzadas**
- **Estadísticas por día** para gráficos temporales
- **Estadísticas por tipo** de actividad
- **Períodos configurables** (días)
- **Datos para dashboards**

#### **7. Herramientas de Automatización**

##### **Interceptor Automático**
- `RegistrarActividadInterceptor` - Registra actividades automáticamente
- **Mapeo inteligente** de rutas a tipos de actividad
- **Información contextual** (IP, User-Agent, etc.)

##### **Helper de Actividades**
- `ActividadHelper` - Métodos específicos para cada tipo
- **Registros estructurados** con metadatos
- **Fácil integración** en otros módulos

## Ejemplos de Uso

### **1. Registrar Actividad Manual**
```typescript
// En cualquier servicio
constructor(private actividadHelper: ActividadHelper) {}

async buscarLibros(usuario: AuthUser, consulta: string) {
  const libros = await this.buscarEnDB(consulta);
  
  // Registrar la búsqueda
  await this.actividadHelper.registrarBusqueda(
    usuario.id, 
    consulta, 
    libros.length
  );
  
  return libros;
}
```

### **2. Usar Interceptor Automático**
```typescript
@Controller('libros')
@UseInterceptors(RegistrarActividadInterceptor)
export class LibrosController {
  // Todas las acciones se registran automáticamente
}
```

### **3. Consultar Actividades**
```typescript
// Obtener actividades de un usuario con filtros
const actividades = await this.actividadService.obtenerPorUsuario(
  userId, 
  {
    page: 1,
    limit: 10,
    tipo: TipoActividad.BUSQUEDA,
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31'
  }
);
```

### **4. Estadísticas**
```typescript
// Obtener estadísticas de los últimos 30 días
const stats = await this.actividadService.obtenerEstadisticas(
  userId, 
  { dias: 30 }
);
```

## Estructura de Datos

### **Evento de Actividad**
```typescript
{
  tipo: TipoActividad.BUSQUEDA,
  descripcion: 'Búsqueda: "javascript"',
  consulta: 'javascript',
  idLibro: 123,
  idPrestamo: 456,
  idResena: 789,
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  fecha: '2024-01-15T10:30:00Z',
  metadata: {
    resultados: 5,
    tituloLibro: 'JavaScript: The Good Parts'
  }
}
```

### **Respuesta de Actividades**
```typescript
{
  success: true,
  message: 'Actividades obtenidas correctamente',
  data: {
    items: [...],
    page: 1,
    limit: 10,
    total: 150,
    totalPages: 15,
    hasNextPage: true,
    hasPrevPage: false
  }
}
```

### **Respuesta de Estadísticas**
```typescript
{
  success: true,
  message: 'Estadísticas obtenidas correctamente',
  data: {
    estadisticasPorDia: [
      { _id: { fecha: '2024-01-15', tipo: 'busqueda' }, count: 5 }
    ],
    estadisticasPorTipo: [
      { _id: 'busqueda', count: 25 },
      { _id: 'prestamo', count: 15 }
    ],
    periodo: {
      dias: 30,
      fechaInicio: '2024-01-01T00:00:00Z',
      fechaFin: '2024-01-31T23:59:59Z'
    }
  }
}
```

## Configuración Recomendada

### **1. En otros módulos (ej: LibrosModule)**
```typescript
@Module({
  imports: [ActividadUsuariosModule],
  // ...
})
export class LibrosModule {}
```

### **2. En controladores**
```typescript
@Controller('libros')
@UseInterceptors(RegistrarActividadInterceptor)
export class LibrosController {
  constructor(private actividadHelper: ActividadHelper) {}
  
  @Get('search')
  async buscar(@Query('q') query: string, @GetUser() user: AuthUser) {
    const libros = await this.librosService.buscar(query);
    
    // Registrar búsqueda
    await this.actividadHelper.registrarBusqueda(
      user.id, 
      query, 
      libros.length
    );
    
    return libros;
  }
}
```

## Beneficios de las Mejoras

### 🔒 **Seguridad**
- Autenticación requerida en todos los endpoints
- Separación clara entre usuarios y administradores
- Validación robusta de todos los datos

### 📊 **Analytics**
- Seguimiento detallado de todas las actividades
- Estadísticas en tiempo real
- Datos para dashboards y reportes

### 🚀 **Performance**
- Índices optimizados en MongoDB
- Paginación eficiente
- Consultas agregadas optimizadas

### 🔧 **Mantenibilidad**
- Código bien estructurado y tipado
- Helpers reutilizables
- Interceptores automáticos
- Documentación completa

### 📈 **Escalabilidad**
- Fácil agregar nuevos tipos de actividad
- Sistema de limpieza automática
- Metadatos extensibles
- Modular y extensible

**El módulo ahora está completamente mejorado y listo para un entorno de producción con todas las funcionalidades modernas de tracking y analytics.**
