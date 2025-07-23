import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstanteriasController } from './estanterias.controller';
import { EstanteriasService } from './estanterias.service';
import { Estanteria } from './estanterias.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Estanteria])],
  controllers: [EstanteriasController],
  providers: [EstanteriasService],
  exports: [EstanteriasService, TypeOrmModule], // Exportar el servicio y TypeOrmModule para que otros módulos puedan usar la entidad
})
export class EstanteriasModule {}
