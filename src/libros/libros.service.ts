import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Libro } from './libros.entity';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';
import { Genero } from '../generos/genero.entity';
import { Estanteria } from '../estanterias/estanterias.entity';

@Injectable()
export class LibrosService {
  constructor(
    @InjectRepository(Libro)
    private readonly libroRepository: Repository<Libro>,
    @InjectRepository(Genero)
    private readonly generoRepository: Repository<Genero>,
    @InjectRepository(Estanteria)
    private readonly estanteriaRepository: Repository<Estanteria>,
  ) {}

  // Función para normalizar ISBN: eliminar guiones y pasar a minúsculas
  private normalizeISBN(ISBN: string): string {
    return ISBN.replace(/-/g, '').toLowerCase();
  }

  async create(createLibroDto: CreateLibroDto): Promise<Libro> {
    // Soporta que el campo pueda llegar como isbn o ISBN
    const isbnRaw = createLibroDto.ISBN ?? (createLibroDto as any).isbn;
    if (!isbnRaw) {
      throw new BadRequestException('ISBN es obligatorio');
    }

    const normalizedIsbn = this.normalizeISBN(isbnRaw);

    // Buscar por ISBN normalizado
    const existingLibro = await this.libroRepository.findOne({
      where: { ISBN: normalizedIsbn },
    });

    if (existingLibro) {
      throw new ConflictException('Ya existe un libro con este ISBN');
    }

    // Validar género
    const genero = await this.generoRepository.findOne({
      where: { id: createLibroDto.generoId },
    });
    if (!genero) {
      throw new BadRequestException('El género especificado no existe');
    }

    // Validar estantería
    const estanteria = await this.estanteriaRepository.findOne({
      where: { id: createLibroDto.estanteriaId },
    });
    if (!estanteria) {
      throw new BadRequestException('La estantería especificada no existe');
    }

    // Crear libro con ISBN normalizado
    const libro = this.libroRepository.create({
      ...createLibroDto,
      ISBN: normalizedIsbn,
      genero,
      estanteria,
    });

    return await this.libroRepository.save(libro);
  }

  async findAll(options: IPaginationOptions): Promise<Pagination<Libro>> {
    const query = this.libroRepository.createQueryBuilder('libro')
      .leftJoinAndSelect('libro.genero', 'genero')
      .leftJoinAndSelect('libro.estanteria', 'estanteria')
      .leftJoinAndSelect('libro.prestamos', 'prestamos')
      .orderBy('libro.titulo', 'ASC');

    return await paginate<Libro>(query, options);
  }

  async findOne(id: number): Promise<Libro> {
    const libro = await this.libroRepository.findOne({
      where: { id },
      relations: ['genero', 'estanteria', 'prestamos'],
    });

    if (!libro) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }

