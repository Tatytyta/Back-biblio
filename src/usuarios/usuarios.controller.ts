import {
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Patch,
  Body, 
  Param,
  Query, 
  UseGuards,
  Request,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UsePipes
} from '@nestjs/common';
import { UsuariosService, EstadisticasUsuarios, RespuestaPaginada } from './usuarios.service';
import { CreateUsuarioDto, RegistroUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto, CambiarPasswordDto, FiltroUsuariosDto } from './dto/update-usuario.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { Usuario } from './usuario.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../auth/types/auth.types';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('administrador')
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CreateUsuarioDto): Promise<SuccessResponseDto<Usuario>> {
    const usuario = await this.usuariosService.crear(dto);
    return new SuccessResponseDto('Usuario creado exitosamente', usuario);
  }

  @Post('registro-publico')
  @HttpCode(HttpStatus.CREATED)
  async registroPublico(@Body() dto: RegistroUsuarioDto): Promise<SuccessResponseDto<Usuario>> {
    const createDto: CreateUsuarioDto = { ...dto, role: 'usuario' };
    const usuario = await this.usuariosService.crear(createDto);
    return new SuccessResponseDto('Usuario registrado exitosamente', usuario);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async obtenerTodos(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('activo') activo?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ): Promise<SuccessResponseDto<RespuestaPaginada<Usuario>>> {
    const filtros: FiltroUsuariosDto = {
      search,
      role,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      sortBy,
      sortOrder
    };

    const resultado = await this.usuariosService.obtenerTodos({
      page,
      limit,
      filtros
    });

    return new SuccessResponseDto('Usuarios obtenidos correctamente', resultado);
  }

  @Get('estadisticas')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async obtenerEstadisticas(): Promise<SuccessResponseDto<EstadisticasUsuarios>> {
    const estadisticas = await this.usuariosService.obtenerEstadisticas();
    return new SuccessResponseDto('Estadísticas obtenidas correctamente', estadisticas);
  }

  @Get('buscar')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async buscarUsuarios(
    @Query('termino') termino: string,
    @Query('limite', new ParseIntPipe({ optional: true })) limite = 10
  ): Promise<SuccessResponseDto<Usuario[]>> {
    const usuarios = await this.usuariosService.buscarUsuarios(termino, limite);
    return new SuccessResponseDto('Búsqueda completada', usuarios);
  }

  @Get('mi-perfil')
  async obtenerMiPerfil(@GetUser() user: AuthUser): Promise<SuccessResponseDto<Usuario>> {
    const usuario = await this.usuariosService.obtenerPorId(user.id);
    return new SuccessResponseDto('Perfil obtenido correctamente', usuario);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseDto<Usuario>> {
    const usuario = await this.usuariosService.obtenerPorId(id);
    return new SuccessResponseDto('Usuario obtenido correctamente', usuario);
  }

  @Put('mi-perfil')
  async actualizarMiPerfil(
    @GetUser() user: AuthUser,
    @Body() dto: UpdateUsuarioDto
  ): Promise<SuccessResponseDto<Usuario>> {
    // Los usuarios normales no pueden cambiar su rol o estado activo
    const { role, activo, ...datosPermitidos } = dto;
    
    const usuario = await this.usuariosService.actualizar(user.id, datosPermitidos);
    return new SuccessResponseDto('Perfil actualizado correctamente', usuario);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async actualizar(
    @Param('id', ParseIntPipe) id: number, 
    @Body() dto: UpdateUsuarioDto
  ): Promise<SuccessResponseDto<Usuario>> {
    const usuario = await this.usuariosService.actualizar(id, dto);
    return new SuccessResponseDto('Usuario actualizado correctamente', usuario);
  }

  @Patch('cambiar-password')
  async cambiarPassword(
    @GetUser() user: AuthUser,
    @Body() dto: CambiarPasswordDto
  ): Promise<SuccessResponseDto<{ message: string }>> {
    const resultado = await this.usuariosService.cambiarPassword(user.id, dto);
    return new SuccessResponseDto('Contraseña actualizada correctamente', resultado);
  }

  @Patch(':id/activar')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  async activarUsuario(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseDto<Usuario>> {
    const usuario = await this.usuariosService.activarDesactivar(id, true);
    return new SuccessResponseDto('Usuario activado correctamente', usuario);
  }

  @Patch(':id/desactivar')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  async desactivarUsuario(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseDto<Usuario>> {
    const usuario = await this.usuariosService.activarDesactivar(id, false);
    return new SuccessResponseDto('Usuario desactivado correctamente', usuario);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async eliminar(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseDto<{ message: string }>> {
    const resultado = await this.usuariosService.eliminar(id);
    return new SuccessResponseDto('Usuario eliminado correctamente', resultado);
  }

  // Endpoints de compatibilidad con versiones anteriores
  @Post('create')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUsuarioDto): Promise<SuccessResponseDto<Usuario>> {
    return this.crear(dto);
  }

  @Get('find-all')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('activo') activo?: string,
  ): Promise<SuccessResponseDto<any>> {
    const filtros: FiltroUsuariosDto = {
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined
    };

    const resultado = await this.usuariosService.obtenerTodos({
      page,
      limit,
      filtros
    });

    return new SuccessResponseDto('Usuarios obtenidos correctamente', {
      ...resultado,
      // Formato compatible con paginación anterior
      data: resultado.items
    });
  }

  @Get('find-one/:id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseDto<Usuario>> {
    return this.obtenerPorId(id);
  }

  @Put('update/:id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() dto: UpdateUsuarioDto
  ): Promise<SuccessResponseDto<Usuario>> {
    return this.actualizar(id, dto);
  }

  @Delete('remove/:id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseDto<{ message: string }>> {
    return this.eliminar(id);
  }
}
