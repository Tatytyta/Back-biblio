import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsDateString, IsEnum, IsString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreatePrestamoDto } from './create-prestamos.dto';
import { EstadoPrestamo } from '../prestamo.entity';

export class UpdatePrestamoDto extends PartialType(CreatePrestamoDto) {
    @IsOptional()
    @IsDateString({}, { message: 'La fecha de devolución real debe ser una fecha válida (YYYY-MM-DD)' })
    @Transform(({ value }) => value ? new Date(value) : value)
    fechaDevolucionReal?: Date;

    @IsOptional()
    @IsEnum(EstadoPrestamo, { message: 'El estado debe ser uno de los valores válidos: activo, devuelto, vencido, renovado' })
    estado?: EstadoPrestamo;

    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
    @Max(500, { message: 'Las observaciones no pueden exceder los 500 caracteres' })
    observaciones?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Los días de retraso deben ser un número válido' })
    @Min(0, { message: 'Los días de retraso no pueden ser negativos' })
    diasRetraso?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'La multa acumulada debe ser un número válido con máximo 2 decimales' })
    @Min(0, { message: 'La multa acumulada no puede ser negativa' })
    multaAcumulada?: number;
}

export class DevolucionPrestamoDto {
    @IsDateString({}, { message: 'La fecha de devolución real debe ser una fecha válida (YYYY-MM-DD)' })
    @Transform(({ value }) => value ? new Date(value) : value)
    fechaDevolucionReal: Date;

    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
    @Max(500, { message: 'Las observaciones no pueden exceder los 500 caracteres' })
    observaciones?: string;
}

export class RenovarPrestamoDto {
    @IsDateString({}, { message: 'La nueva fecha de devolución estimada debe ser una fecha válida (YYYY-MM-DD)' })
    @Transform(({ value }) => value ? new Date(value) : value)
    fechaDevolucionEstimada: Date;

    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
    @Max(500, { message: 'Las observaciones no pueden exceder los 500 caracteres' })
    observaciones?: string;
}
