# Módulo de Préstamos

Este módulo gestiona los préstamos de libros en el sistema de biblioteca.

## Características

- CRUD completo de préstamos
- Gestión de devoluciones y renovaciones
- Control de multas por retraso
- Validaciones de negocio robustas
- Límites de préstamos por usuario
- Estadísticas de préstamos
- Autenticación JWT con roles
- Paginación

## Endpoints

### Crear Préstamo
- **POST** `/prestamos`
- Crea un nuevo préstamo
- Requiere autenticación y rol admin/bibliotecario
- Valida disponibilidad de libros y límites de usuario

### Obtener Préstamos
- **GET** `/prestamos`
- Obtiene todos los préstamos con paginación
- Parámetros: `page`, `limit`

### Obtener Préstamo por ID
- **GET** `/prestamos/:id`
- Obtiene un préstamo específico por su ID

### Obtener Préstamos por Usuario
- **GET** `/prestamos/usuario/:usuarioId`
- Obtiene préstamos de un usuario específico
- Parámetros: `page`, `limit`

### Obtener Préstamos por Libro
- **GET** `/prestamos/libro/:libroId`
- Obtiene préstamos de un libro específico
- Parámetros: `page`, `limit`

### Obtener Préstamos por Estado
- **GET** `/prestamos/estado/:estado`
- Obtiene préstamos por estado (activo, devuelto, vencido, renovado)
- Parámetros: `page`, `limit`

### Obtener Préstamos Vencidos
- **GET** `/prestamos/vencidos`
- Obtiene todos los préstamos vencidos
- Requiere autenticación

### Estadísticas
- **GET** `/prestamos/estadisticas`
- Obtiene estadísticas de préstamos
- Requiere autenticación y rol admin/bibliotecario

### Devolver Préstamo
- **PATCH** `/prestamos/:id/devolver`
- Marca un préstamo como devuelto
- Requiere autenticación y rol admin/bibliotecario
- Calcula multas automáticamente

### Renovar Préstamo
- **PATCH** `/prestamos/:id/renovar`
- Renueva un préstamo activo
- Requiere autenticación
- Valida condiciones de renovación

### Actualizar Préstamo
- **PUT** `/prestamos/:id`
- Actualiza un préstamo existente
- Requiere autenticación y rol admin/bibliotecario

### Eliminar Préstamo
- **DELETE** `/prestamos/:id`
- Elimina un préstamo (solo devueltos)
- Requiere autenticación y rol admin

### Actualizar Préstamos Vencidos
- **POST** `/prestamos/actualizar-vencidos`
- Ejecuta proceso para marcar préstamos vencidos
- Requiere autenticación y rol admin/bibliotecario

## DTOs

### CreatePrestamoDto
```typescript
{
  usuarioId: number;
  libroId: number;
  fechaDevolucionEstimada: Date;
  estado?: EstadoPrestamo;
  observaciones?: string;
}
```

### UpdatePrestamoDto
```typescript
{
  fechaDevolucionReal?: Date;
  estado?: EstadoPrestamo;
  observaciones?: string;
  diasRetraso?: number;
  multaAcumulada?: number;
}
```

### DevolucionPrestamoDto
```typescript
{
  fechaDevolucionReal: Date;
  observaciones?: string;
}
```

### RenovarPrestamoDto
```typescript
{
  fechaDevolucionEstimada: Date;
  observaciones?: string;
}
```

## Estados de Préstamo

- **ACTIVO**: Préstamo en curso
- **DEVUELTO**: Préstamo devuelto correctamente
- **VENCIDO**: Préstamo con fecha de devolución vencida
- **RENOVADO**: Préstamo que ha sido renovado

## Validaciones de Negocio

### Creación de Préstamos
- Usuario debe existir
- Libro debe existir y tener ejemplares disponibles
- Usuario no puede tener préstamos vencidos
- Límite máximo de 5 préstamos activos por usuario
- Usuario no puede tener el mismo libro prestado múltiples veces

### Devolución
- Solo se pueden devolver préstamos activos o vencidos
- Se calcula automáticamente la multa si hay retraso
- Se incrementan los ejemplares disponibles del libro

### Renovación
- Solo se pueden renovar préstamos activos
- No se pueden renovar préstamos vencidos
- Se actualiza la fecha de devolución estimada

### Sistema de Multas
- Multa de $2.00 por día de retraso
- Cálculo automático basado en fecha de devolución estimada
- Actualización automática para préstamos vencidos

## Relaciones

- **ManyToOne** con Usuario
- **ManyToOne** con Libro
- Eager loading de relaciones para mejor rendimiento

## Características Avanzadas

### Métodos de Cálculo
- `estaVencido`: Getter para determinar si un préstamo está vencido
- `calcularDiasRetraso`: Getter para calcular días de retraso

### Proceso Automático
- `actualizarPrestamosVencidos()`: Actualiza estado y multas de préstamos vencidos

### Estadísticas Completas
- Total de préstamos
- Préstamos por estado
- Multa total acumulada

## Autenticación

- Los endpoints de creación, actualización y eliminación requieren autenticación JWT
- Los endpoints administrativos requieren rol admin o bibliotecario
- La renovación puede ser realizada por usuarios autenticados
- Los endpoints de lectura general son públicos
