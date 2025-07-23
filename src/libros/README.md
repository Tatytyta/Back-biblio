# Módulo de Libros

Este módulo gestiona la información de los libros en el sistema de biblioteca.

## Características

- CRUD completo de libros
- Búsqueda por título, autor, ISBN y género
- Gestión de ejemplares disponibles
- Relaciones con géneros y estanterías
- Estadísticas de libros
- Autenticación JWT con roles
- Validación de datos
- Paginación

## Endpoints

### Crear Libro
- **POST** `/libros`
- Crea un nuevo libro
- Requiere autenticación y rol admin

### Obtener Libros
- **GET** `/libros`
- Obtiene todos los libros con paginación
- Parámetros: `page`, `limit`

### Obtener Libro por ID
- **GET** `/libros/:id`
- Obtiene un libro específico por su ID

### Obtener Libros Disponibles
- **GET** `/libros/disponibles`
- Obtiene libros con ejemplares disponibles

### Buscar Libros
- **GET** `/libros/buscar`
- Búsqueda general por título, autor o ISBN
- Parámetros: `query`

### Buscar por Título
- **GET** `/libros/titulo/:titulo`
- Busca libros por título

### Buscar por Autor
- **GET** `/libros/autor/:autor`
- Busca libros por autor

### Buscar por ISBN
- **GET** `/libros/isbn/:isbn`
- Busca libro por ISBN

### Buscar por Género
- **GET** `/libros/genero/:generoId`
- Busca libros por género

### Buscar por Estantería
- **GET** `/libros/estanteria/:estanteriaId`
- Busca libros por estantería

### Estadísticas
- **GET** `/libros/stats`
- Obtiene estadísticas de libros

### Actualizar Libro
- **PUT** `/libros/:id`
- Actualiza un libro existente
- Requiere autenticación y rol admin

### Actualizar Ejemplares
- **PATCH** `/libros/:id/ejemplares`
- Actualiza solo los ejemplares disponibles
- Requiere autenticación

### Eliminar Libro
- **DELETE** `/libros/:id`
- Elimina un libro
- Requiere autenticación y rol admin

## DTOs

### CreateLibroDto
```typescript
{
  titulo: string;
  autor: string;
  ISBN: string;
  generoId: number;
  estanteriaId: number;
  ejemplaresDisponibles: number;
  fechaPublicacion: Date;
}
```

### UpdateLibroDto
```typescript
{
  titulo?: string;
  autor?: string;
  ISBN?: string;
  generoId?: number;
  estanteriaId?: number;
  ejemplaresDisponibles?: number;
  fechaPublicacion?: Date;
}
```

## Validaciones

- Título: requerido, mínimo 1 carácter
- Autor: requerido, mínimo 1 carácter
- ISBN: requerido, formato válido
- Género ID: debe existir
- Estantería ID: debe existir
- Ejemplares disponibles: número positivo
- Fecha de publicación: fecha válida

## Relaciones

- **ManyToOne** con Género
- **ManyToOne** con Estantería
- **OneToMany** con Préstamos

## Autenticación

- Los endpoints de creación, actualización y eliminación requieren autenticación JWT
- Los endpoints de escritura requieren rol de administrador
- Los endpoints de lectura son públicos
