import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsArray, IsBoolean, IsEnum, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { CrearResenaDto } from './crear-resena.dto';

export class ActualizarResenaDto extends PartialType(CrearResenaDto) {
  @IsOptional()
  @IsString({ message: 'El comentario debe ser una cadena de texto' })
  @MaxLength(1000, { message: 'El comentario no puede exceder 1000 caracteres' })
  @Transform(({ value }) => value?.trim())
  comentario?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  estaActivo?: boolean;

  @IsOptional()
  @IsEnum(['pendiente', 'aprobada', 'rechazada'], { 
    message: 'El estado debe ser: pendiente, aprobada o rechazada' 
  })
  estado?: string;
}

export class DarMeGustaDto {
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  usuarioId: string;
}

export class ReportarResenaDto {
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  usuarioId: string;

  @IsOptional()
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @MaxLength(500, { message: 'El motivo no puede exceder 500 caracteres' })
  motivo?: string;
}

export class FiltroResenasDto {
  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsEnum(['pendiente', 'aprobada', 'rechazada'], { 
    message: 'El estado debe ser: pendiente, aprobada o rechazada' 
  })
  estado?: string;

  @IsOptional()
  @IsString({ message: 'El ID del libro debe ser una cadena de texto' })
  idLibro?: string;

  @IsOptional()
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  idUsuario?: string;

  @IsOptional()
  @IsString({ message: 'La calificación mínima debe ser una cadena de texto' })
  calificacionMinima?: string;

  @IsOptional()
  @IsString({ message: 'La calificación máxima debe ser una cadena de texto' })
  calificacionMaxima?: string;
}
