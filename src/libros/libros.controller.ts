import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LibrosService } from './libros.service';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Libro } from './libros.entity';

@Controller('libros')
@UseInterceptors(ResponseInterceptor)
@UseGuards(JwtAuthGuard) // El guard JwtAuthGuard a nivel controlador para todas las rutas
export class LibrosController {
  constructor(private readonly librosService: LibrosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'administrador', 'bibliotecario')
  async create(@Body() createLibroDto: CreateLibroDto) {
    const libro = await this.librosService.create(createLibroDto);
    return {
      message: 'Libro creado exitosamente',
      data: libro,
    };
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const result = await this.librosService.findAll({ page, limit });
    return {
      message: 'Libros obtenidos exitosamente',
      data: result,
    };
  }

  @Get('disponibles')
  async findDisponibles() {
    const libros = await this.librosService.findDisponibles();
    return {
      message: 'Libros disponibles obtenidos exitosamente',
      data: libros,
    };
  }

  @Get('buscar')
  async searchLibros(@Query('q') query: string) {
    const libros = await this.librosService.searchLibros(query);
    return {
      message: 'Búsqueda realizada exitosamente',
      data: libros,
    };
  }

  @Get('titulo/:titulo')
  async findByTitle(@Param('titulo') titulo: string) {
    const libros = await this.librosService.findByTitle(titulo);
    return {
      message: 'Libros encontrados por título',
      data: libros,
    };
  }

  @Get('autor/:autor')
  async findByAutor(@Param('autor') autor: string) {
    const libros = await this.librosService.findByAutor(autor);
    return {
      message: 'Libros encontrados por autor',
      data: libros,
    };
  }

  @Get('isbn/:isbn')
  async findByISBN(@Param('isbn') isbn: string) {
    const libro = await this.librosService.findByISBN(isbn);
    return {
      message: libro ? 'Libro encontrado' : 'Libro no encontrado',
      data: libro,
    };
  }

  @Get('genero/:generoId')
  async findByGenero(@Param('generoId', ParseIntPipe) generoId: number) {
    const libros = await this.librosService.findByGenero(generoId);
    return {
      message: 'Libros encontrados por género',
      data: libros,
    };
  }

  @Get('estanteria/:estanteriaId')
  async findByEstanteria(@Param('estanteriaId', ParseIntPipe) estanteriaId: number) {
    const libros = await this.librosService.findByEstanteria(estanteriaId);
    return {
      message: 'Libros encontrados por estantería',
      data: libros,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const libro = await this.librosService.findOne(id);
    return {
      message: 'Libro obtenido exitosamente',
      data: libro,
    };
  }

  @Get(':id/stats')
  async getLibroStats(@Param('id', ParseIntPipe) id: number) {
    const stats = await this.librosService.getLibroStats(id);
    return {
      message: 'Estadísticas del libro obtenidas exitosamente',
      data: stats,
    };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'bibliotecario', 'administrador')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLibroDto: UpdateLibroDto,
  ) {
    const libro = await this.librosService.update(id, updateLibroDto);
    return {
      message: 'Libro actualizado exitosamente',
      data: libro,
    };
  }

  @Put(':id/ejemplares')
  @UseGuards(RolesGuard)
  @Roles('admin', 'bibliotecario', 'administrador')
  async updateEjemplares(
    @Param('id', ParseIntPipe) id: number,
    @Body('cantidad') cantidad: number,
  ) {
    const libro = await this.librosService.updateEjemplaresDisponibles(id, cantidad);
    return {
      message: 'Ejemplares actualizados exitosamente',
      data: libro,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)  // <- aquí combino ambos guards
  @Roles('administrador')                // <- el rol debe coincidir con el token: 'administrador'
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.librosService.remove(id);
    return {
      message: 'Libro eliminado exitosamente',
    };
  }
}
