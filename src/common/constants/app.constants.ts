/**
 * Constantes de configuración general
 */
export const APP_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 50,
  MAX_USERNAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TITLE_LENGTH: 255,
} as const;

/**
 * Constantes de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

/**
 * Constantes de validación
 */
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[\d\s-()]+$/,
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  SEARCH_MIN_LENGTH: 2,
} as const;

/**
 * Constantes de tiempo
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Mensajes de respuesta estándar
 */
export const RESPONSE_MESSAGES = {
  // Éxito
  SUCCESS: 'Operación exitosa',
  CREATED: 'Recurso creado exitosamente',
  UPDATED: 'Recurso actualizado exitosamente',
  DELETED: 'Recurso eliminado exitosamente',
  RETRIEVED: 'Recurso obtenido exitosamente',
  
  // Errores generales
  INTERNAL_ERROR: 'Error interno del servidor',
  BAD_REQUEST: 'Solicitud inválida',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso prohibido',
  NOT_FOUND: 'Recurso no encontrado',
  CONFLICT: 'Conflicto con el estado actual del recurso',
  
  // Validación
  VALIDATION_ERROR: 'Error de validación',
  INVALID_DATA: 'Datos inválidos',
  MISSING_REQUIRED_FIELDS: 'Campos requeridos faltantes',
  INVALID_FORMAT: 'Formato inválido',
  
  // Autenticación
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Cierre de sesión exitoso',
  REGISTER_SUCCESS: 'Registro exitoso',
  TOKEN_EXPIRED: 'Token expirado',
  TOKEN_INVALID: 'Token inválido',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  
  // Usuarios
  USER_CREATED: 'Usuario creado exitosamente',
  USER_UPDATED: 'Usuario actualizado exitosamente',
  USER_DELETED: 'Usuario eliminado exitosamente',
  USER_NOT_FOUND: 'Usuario no encontrado',
  USER_ALREADY_EXISTS: 'El usuario ya existe',
  
  // Libros
  BOOK_CREATED: 'Libro creado exitosamente',
  BOOK_UPDATED: 'Libro actualizado exitosamente',
  BOOK_DELETED: 'Libro eliminado exitosamente',
  BOOK_NOT_FOUND: 'Libro no encontrado',
  BOOK_ALREADY_EXISTS: 'El libro ya existe',
  
  // Préstamos
  LOAN_CREATED: 'Préstamo creado exitosamente',
  LOAN_UPDATED: 'Préstamo actualizado exitosamente',
  LOAN_RETURNED: 'Libro devuelto exitosamente',
  LOAN_NOT_FOUND: 'Préstamo no encontrado',
  LOAN_ALREADY_EXISTS: 'Ya existe un préstamo activo para este libro',
  
  // Actividad
  ACTIVITY_REGISTERED: 'Actividad registrada exitosamente',
  ACTIVITY_RETRIEVED: 'Actividad obtenida exitosamente',
  ACTIVITY_DELETED: 'Actividad eliminada exitosamente',
  STATISTICS_RETRIEVED: 'Estadísticas obtenidas exitosamente',
} as const;

/**
 * Códigos de estado HTTP
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Roles de usuario
 */
export const USER_ROLES = {
  ADMIN: 'administrador',
  USER: 'usuario',
} as const;

/**
 * Estados de entidades
 */
export const ENTITY_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
} as const;
