import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe,
  UseGuards,
  Query
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GenerosService } from './generos.service';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { UseInterceptors } from '@nestjs/common';

@Controller('generos')
@UseInterceptors(ResponseInterceptor)
@UseGuards(JwtAuthGuard)
export class GenerosController {
  constructor(private readonly generosService: GenerosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('administrador', 'bibliotecario')
  async create(@Body() createGeneroDto: CreateGeneroDto) {
    const genero = await this.generosService.create(createGeneroDto);
    return {
      message: 'Género creado exitosamente',
      data: genero,
    };
  }

  @Get()
  async findAll() {
    const generos = await this.generosService.findAll();
    return {
      message: 'Géneros obtenidos exitosamente',
      data: generos,
    };
  }
  
  @Put('test/:id')
  async updateTest(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGeneroDto: UpdateGeneroDto,
  ) {
    return {
      message: 'Test de actualización exitoso',
      data: { id, updateData: updateGeneroDto },
    };
  }

  @Get('buscar/nombre')
  async findByName(@Query('nombre') nombre: string) {
    const genero = await this.generosService.findByName(nombre);
    return {
      message: genero ? 'Género encontrado' : 'Género no encontrado',
      data: genero,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const genero = await this.generosService.findOne(id);
    return {
      message: 'Género obtenido exitosamente',
      data: genero,
    };
  }

  @Get(':id/stats')
  async getGeneroStats(@Param('id', ParseIntPipe) id: number) {
    const stats = await this.generosService.getGeneroStats(id);
    return {
      message: 'Estadísticas del género obtenidas exitosamente',
      data: stats,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGeneroDto: UpdateGeneroDto,
  ) {
    const genero = await this.generosService.update(id, updateGeneroDto);
    return {
      message: 'Género actualizado exitosamente',
      data: genero,
    };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.generosService.remove(id);
    return {
      message: 'Género eliminado exitosamente',
    };
  }
}
