import { IsNumber, IsDateString, IsOptional, IsString, IsEnum, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EstadoPrestamo } from '../prestamo.entity';

export class CreatePrestamoDto {
    @IsNumber({}, { message: 'El ID del usuario debe ser un número válido' })
    @Min(1, { message: 'El ID del usuario debe ser mayor a 0' })
    usuarioId: number;

    @IsNumber({}, { message: 'El ID del libro debe ser un número válido' })
    @Min(1, { message: 'El ID del libro debe ser mayor a 0' })
    libroId: number;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha de devolución estimada debe ser una fecha válida (YYYY-MM-DD)' })
    @Transform(({ value }) => value ? new Date(value) : value)
    fechaDevolucionEstimada?: Date;

    @IsOptional()
    @IsEnum(EstadoPrestamo, { message: 'El estado debe ser uno de los valores válidos: activo, devuelto, vencido, renovado' })
    estado?: EstadoPrestamo;

    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
    @Max(500, { message: 'Las observaciones no pueden exceder los 500 caracteres' })
    observaciones?: string;
}