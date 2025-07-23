import { IsNumber, IsString, IsOptional, Min, Max, MaxLength, IsPositive } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CrearResenaMultipleDto {
  @IsNumber({}, { message: 'El ID del libro debe ser un número válido' })
  @IsPositive({ message: 'El ID del libro debe ser un número positivo' })
  @Type(() => Number)
  idLibro: number;

  @IsNumber({}, { message: 'El ID del usuario debe ser un número válido' })
  @IsPositive({ message: 'El ID del usuario debe ser un número positivo' })
  @Type(() => Number)
  idUsuario: number;

  @IsNumber({}, { message: 'La calificación debe ser un número válido' })
  @Min(1, { message: 'La calificación mínima es 1' })
  @Max(5, { message: 'La calificación máxima es 5' })
  @Type(() => Number)
  calificacion: number;

  @IsOptional()
  @IsString({ message: 'El comentario debe ser una cadena de texto' })
  @MaxLength(1000, { message: 'El comentario no puede exceder 1000 caracteres' })
  @Transform(({ value }) => value?.trim())
  comentario?: string;

  @IsOptional()
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  titulo?: string;
  
  // Campo adicional para diferenciar reseñas múltiples
  @IsOptional()
  @IsString({ message: 'El identificador debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El identificador no puede exceder 50 caracteres' })
  @Transform(({ value }) => value || new Date().toISOString())
  identificadorUnico?: string;
}
