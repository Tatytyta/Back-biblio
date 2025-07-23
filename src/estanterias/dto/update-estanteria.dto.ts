import { IsString, IsNumber, IsOptional, IsPositive, Length, Matches } from 'class-validator';

export class UpdateEstanteriaDto {
    @IsOptional()
    @IsString()
    @Length(2, 20, { message: 'El código debe tener entre 2 y 20 caracteres' })
    @Matches(/^[A-Z0-9-]+$/, { message: 'El código solo puede contener letras mayúsculas, números y guiones' })
    codigo?: string;

    @IsOptional()
    @IsString()
    @Length(3, 100, { message: 'La ubicación debe tener entre 3 y 100 caracteres' })
    ubicacion?: string;

    @IsOptional()
    @IsNumber({}, { message: 'La capacidad debe ser un número' })
    @IsPositive({ message: 'La capacidad debe ser un número positivo' })
    capacidad?: number;

    @IsOptional()
    @IsString()
    @Length(0, 500, { message: 'La descripción no puede exceder los 500 caracteres' })
    descripcion?: string;
}