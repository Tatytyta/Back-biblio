import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActividadUsuario, ActividadUsuarioSchema } from './schemas/actividad.schema';
import { ActividadUsuariosService } from './actividad-usuarios.service';
import { ActividadUsuariosController } from './actividad-usuarios.controller';
import { RegistrarActividadInterceptor } from './interceptors/registrar-actividad.interceptor';
import { ActividadHelper } from './helpers/actividad.helper';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActividadUsuario.name, schema: ActividadUsuarioSchema },
    ]),
  ],
  controllers: [ActividadUsuariosController],
  providers: [
    ActividadUsuariosService,
    RegistrarActividadInterceptor,
    ActividadHelper,
  ],
  exports: [
    ActividadUsuariosService,
    RegistrarActividadInterceptor,
    ActividadHelper,
  ],
})
export class ActividadUsuariosModule {}
