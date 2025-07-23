import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibrosController } from './libros.controller';
import { LibrosService } from './libros.service';
import { Libro } from './libros.entity';
import { Genero } from '../generos/genero.entity';
import { Estanteria } from '../estanterias/estanterias.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Libro, Genero, Estanteria])],
  controllers: [LibrosController],
  providers: [LibrosService],
  exports: [LibrosService],
})
export class LibrosModule {}
