import { IsString, IsOptional } from 'class-validator';

export class CreateGeneroDto {
    @IsString()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;
}