    return libro;
  }

  async findByISBN(ISBN: string): Promise<Libro | null> {
    const normalizedIsbn = this.normalizeISBN(ISBN);
    return await this.libroRepository.findOne({
      where: { ISBN: normalizedIsbn },
      relations: ['genero', 'estanteria', 'prestamos'],
    });
  }

  async findByTitle(titulo: string): Promise<Libro[]> {
    return await this.libroRepository.createQueryBuilder('libro')
      .leftJoinAndSelect('libro.genero', 'genero')
      .leftJoinAndSelect('libro.estanteria', 'estanteria')
      .where('libro.titulo ILIKE :titulo', { titulo: `%${titulo}%` })
      .orderBy('libro.titulo', 'ASC')
      .getMany();
  }

  async findByAutor(autor: string): Promise<Libro[]> {
    return await this.libroRepository.createQueryBuilder('libro')
      .leftJoinAndSelect('libro.genero', 'genero')
      .leftJoinAndSelect('libro.estanteria', 'estanteria')
      .where('libro.autor ILIKE :autor', { autor: `%${autor}%` })
      .orderBy('libro.titulo', 'ASC')
      .getMany();
  }

  async findByGenero(generoId: number): Promise<Libro[]> {
    return await this.libroRepository.find({
      where: { genero: { id: generoId } },
      relations: ['genero', 'estanteria', 'prestamos'],
      order: { titulo: 'ASC' },
    });
  }

  async findByEstanteria(estanteriaId: number): Promise<Libro[]> {
    return await this.libroRepository.find({
      where: { estanteria: { id: estanteriaId } },
      relations: ['genero', 'estanteria', 'prestamos'],
      order: { titulo: 'ASC' },
    });
  }

  async findDisponibles(): Promise<Libro[]> {
    return await this.libroRepository.createQueryBuilder('libro')
      .leftJoinAndSelect('libro.genero', 'genero')
      .leftJoinAndSelect('libro.estanteria', 'estanteria')
      .where('libro.ejemplaresDisponibles > 0')
      .orderBy('libro.titulo', 'ASC')
      .getMany();
  }

  async update(id: number, updateLibroDto: UpdateLibroDto): Promise<Libro> {
    const libro = await this.findOne(id);

    if (updateLibroDto.ISBN) {
      const normalizedIsbn = this.normalizeISBN(updateLibroDto.ISBN);

      if (normalizedIsbn !== libro.ISBN) {
        const existingLibro = await this.libroRepository.findOne({
          where: { ISBN: normalizedIsbn },
        });
        if (existingLibro) {
          throw new ConflictException('Ya existe un libro con este ISBN');
        }
        updateLibroDto.ISBN = normalizedIsbn;
      }
    }

    if (updateLibroDto.generoId) {
      const genero = await this.generoRepository.findOne({
        where: { id: updateLibroDto.generoId },
      });
      if (!genero) {
        throw new BadRequestException('El género especificado no existe');
      }
      libro.genero = genero;
    }

    if (updateLibroDto.estanteriaId) {
      const estanteria = await this.estanteriaRepository.findOne({
        where: { id: updateLibroDto.estanteriaId },
      });
      if (!estanteria) {
        throw new BadRequestException('La estantería especificada no existe');
      }
      libro.estanteria = estanteria;
    }

    Object.assign(libro, updateLibroDto);

    return await this.libroRepository.save(libro);
  }

  async remove(id: number): Promise<void> {
    const libro = await this.findOne(id);

    if (libro.prestamos && libro.prestamos.length > 0) {
      throw new ConflictException(
        'No se puede eliminar el libro porque tiene préstamos asociados'
      );
    }

    await this.libroRepository.remove(libro);
  }

  async updateEjemplaresDisponibles(id: number, cantidad: number): Promise<Libro> {
    const libro = await this.findOne(id);
    
    if (libro.ejemplaresDisponibles + cantidad < 0) {
      throw new BadRequestException('No hay suficientes ejemplares disponibles');
    }

    libro.ejemplaresDisponibles += cantidad;
    return await this.libroRepository.save(libro);
  }

  async getLibroStats(id: number): Promise<{
    libro: Libro;
    prestamosActivos: number;
    prestamosHistoricos: number;
    disponibilidad: string;
  }> {
    const libro = await this.findOne(id);
    
    const prestamosActivos = libro.prestamos.filter(
      prestamo => !prestamo.fechaDevolucionReal
    ).length;
    
    const prestamosHistoricos = libro.prestamos.length;
    
    const disponibilidad = libro.ejemplaresDisponibles > 0 ? 'Disponible' : 'No disponible';

    return {
      libro,
      prestamosActivos,
      prestamosHistoricos,
      disponibilidad,
    };
  }

  async searchLibros(query: string): Promise<Libro[]> {
    return await this.libroRepository.createQueryBuilder('libro')
      .leftJoinAndSelect('libro.genero', 'genero')
      .leftJoinAndSelect('libro.estanteria', 'estanteria')
      .where('libro.titulo ILIKE :query', { query: `%${query}%` })
      .orWhere('libro.autor ILIKE :query', { query: `%${query}%` })
      .orWhere('libro.ISBN ILIKE :query', { query: `%${query}%` })
      .orderBy('libro.titulo', 'ASC')
      .getMany();
  }
}
