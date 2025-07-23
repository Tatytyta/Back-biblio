import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { ResenasLibrosService, PaginationResult, EstadisticasResenas } from './resenas-libros.service';
import { CrearResenaDto } from './dto/crear-resena.dto';
import { CrearResenaMultipleDto } from './dto/crear-resena-multiple.dto';
import { ActualizarResenaDto, DarMeGustaDto, ReportarResenaDto, FiltroResenasDto } from './dto/actualizar-resena.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Resena } from './schemas/resena.schema';

@Controller('resenas-libros')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ResenasLibrosController {
  constructor(private readonly resenasService: ResenasLibrosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CrearResenaDto, @Request() req): Promise<SuccessResponseDto<Resena>> {
    // Si no se especifica el usuario, usar el del token
    if (!dto.idUsuario && req.user?.id) {
      dto.idUsuario = req.user.id;
    }

    const resena = await this.resenasService.crear(dto);
    return new SuccessResponseDto('Reseña creada exitosamente', resena);
  }
  
  @Post('multiple')
  @HttpCode(HttpStatus.CREATED)
  async crearMultiple(@Body() dto: CrearResenaMultipleDto, @Request() req): Promise<SuccessResponseDto<Resena>> {
    // Si no se especifica el usuario, usar el del token
    if (!dto.idUsuario && req.user?.id) {
      dto.idUsuario = req.user.id;
    }
    
    // Generar un identificador único si no viene en el DTO
    if (!dto.identificadorUnico) {
      dto.identificadorUnico = new Date().toISOString();
    }
    
    const resena = await this.resenasService.crearMultiple(dto);
    return new SuccessResponseDto('Reseña múltiple creada exitosamente', resena);
  }

  @Get()
  async obtenerTodas(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('estado') estado?: string,
    @Query('idLibro') idLibro?: string,
    @Query('idUsuario') idUsuario?: string,
    @Query('calificacionMinima') calificacionMinima?: string,
    @Query('calificacionMaxima') calificacionMaxima?: string,
  ): Promise<SuccessResponseDto<PaginationResult<Resena>>> {
    const filtros: FiltroResenasDto = {
      estado,
      idLibro,
      idUsuario,
      calificacionMinima,
      calificacionMaxima
    };

    const result = await this.resenasService.obtenerTodas({
      page,
      limit,
      filtros
    });

    return new SuccessResponseDto('Reseñas obtenidas correctamente', result);
  }

  @Get('estadisticas')
  async obtenerEstadisticas(
    @Query('idLibro') idLibro?: string
  ): Promise<SuccessResponseDto<EstadisticasResenas>> {
    const estadisticas = await this.resenasService.obtenerEstadisticas(idLibro);
    return new SuccessResponseDto('Estadísticas obtenidas correctamente', estadisticas);
  }

  @Get('libro/:idLibro')
  async obtenerPorLibro(
    @Param('idLibro') idLibro: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('estado') estado = 'aprobada'
  ): Promise<SuccessResponseDto<PaginationResult<Resena>>> {
    const result = await this.resenasService.obtenerPorLibro(idLibro, {
      page,
      limit,
      estado
    });

    return new SuccessResponseDto('Reseñas del libro obtenidas correctamente', result);
  }

  @Get('usuario/:idUsuario')
  async obtenerPorUsuario(
    @Param('idUsuario') idUsuario: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10
  ): Promise<SuccessResponseDto<PaginationResult<Resena>>> {
    const result = await this.resenasService.obtenerPorUsuario(idUsuario, {
      page,
      limit
    });

    return new SuccessResponseDto('Reseñas del usuario obtenidas correctamente', result);
  }

  @Get('mis-resenas')
  async obtenerMisResenas(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10
  ): Promise<SuccessResponseDto<PaginationResult<Resena>>> {
    const result = await this.resenasService.obtenerPorUsuario(req.user.id, {
      page,
      limit
    });

    return new SuccessResponseDto('Mis reseñas obtenidas correctamente', result);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string): Promise<SuccessResponseDto<Resena>> {
    const resena = await this.resenasService.obtenerPorId(id);
    return new SuccessResponseDto('Reseña obtenida correctamente', resena);
  }

  @Put(':id')
  async actualizar(
    @Param('id') id: string, 
    @Body() dto: ActualizarResenaDto,
    @Request() req
  ): Promise<SuccessResponseDto<Resena>> {
    // Verificar que el usuario sea el propietario o admin
    const resenaExistente = await this.resenasService.obtenerPorId(id);
    
    if (resenaExistente.idUsuario !== req.user.id && req.user.role !== 'admin') {
      throw new Error('No tienes permisos para actualizar esta reseña');
    }

    const resena = await this.resenasService.actualizar(id, dto);
    return new SuccessResponseDto('Reseña actualizada correctamente', resena);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Request() req): Promise<SuccessResponseDto<{ message: string }>> {
    // Verificar que el usuario sea el propietario o admin
    const resenaExistente = await this.resenasService.obtenerPorId(id);
    
    if (resenaExistente.idUsuario !== req.user.id && req.user.role !== 'admin') {
      throw new Error('No tienes permisos para eliminar esta reseña');
    }

    const result = await this.resenasService.eliminar(id);
    return new SuccessResponseDto('Reseña eliminada correctamente', result);
  }

  @Patch(':id/me-gusta')
  @HttpCode(HttpStatus.OK)
  async darMeGusta(
    @Param('id') id: string,
    @Request() req
  ): Promise<SuccessResponseDto<Resena>> {
    const dto: DarMeGustaDto = { usuarioId: req.user.id };
    const resena = await this.resenasService.darMeGusta(id, dto);
    return new SuccessResponseDto('Me gusta actualizado correctamente', resena);
  }

  @Patch(':id/reportar')
  @HttpCode(HttpStatus.OK)
  async reportar(
    @Param('id') id: string,
    @Body() dto: ReportarResenaDto,
    @Request() req
  ): Promise<SuccessResponseDto<{ message: string }>> {
    dto.usuarioId = req.user.id;
    const result = await this.resenasService.reportar(id, dto);
    return new SuccessResponseDto('Reseña reportada correctamente', result);
  }

  @Patch(':id/aprobar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('admin', 'administrador')
  async aprobar(@Param('id') id: string, @Request() req): Promise<SuccessResponseDto<Resena>> {
    const resena = await this.resenasService.aprobar(id);
    return new SuccessResponseDto('Reseña aprobada correctamente', resena);
  }

  @Patch(':id/rechazar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('admin', 'administrador')
  async rechazar(@Param('id') id: string): Promise<SuccessResponseDto<Resena>> {
    const resena = await this.resenasService.rechazar(id);
    return new SuccessResponseDto('Reseña rechazada correctamente', resena);
  }

  // Endpoints de compatibilidad con nombres anteriores
  @Post('create')
  async create(@Body() dto: CrearResenaDto, @Request() req): Promise<SuccessResponseDto<Resena>> {
    return this.crear(dto, req);
  }

  @Get('find-all')
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ): Promise<SuccessResponseDto<PaginationResult<Resena>>> {
    const result = await this.resenasService.findAll({ page, limit });
    return new SuccessResponseDto('Reseñas obtenidas correctamente', result);
  }

  @Get('find-one/:id')
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<Resena>> {
    return this.obtenerPorId(id);
  }

  @Put('update/:id')
  async update(
    @Param('id') id: string, 
    @Body() dto: ActualizarResenaDto,
    @Request() req
  ): Promise<SuccessResponseDto<Resena>> {
    return this.actualizar(id, dto, req);
  }

  @Delete('remove/:id')
  async remove(@Param('id') id: string, @Request() req): Promise<SuccessResponseDto<{ message: string }>> {
    return this.eliminar(id, req);
  }
}
