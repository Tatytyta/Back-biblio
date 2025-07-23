import { IsNumber, IsString, IsOptional, Min, Max, IsArray, IsBoolean, IsEnum, MaxLength, IsPositive } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CrearResenaDto {
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
  @IsArray({ message: 'Los "me gusta" deben ser un array' })
  @IsString({ each: true, message: 'Cada elemento de "me gusta" debe ser una cadena de texto' })
  meGusta?: string[];

  @IsOptional()
  @IsArray({ message: 'Los "no me gusta" deben ser un array' })
  @IsString({ each: true, message: 'Cada elemento de "no me gusta" debe ser una cadena de texto' })
  noMeGusta?: string[];

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  estaActivo?: boolean;

  @IsOptional()
  @IsEnum(['pendiente', 'aprobada', 'rechazada'], { 
    message: 'El estado debe ser: pendiente, aprobada o rechazada' 
  })
  estado?: string;
}
