import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrestamosController } from './prestamos.controller';
import { PrestamosService } from './prestamos.service';
import { Prestamo } from './prestamo.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Libro } from '../libros/libros.entity';
import { AuthModule } from '../auth/auth.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { LibrosModule } from '../libros/libros.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Prestamo, Usuario, Libro]),
        AuthModule,
        UsuariosModule,
        LibrosModule
    ],
    controllers: [PrestamosController],
    providers: [PrestamosService],
    exports: [PrestamosService]
})
export class PrestamosModule {}