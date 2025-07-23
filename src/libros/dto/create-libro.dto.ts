import { IsString, IsNumber, IsOptional, IsISBN, IsDateString, IsPositive, Length } from 'class-validator';

export class CreateLibroDto {
    @IsString()
    @Length(1, 255)
    titulo: string;

    @IsString()
    @Length(1, 255)
    autor: string;

    @IsString()
    @IsISBN()
    ISBN: string;

    @IsNumber()
    @IsPositive()
    generoId: number;

    @IsNumber()
    @IsPositive()
    estanteriaId: number;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    ejemplaresDisponibles?: number = 1;

    @IsDateString()
    @IsOptional()
    fechaPublicacion?: Date;
}