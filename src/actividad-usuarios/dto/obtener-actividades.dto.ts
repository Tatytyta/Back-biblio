import { IsOptional, IsNumber, IsString, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoActividad } from '../schemas/actividad.schema';

export class ObtenerActividadesDto {
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'La página debe ser mayor a 0' })
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede exceder 100' })
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(TipoActividad)
  tipo?: TipoActividad;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  busqueda?: string;
}

export class EstadisticasActividadDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  dias?: number = 30;

  @IsOptional()
  @IsEnum(TipoActividad)
  tipo?: TipoActividad;
}
