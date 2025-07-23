import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenerosController } from './generos.controller';
import { GenerosService } from './generos.service';
import { Genero } from './genero.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Genero])],
  controllers: [GenerosController],
  providers: [GenerosService],
  exports: [GenerosService],
})
export class GenerosModule {}
