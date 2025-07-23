import { IsOptional, IsString, IsEmail, IsIn, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
    @IsOptional()
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
    nombre?: string;

    @IsOptional()
    @IsEmail({}, { message: 'El email debe tener un formato válido' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password?: string;

    @IsOptional()
    @IsIn(['usuario', 'administrador'], {
        message: 'El rol debe ser "usuario" o "administrador"',
    })
    role?: string;

    @IsOptional()
    @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
    activo?: boolean;
}

// DTO para cambio de contraseña
export class CambiarPasswordDto {
    @IsString({ message: 'La contraseña actual es requerida' })
    passwordActual: string;

    @IsString({ message: 'La nueva contraseña es requerida' })
    @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
    nuevaPassword: string;
}

// DTO para filtros de búsqueda
export class FiltroUsuariosDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsIn(['usuario', 'administrador'])
    role?: string;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;

    @IsOptional()
    @IsIn(['nombre', 'email', 'createdAt', 'role'])
    sortBy?: string;

    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC';
}
