import { IsOptional, IsString, IsBoolean, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersDto {
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
  @IsString()
  search?: string;

  
  @IsEnum(['usuario', 'administrador'])
  role?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  activo?: boolean;

  @IsOptional()
  @IsEnum(['nombre', 'email', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
