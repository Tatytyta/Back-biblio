import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ActividadUsuariosService } from './actividad-usuarios.service';
import { RegistrarActividadDto } from './dto/registrar-actividad.dto';
import { ActualizarActividadDto } from './dto/actualizar-actividad.dto';
import { ObtenerActividadesDto, EstadisticasActividadDto } from './dto/obtener-actividades.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../auth/types/auth.types';

@Controller('actividad-usuarios')
@UseGuards(JwtAuthGuard)
export class ActividadUsuariosController {
  constructor(private readonly servicio: ActividadUsuariosService) {}

  @Post(':idUsuario')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async registrar(
    @Param('idUsuario', ParseIntPipe) idUsuario: number, 
    @Body(ValidationPipe) dto: RegistrarActividadDto
  ) {
    try {
      const actividad = await this.servicio.registrar(idUsuario, dto);
      if (!actividad) {
        throw new InternalServerErrorException('No se pudo registrar la actividad');
      }
      return new SuccessResponseDto('Actividad registrada exitosamente', actividad);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new BadRequestException('Error al registrar la actividad');
    }
  }

  @Post('mi-actividad')
  async registrarMiActividad(
    @GetUser() user: AuthUser,
    @Body(ValidationPipe) dto: RegistrarActividadDto
  ) {
    try {
      const actividad = await this.servicio.registrar(user.id, dto);
      if (!actividad) {
        throw new InternalServerErrorException('No se pudo registrar la actividad');
      }
      return new SuccessResponseDto('Actividad registrada exitosamente', actividad);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new BadRequestException('Error al registrar la actividad');
    }
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async obtenerTodas(
    @Query(ValidationPipe) query: ObtenerActividadesDto
  ): Promise<SuccessResponseDto<any>> {
    try {
      const result = await this.servicio.obtenerTodas(query);
      if (!result) {
        throw new InternalServerErrorException('No se pudieron obtener las actividades');
      }
      return new SuccessResponseDto('Actividades obtenidas correctamente', result);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener las actividades');
    }
  }

  @Get('mi-actividad')
  async obtenerMiActividad(
    @GetUser() user: AuthUser,
    @Query(ValidationPipe) query: ObtenerActividadesDto
  ) {
    try {
      const actividad = await this.servicio.obtenerPorUsuario(user.id, query);
      if (!actividad) {
        throw new NotFoundException('No se encontraron actividades para este usuario');
      }
      return new SuccessResponseDto('Actividad del usuario obtenida', actividad);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener la actividad del usuario');
    }
  }

  @Get('estadisticas')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async obtenerEstadisticasGlobales(
    @Query(ValidationPipe) query: EstadisticasActividadDto
  ) {
    try {
      const estadisticas = await this.servicio.obtenerEstadisticas(undefined, query);
      if (!estadisticas) {
        throw new InternalServerErrorException('No se pudieron obtener las estadísticas');
      }
      return new SuccessResponseDto('Estadísticas obtenidas correctamente', estadisticas);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener las estadísticas');
    }
  }

  @Get('mis-estadisticas')
  async obtenerMisEstadisticas(
    @GetUser() user: AuthUser,
    @Query(ValidationPipe) query: EstadisticasActividadDto
  ) {
    try {
      const estadisticas = await this.servicio.obtenerEstadisticas(user.id, query);
      if (!estadisticas) {
        throw new InternalServerErrorException('No se pudieron obtener las estadísticas');
      }
      return new SuccessResponseDto('Estadísticas del usuario obtenidas', estadisticas);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener las estadísticas del usuario');
    }
  }

  @Get('usuario/:idUsuario')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async obtenerPorUsuario(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Query(ValidationPipe) query: ObtenerActividadesDto
  ) {
    try {
      const actividad = await this.servicio.obtenerPorUsuario(idUsuario, query);
      if (!actividad) {
        throw new NotFoundException('No se encontraron actividades para este usuario');
      }
      return new SuccessResponseDto('Actividad del usuario obtenida', actividad);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener la actividad del usuario');
    }
  }

  @Get('usuario/:idUsuario/estadisticas')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async obtenerEstadisticasUsuario(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Query(ValidationPipe) query: EstadisticasActividadDto
  ) {
    try {
      const estadisticas = await this.servicio.obtenerEstadisticas(idUsuario, query);
      if (!estadisticas) {
        throw new InternalServerErrorException('No se pudieron obtener las estadísticas');
      }
      return new SuccessResponseDto('Estadísticas del usuario obtenidas', estadisticas);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener las estadísticas del usuario');
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async eliminar(@Param('id') id: string) {
    try {
      const actividad = await this.servicio.eliminar(id);
      if (!actividad) {
        throw new NotFoundException('Actividad no encontrada');
      }
      return new SuccessResponseDto('Actividad eliminada correctamente', actividad);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar la actividad');
    }
  }

  @Delete('usuario/:idUsuario/evento/:eventoId')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async eliminarEventoUsuario(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Param('eventoId') eventoId: string
  ) {
    try {
      const actividad = await this.servicio.eliminarEventoUsuario(idUsuario, eventoId);
      if (!actividad) {
        throw new NotFoundException('Evento no encontrado');
      }
      return new SuccessResponseDto('Evento eliminado correctamente', actividad);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar el evento');
    }
  }
  
  @Put('usuario/:idUsuario/evento/:eventoId')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async actualizarEventoUsuario(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Param('eventoId') eventoId: string,
    @Body(ValidationPipe) dto: ActualizarActividadDto
  ) {
    try {
      const actividad = await this.servicio.actualizarEvento(idUsuario, eventoId, dto);
      if (!actividad) {
        throw new NotFoundException('Evento no encontrado o no se pudo actualizar');
      }
      return new SuccessResponseDto('Evento actualizado correctamente', actividad);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al actualizar el evento: ${error.message}`);
    }
  }

  @Post('limpiar-antiguas')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async limpiarActividadesAntiguas(
    @Body() body: { diasAntiguedad?: number }
  ) {
    try {
      const { diasAntiguedad = 365 } = body;
      const documentosModificados = await this.servicio.limpiarActividadesAntiguas(diasAntiguedad);
      return new SuccessResponseDto(
        'Limpieza completada',
        { documentosModificados, diasAntiguedad }
      );
    } catch (error) {
      throw new BadRequestException('Error al limpiar actividades antiguas');
    }
  }
}
