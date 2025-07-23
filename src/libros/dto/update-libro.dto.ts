import { IsString, IsNumber, IsOptional, IsISBN, IsDateString, IsPositive, Length } from 'class-validator';

export class UpdateLibroDto {
    @IsOptional()
    @IsString()
    @Length(1, 255)
    titulo?: string;

    @IsOptional()
    @IsString()
    @Length(1, 255)
    autor?: string;

    @IsOptional()
    @IsString()
    @IsISBN()
    ISBN?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    generoId?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    estanteriaId?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    ejemplaresDisponibles?: number;

    @IsOptional()
    @IsDateString()
    fechaPublicacion?: Date;
}