import { IsString, IsOptional, IsObject, IsEnum, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoActividad } from '../schemas/actividad.schema';

export class ActualizarActividadDto {
  @IsOptional()
  @IsEnum(TipoActividad, {
    message: 'El tipo de actividad debe ser uno de los valores permitidos'
  })
  tipo?: TipoActividad;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La consulta no puede exceder 255 caracteres' })
  consulta?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
