import { BadRequestException } from '@nestjs/common';

/**
 * Utilidades para validación de datos
 */
export class ValidationUtils {
  /**
   * Valida que un string sea un email válido
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida que un string sea un número válido
   */
  static isValidNumber(value: string): boolean {
    return !isNaN(Number(value)) && isFinite(Number(value));
  }

  /**
   * Valida que un string tenga la longitud mínima
   */
  static hasMinLength(value: string, minLength: number): boolean {
    return Boolean(value && value.length >= minLength);
  }

  /**
   * Valida que un string tenga la longitud máxima
   */
  static hasMaxLength(value: string, maxLength: number): boolean {
    return Boolean(value && value.length <= maxLength);
  }

  /**
   * Valida que un valor esté en un array de opciones válidas
   */
  static isInEnum<T>(value: T, enumObject: Record<string, T>): boolean {
    return Object.values(enumObject).includes(value);
  }

  /**
   * Valida parámetros de paginación
   */
  static validatePagination(page: number, limit: number): { page: number; limit: number } {
    const validPage = Math.max(1, Math.floor(page) || 1);
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit) || 10));
    
    return { page: validPage, limit: validLimit };
  }

  /**
   * Valida un ID numérico
   */
  static validateId(id: any): number {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      throw new BadRequestException('ID debe ser un número positivo válido');
    }
    return numericId;
  }
}

/**
 * Utilidades para transformación de datos
 */
export class TransformUtils {
  /**
   * Convierte un string a boolean
   */
  static toBoolean(value: string | boolean): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return false;
  }

  /**
   * Sanitiza un string removiendo caracteres especiales
   */
  static sanitizeString(value: string): string {
    return value.replace(/[<>\"']/g, '');
  }

  /**
   * Convierte un string a slug (URL friendly)
   */
  static toSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Trunca un string a una longitud específica
   */
  static truncate(value: string, length: number): string {
    if (value.length <= length) return value;
    return value.substring(0, length - 3) + '...';
  }
}

/**
 * Utilidades para fechas
 */
export class DateUtils {
  /**
   * Formatea una fecha a string ISO
   */
  static toISOString(date: Date | string): string {
    if (typeof date === 'string') {
      return new Date(date).toISOString();
    }
    return date.toISOString();
  }

  /**
   * Obtiene el inicio del día
   */
  static getStartOfDay(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  /**
   * Obtiene el fin del día
   */
  static getEndOfDay(date: Date): Date {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  /**
   * Calcula la diferencia en días entre dos fechas
   */
  static daysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si una fecha es válida
   */
  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }
}
