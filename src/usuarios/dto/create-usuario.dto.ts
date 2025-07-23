import { IsString, IsEmail, MinLength, IsOptional, IsIn, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUsuarioDto {
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
    @Transform(({ value }) => value?.trim())
    nombre: string;

    @IsEmail({}, { message: 'El email debe tener un formato válido' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, {
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    })
    password: string;

    @IsOptional()
    @IsIn(['usuario', 'administrador'], {
        message: 'El rol debe ser "usuario" o "administrador"',
    })
    role?: string;
}

// DTO para registro público (sin role)
export class RegistroUsuarioDto {
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
    @Transform(({ value }) => value?.trim())
    nombre: string;

    @IsEmail({}, { message: 'El email debe tener un formato válido' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, {
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    })
    password: string;
}