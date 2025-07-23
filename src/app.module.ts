import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrestamosModule } from './prestamos/prestamos.module';
import { EstanteriasModule } from './estanterias/estanterias.module';
import { GenerosModule } from './generos/generos.module';
import { LibrosModule } from './libros/libros.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FaviconController } from './favicon.controller';
import { TestAuthController } from './test-auth.controller';
import { TestRoleController } from './test-role.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ResenasLibrosModule } from './resenas-libros/resenas-libros.module';
import { ActividadUsuariosModule } from './actividad-usuarios/actividad-usuarios.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Módulo Common debe ir primero para configuración global
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST')!,
        port: parseInt(configService.get('DB_PORT')!),
        username: configService.get('DB_USER')!,
        password: configService.get('DB_PASS')!,
        database: configService.get('DB_NAME')!,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
        logging: true,
      }),
    }),
    PrestamosModule,
    EstanteriasModule,
    GenerosModule,
    LibrosModule,
    UsuariosModule,
    AuthModule,
    ResenasLibrosModule,
    ActividadUsuariosModule,
  ],
  controllers: [AppController, FaviconController, TestAuthController, TestRoleController],
  providers: [AppService],
})
export class AppModule {}