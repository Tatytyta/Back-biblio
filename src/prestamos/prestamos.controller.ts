import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Param, 
    Put, 
    Delete, 
    UseGuards, 
    Query, 
    ParseIntPipe,
    Patch,
    DefaultValuePipe
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrestamosService } from './prestamos.service';
import { CreatePrestamoDto } from './dto/create-prestamos.dto';
import { UpdatePrestamoDto, DevolucionPrestamoDto, RenovarPrestamoDto } from './dto/update-prestamos.dto';
import { Prestamo, EstadoPrestamo } from './prestamo.entity';

@Controller('prestamos')
export class PrestamosController {
    constructor(private readonly prestamosService: PrestamosService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'administrador', 'bibliotecario')
    async create(@Body() createPrestamoDto: CreatePrestamoDto) {
        const data = await this.prestamosService.create(createPrestamoDto);
        return {
            message: 'Préstamo creado exitosamente',
            data
        };
    }

    @Get()
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
    ) {
        const data = await this.prestamosService.findAll({ page, limit });
        return {
            message: 'Préstamos obtenidos exitosamente',
            data
        };
    }

    @Get('usuario/:usuarioId')
    async findByUsuario(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
    ) {
        const data = await this.prestamosService.findByUsuario(usuarioId, { page, limit });
        return {
            message: 'Préstamos del usuario obtenidos exitosamente',
            data
        };
    }

    @Get('libro/:libroId')
    async findByLibro(
        @Param('libroId', ParseIntPipe) libroId: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
    ) {
        const data = await this.prestamosService.findByLibro(libroId, { page, limit });
        return {
            message: 'Préstamos del libro obtenidos exitosamente',
            data
        };
    }

    @Get('estado/:estado')
    async findByEstado(
        @Param('estado') estado: EstadoPrestamo,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
    ) {
        const data = await this.prestamosService.findByEstado(estado, { page, limit });
        return {
            message: `Préstamos con estado "${estado}" obtenidos exitosamente`,
            data
        };
    }

    @Get('vencidos')
    @UseGuards(JwtAuthGuard)
    async findVencidos() {
        const data = await this.prestamosService.findVencidos();
        return {
            message: 'Préstamos vencidos obtenidos exitosamente',
            data
        };
    }

    @Get('estadisticas')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'administrador', 'bibliotecario')
    async getEstadisticas() {
        const data = await this.prestamosService.getEstadisticas();
        return {
            message: 'Estadísticas de préstamos obtenidas exitosamente',
            data
        };
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.prestamosService.findOne(id);
        return {
            message: 'Préstamo obtenido exitosamente',
            data
        };
    }

    @Patch(':id/devolver')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'bibliotecario', 'administrador')
    async devolver(
        @Param('id', ParseIntPipe) id: number,
        @Body() devolucionDto: DevolucionPrestamoDto
    ) {
        const data = await this.prestamosService.devolver(id, devolucionDto);
        return {
            message: 'Préstamo devuelto exitosamente',
            data
        };
    }

    @Patch(':id/renovar')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'bibliotecario', 'usuario', 'administrador')
    async renovar(
        @Param('id', ParseIntPipe) id: number,
        @Body() renovarDto: RenovarPrestamoDto
    ) {
        const data = await this.prestamosService.renovar(id, renovarDto);
        return {
            message: 'Préstamo renovado exitosamente',
            data
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'bibliotecario', 'administrador')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePrestamoDto: UpdatePrestamoDto
    ) {
        const data = await this.prestamosService.update(id, updatePrestamoDto);
        return {
            message: 'Préstamo actualizado exitosamente',
            data
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'administrador')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.prestamosService.remove(id);
        return {
            message: 'Préstamo eliminado exitosamente'
        };
    }

    @Post('actualizar-vencidos')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'administrador', 'bibliotecario')
    async actualizarVencidos() {
        const actualizados = await this.prestamosService.actualizarPrestamosVencidos();
        return {
            message: `Se actualizaron ${actualizados} préstamos vencidos exitosamente`,
            data: { prestamosActualizados: actualizados }
        };
    }
}