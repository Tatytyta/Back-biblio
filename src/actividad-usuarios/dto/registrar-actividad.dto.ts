import { IsString, IsOptional, IsNumber, IsEnum, IsObject, IsIP, MaxLength, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoActividad } from '../schemas/actividad.schema';

export class RegistrarActividadDto {
  @IsEnum(TipoActividad, {
    message: 'El tipo de actividad debe ser uno de los valores permitidos'
  })
  tipo: TipoActividad;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La consulta no puede exceder 255 caracteres' })
  consulta?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'El ID del libro debe ser un número positivo' })
  @Type(() => Number)
  idLibro?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'El ID del préstamo debe ser un número positivo' })
  @Type(() => Number)
  idPrestamo?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'El ID de la reseña debe ser un número positivo' })
  @Type(() => Number)
  idResena?: number;

  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'El userAgent no puede exceder 500 caracteres' })
  userAgent?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
