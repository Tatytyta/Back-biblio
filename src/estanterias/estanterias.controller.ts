import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  BadRequestException,
  ParseIntPipe,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateEstanteriaDto } from './dto/create-estanteria.dto';
import { UpdateEstanteriaDto } from './dto/update-estanteria.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { RESPONSE_MESSAGES } from '../common/constants/app.constants';
import { ValidationUtils } from '../common/utils/validation.utils';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Estanteria } from './estanterias.entity';
import { EstanteriasService } from './estanterias.service';

@Controller('estanterias')
@UseGuards(JwtAuthGuard)
export class EstanteriasController {
  constructor(private readonly estanteriasService: EstanteriasService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'administrador', 'bibliotecario')
  async create(@Body() dto: CreateEstanteriaDto) {
    const estanteria = await this.estanteriasService.create(dto);
    return new SuccessResponseDto(RESPONSE_MESSAGES.CREATED, estanteria);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('disponible') disponible?: string,
  ): Promise<SuccessResponseDto<Pagination<Estanteria>>> {
    
    // Validar parámetros de paginación
    const { page: validPage, limit: validLimit } = ValidationUtils.validatePagination(page, limit);
    
    // Validar parámetro disponible
    let disponibleBool: boolean | undefined;
    if (disponible !== undefined) {
      if (disponible !== 'true' && disponible !== 'false') {
        throw new BadRequestException('El parámetro "disponible" debe ser "true" o "false"');
      }
      disponibleBool = disponible === 'true';
    }
    
    const result = await this.estanteriasService.findAll(
      { page: validPage, limit: validLimit }, 
      disponibleBool
    );

    return new SuccessResponseDto(RESPONSE_MESSAGES.SUCCESS, result);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const estanteria = await this.estanteriasService.findOne(id);
    return new SuccessResponseDto(RESPONSE_MESSAGES.SUCCESS, estanteria);
  }

  @Get('codigo/:codigo')
  async findByCode(@Param('codigo') codigo: string) {
    const estanteria = await this.estanteriasService.findByCode(codigo);
    return new SuccessResponseDto(RESPONSE_MESSAGES.SUCCESS, estanteria);
  }

  @Get(':id/stats')
  async getStats(@Param('id', ParseIntPipe) id: number) {
    const stats = await this.estanteriasService.getEstanteriaStats(id);
    return new SuccessResponseDto('Estadísticas de estantería obtenidas exitosamente', stats);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstanteriaDto
  ) {
    const estanteria = await this.estanteriasService.update(id, dto);
    return new SuccessResponseDto(RESPONSE_MESSAGES.UPDATED, estanteria);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const estanteria = await this.estanteriasService.remove(id);
    return new SuccessResponseDto(RESPONSE_MESSAGES.DELETED, estanteria);
  }
}
