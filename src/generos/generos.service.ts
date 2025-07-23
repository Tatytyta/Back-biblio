import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genero } from './genero.entity';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';

@Injectable()
export class GenerosService {
  constructor(
    @InjectRepository(Genero)
    private readonly generoRepository: Repository<Genero>,
  ) {}

  async create(createGeneroDto: CreateGeneroDto): Promise<Genero> {
    // Verificar si ya existe un género con el mismo nombre
    const existingGenero = await this.generoRepository.findOne({
      where: { nombre: createGeneroDto.nombre },
    });

    if (existingGenero) {
      throw new ConflictException('Ya existe un género con este nombre');
    }

    const genero = this.generoRepository.create(createGeneroDto);
    return await this.generoRepository.save(genero);
  }

  async findAll(): Promise<Genero[]> {
    return await this.generoRepository.find({
      relations: ['libros'],
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Genero> {
    const genero = await this.generoRepository.findOne({
      where: { id },
      relations: ['libros'],
    });

    if (!genero) {
      throw new NotFoundException(`Género con ID ${id} no encontrado`);
    }

    return genero;
  }

  async update(id: number, updateGeneroDto: UpdateGeneroDto): Promise<Genero> {
    const genero = await this.findOne(id);

    // Verificar si el nuevo nombre ya existe (si se está cambiando)
    if (updateGeneroDto.nombre && updateGeneroDto.nombre !== genero.nombre) {
      const existingGenero = await this.generoRepository.findOne({
        where: { nombre: updateGeneroDto.nombre },
      });

      if (existingGenero) {
        throw new ConflictException('Ya existe un género con este nombre');
      }
    }

    Object.assign(genero, updateGeneroDto);
    return await this.generoRepository.save(genero);
  }

  async remove(id: number): Promise<void> {
    const genero = await this.findOne(id);

    // Verificar si el género tiene libros asociados
    if (genero.libros && genero.libros.length > 0) {
      throw new ConflictException(
        'No se puede eliminar el género porque tiene libros asociados'
      );
    }

    await this.generoRepository.remove(genero);
  }

  async findByName(nombre: string): Promise<Genero | null> {
    return await this.generoRepository.findOne({
      where: { nombre },
      relations: ['libros'],
    });
  }

  async getGeneroStats(id: number): Promise<{
    genero: Genero;
    totalLibros: number;
    librosDisponibles: number;
  }> {
    const genero = await this.findOne(id);
    
    const totalLibros = genero.libros.length;
    const librosDisponibles = genero.libros.filter(
      libro => libro.ejemplaresDisponibles > 0
    ).length;

    return {
      genero,
      totalLibros,
      librosDisponibles,
    };
  }
}
