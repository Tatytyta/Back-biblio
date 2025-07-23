import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UpdateEstanteriaDto } from './dto/update-estanteria.dto';
import { CreateEstanteriaDto } from './dto/create-estanteria.dto';
import { Estanteria } from './estanterias.entity';

@Injectable()
export class EstanteriasService {
    constructor(
    @InjectRepository(Estanteria)
    private readonly estanteriaRepo: Repository<Estanteria>,
  ) {}

  async create(dto: CreateEstanteriaDto): Promise<Estanteria> {
    try {
      // Verificar si ya existe una estantería con el mismo código
      const existingEstanteria = await this.estanteriaRepo.findOne({ 
        where: { codigo: dto.codigo } 
      });
      
      if (existingEstanteria) {
        throw new ConflictException(`Ya existe una estantería con el código: ${dto.codigo}`);
      }

      const estanteria = this.estanteriaRepo.create(dto);
      return await this.estanteriaRepo.save(estanteria);
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err;
      }
      console.error('Error creating estanteria:', err);
      throw new Error('Error al crear la estantería');
    }
  }

  async findAll(options: IPaginationOptions, disponible?: boolean): Promise<Pagination<Estanteria>> {
    try {
      const query = this.estanteriaRepo.createQueryBuilder('estanteria')
        .leftJoinAndSelect('estanteria.libros', 'libros');
      
      if (disponible !== undefined) {
        if (disponible) {
          // Estanterías que tienen capacidad disponible
          query.where('estanteria.capacidad > (SELECT COUNT(*) FROM libros WHERE libros.estanteriaId = estanteria.id)');
        } else {
          // Estanterías llenas
          query.where('estanteria.capacidad <= (SELECT COUNT(*) FROM libros WHERE libros.estanteriaId = estanteria.id)');
        }
      }
      
      return await paginate<Estanteria>(query, options);
    } catch (err) {
      console.error('Error retrieving estanterias:', err);
      throw new Error('Error al obtener las estanterías');
    }
  }

  async findOne(id: number): Promise<Estanteria> {
    try {
      const estanteria = await this.estanteriaRepo.findOne({ 
        where: { id },
        relations: ['libros']
      });
      
      if (!estanteria) {
        throw new NotFoundException(`Estantería con ID ${id} no encontrada`);
      }
      
      return estanteria;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      console.error('Error finding estanteria:', err);
      throw new Error('Error al buscar la estantería');
    }
  }

  async findByCode(codigo: string): Promise<Estanteria> {
    try {
      const estanteria = await this.estanteriaRepo.findOne({ 
        where: { codigo },
        relations: ['libros']
      });
      
      if (!estanteria) {
        throw new NotFoundException(`Estantería con código ${codigo} no encontrada`);
      }
      
      return estanteria;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      console.error('Error finding estanteria by code:', err);
      throw new Error('Error al buscar la estantería por código');
    }
  }
   async update(id: number, dto: UpdateEstanteriaDto): Promise<Estanteria> {
    try {
      const estanteria = await this.findOne(id);
      
      // Si se está actualizando el código, verificar que no exista otro con el mismo código
      if (dto.codigo && dto.codigo !== estanteria.codigo) {
        const existingEstanteria = await this.estanteriaRepo.findOne({ 
          where: { codigo: dto.codigo } 
        });
        
        if (existingEstanteria) {
          throw new ConflictException(`Ya existe una estantería con el código: ${dto.codigo}`);
        }
      }

      Object.assign(estanteria, dto);
      return await this.estanteriaRepo.save(estanteria);
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ConflictException) {
        throw err;
      }
      console.error('Error updating estanteria:', err);
      throw new Error('Error al actualizar la estantería');
    }
  }

  async remove(id: number): Promise<Estanteria> {
    try {
      const estanteria = await this.findOne(id);
      
      // Verificar si la estantería tiene libros asociados
      if (estanteria.libros && estanteria.libros.length > 0) {
        throw new ConflictException('No se puede eliminar una estantería que contiene libros');
      }
      
      return await this.estanteriaRepo.remove(estanteria);
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ConflictException) {
        throw err;
      }
      console.error('Error deleting estanteria:', err);
      throw new Error('Error al eliminar la estantería');
    }
  }

  async getEstanteriaStats(id: number): Promise<{
    estanteria: Estanteria;
    librosCount: number;
    disponibles: number;
    porcentajeOcupacion: number;
  }> {
    try {
      const estanteria = await this.findOne(id);
      const librosCount = estanteria.libros?.length || 0;
      const disponibles = estanteria.capacidad - librosCount;
      const porcentajeOcupacion = (librosCount / estanteria.capacidad) * 100;

      return {
        estanteria,
        librosCount,
        disponibles,
        porcentajeOcupacion: Math.round(porcentajeOcupacion * 100) / 100
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      console.error('Error getting estanteria stats:', err);
      throw new Error('Error al obtener estadísticas de la estantería');
    }
  }
}
