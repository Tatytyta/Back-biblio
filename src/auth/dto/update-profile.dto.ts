import { IsString, IsEmail, IsOptional, IsIn, MinLength, MaxLength, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email?: string;

  @IsOptional()
  @IsIn(['usuario', 'administrador'], {
    message: 'El rol debe ser "usuario" o "administrador"',
  })
  role?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'La contraseña actual es requerida' })
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  @MaxLength(128, { message: 'La nueva contraseña no puede exceder 128 caracteres' })
  newPassword: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  @MaxLength(128, { message: 'La nueva contraseña no puede exceder 128 caracteres' })
  newPassword: string;
}

export class DeactivateAccountDto {
  @IsString()
  @MinLength(6, { message: 'La contraseña es requerida para desactivar la cuenta' })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La razón no puede exceder 500 caracteres' })
  reason?: string;
}
