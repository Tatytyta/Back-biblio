import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto, CambiarPasswordDto, FiltroUsuariosDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

export interface EstadisticasUsuarios {
  total: number;
  activos: number;
  inactivos: number;
  porRol: { role: string; count: number }[];
  registrosRecientes: number;
  ultimosRegistros: Usuario[];
}

export interface RespuestaPaginada<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async crear(dto: CreateUsuarioDto): Promise<Usuario> {
    try {
      // Verificar si el email ya existe
      const usuarioExistente = await this.usuarioRepository.findOne({
        where: { email: dto.email }
      });

      if (usuarioExistente) {
        throw new ConflictException('Ya existe un usuario con este email');
      }

      // Verificar si el nombre ya existe
      const nombreExistente = await this.usuarioRepository.findOne({
        where: { nombre: dto.nombre }
      });

      if (nombreExistente) {
        throw new ConflictException('Ya existe un usuario con este nombre');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 12);
      const usuario = this.usuarioRepository.create({
        ...dto, 
        password: hashedPassword,
        role: dto.role || 'usuario',
        activo: true,
        tokenVersion: 0
      });

      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear usuario: ${error.message}`);
    }
  }

  async obtenerTodos(options: {
    page?: number;
    limit?: number;
    filtros?: FiltroUsuariosDto;
  }): Promise<RespuestaPaginada<Usuario>> {
    try {
      const { page = 1, limit = 10, filtros = {} } = options;
      const { search, role, activo, sortBy = 'createdAt', sortOrder = 'DESC' } = filtros;

      const queryBuilder = this.usuarioRepository.createQueryBuilder('usuario');

      // Filtros
      if (search) {
        queryBuilder.andWhere(
          '(usuario.nombre ILIKE :search OR usuario.email ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (role) {
        queryBuilder.andWhere('usuario.role = :role', { role });
      }

      if (activo !== undefined) {
        queryBuilder.andWhere('usuario.activo = :activo', { activo });
      }

      // Ordenamiento
      queryBuilder.orderBy(`usuario.${sortBy}`, sortOrder);

      // Contar total antes de la paginación
      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      // Aplicar paginación
      queryBuilder.skip(skip).take(limit);

      const items = await queryBuilder.getMany();

      return {
        items,
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener usuarios: ${error.message}`);
    }
  }

  async obtenerPorId(id: number): Promise<Usuario> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id },
        relations: ['prestamos']
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return usuario;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al buscar usuario: ${error.message}`);
    }
  }

  async obtenerPorNombre(nombre: string): Promise<Usuario> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { nombre }
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return usuario;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al buscar usuario por nombre: ${error.message}`);
    }
  }

  async obtenerPorEmail(email: string): Promise<Usuario> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { email }
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return usuario;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al buscar usuario por email: ${error.message}`);
    }
  }

  async actualizar(id: number, dto: UpdateUsuarioDto): Promise<Usuario> {
    try {
      const usuario = await this.obtenerPorId(id);

      // Verificar duplicados si se están actualizando email o nombre
      if (dto.email && dto.email !== usuario.email) {
        const emailExistente = await this.usuarioRepository.findOne({
          where: { email: dto.email }
        });
        if (emailExistente) {
          throw new ConflictException('Ya existe un usuario con este email');
        }
      }

      if (dto.nombre && dto.nombre !== usuario.nombre) {
        const nombreExistente = await this.usuarioRepository.findOne({
          where: { nombre: dto.nombre }
        });
        if (nombreExistente) {
          throw new ConflictException('Ya existe un usuario con este nombre');
        }
      }

      // Hash de la nueva contraseña si se proporciona
      if (dto.password) {
        dto.password = await bcrypt.hash(dto.password, 12);
      }

      Object.assign(usuario, dto);
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Error al actualizar usuario: ${error.message}`);
    }
  }

  async eliminar(id: number): Promise<{ message: string }> {
    try {
      const usuario = await this.obtenerPorId(id);

      // Verificar si el usuario tiene préstamos activos
      const prestamosActivos = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .leftJoin('usuario.prestamos', 'prestamo')
        .where('usuario.id = :id', { id })
        .andWhere('prestamo.estado IN (:...estados)', { estados: ['activo', 'vencido', 'renovado'] })
        .getCount();

      if (prestamosActivos > 0) {
        throw new BadRequestException('No se puede eliminar un usuario con préstamos activos');
      }

      await this.usuarioRepository.remove(usuario);
      return { message: 'Usuario eliminado correctamente' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar usuario: ${error.message}`);
    }
  }

  async cambiarPassword(id: number, dto: CambiarPasswordDto): Promise<{ message: string }> {
    try {
      const usuario = await this.obtenerPorId(id);

      // Verificar contraseña actual
      const esValida = await bcrypt.compare(dto.passwordActual, usuario.password);
      if (!esValida) {
        throw new BadRequestException('La contraseña actual es incorrecta');
      }

      // Hash de la nueva contraseña
      const nuevaPasswordHash = await bcrypt.hash(dto.nuevaPassword, 12);
      
      usuario.password = nuevaPasswordHash;
      usuario.tokenVersion += 1; // Invalidar tokens existentes
      
      await this.usuarioRepository.save(usuario);
      
      return { message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al cambiar contraseña: ${error.message}`);
    }
  }

  async activarDesactivar(id: number, activo: boolean): Promise<Usuario> {
    try {
      const usuario = await this.obtenerPorId(id);
      
      if (!activo) {
        // Verificar si el usuario tiene préstamos activos antes de desactivar
        const prestamosActivos = await this.usuarioRepository
          .createQueryBuilder('usuario')
          .leftJoin('usuario.prestamos', 'prestamo')
          .where('usuario.id = :id', { id })
          .andWhere('prestamo.estado IN (:...estados)', { estados: ['activo', 'vencido', 'renovado'] })
          .getCount();

        if (prestamosActivos > 0) {
          throw new BadRequestException('No se puede desactivar un usuario con préstamos activos');
        }
      }

      usuario.activo = activo;
      if (!activo) {
        usuario.tokenVersion += 1; // Invalidar tokens si se desactiva
      }

      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al ${activo ? 'activar' : 'desactivar'} usuario: ${error.message}`);
    }
  }

  async actualizarVersionToken(id: number): Promise<Usuario> {
    try {
      const usuario = await this.obtenerPorId(id);
      usuario.tokenVersion += 1;
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      throw new BadRequestException(`Error al actualizar versión del token: ${error.message}`);
    }
  }

  async obtenerEstadisticas(): Promise<EstadisticasUsuarios> {
    try {
      const totalUsuarios = await this.usuarioRepository.count();
      const usuariosActivos = await this.usuarioRepository.count({ where: { activo: true } });
      const usuariosInactivos = await this.usuarioRepository.count({ where: { activo: false } });
      
      const usuariosPorRol = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .select('usuario.role', 'role')
        .addSelect('COUNT(*)', 'count')
        .groupBy('usuario.role')
        .getRawMany();

      const registrosRecientes = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .where('usuario.createdAt >= :fecha', { 
          fecha: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // últimos 30 días
        })
        .getCount();

      const ultimosRegistros = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .orderBy('usuario.createdAt', 'DESC')
        .take(5)
        .getMany();

      return {
        total: totalUsuarios,
        activos: usuariosActivos,
        inactivos: usuariosInactivos,
        porRol: usuariosPorRol.map(item => ({
          role: item.role,
          count: parseInt(item.count)
        })),
        registrosRecientes,
        ultimosRegistros
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  async buscarUsuarios(termino: string, limite: number = 10): Promise<Usuario[]> {
    try {
      return await this.usuarioRepository.find({
        where: [
          { nombre: Like(`%${termino}%`) },
          { email: Like(`%${termino}%`) }
        ],
        take: limite,
        order: { nombre: 'ASC' }
      });
    } catch (error) {
      throw new BadRequestException(`Error al buscar usuarios: ${error.message}`);
    }
  }

  // Métodos de compatibilidad con nombres anteriores
  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    return this.crear(dto);
  }

  async findAll(options: IPaginationOptions, isActive?: boolean): Promise<Pagination<Usuario>> {
    try {
      const query = this.usuarioRepository.createQueryBuilder('usuario');
      if (isActive !== undefined) {
        query.where('usuario.activo = :isActive', { isActive });
      }
      return await paginate<Usuario>(query, options);
    } catch (error) {
      throw new BadRequestException(`Error al obtener usuarios: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<Usuario | null> {
    try {
      return await this.usuarioRepository.findOne({ where: { id } });
    } catch (error) {
      return null;
    }
  }

  async findByNombre(nombre: string): Promise<Usuario | null> {
    try {
      return await this.usuarioRepository.findOne({ where: { nombre } });
    } catch (error) {
      return null;
    }
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    try {
      return await this.usuarioRepository.findOne({ where: { email } });
    } catch (error) {
      return null;
    }
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<Usuario | null> {
    try {
      const usuario = await this.findOne(id);
      if (!usuario) return null;

      if (dto.password) {
        dto.password = await bcrypt.hash(dto.password, 12);
      }

      Object.assign(usuario, dto);
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      return null;
    }
  }

  async remove(id: number): Promise<Usuario | null> {
    try {
      const usuario = await this.findOne(id);
      if (!usuario) return null;

      return await this.usuarioRepository.remove(usuario);
    } catch (error) {
      return null;
    }
  }

  async updateTokenVersion(id: number): Promise<Usuario | null> {
    try {
      const usuario = await this.findOne(id);
      if (!usuario) return null;

      usuario.tokenVersion += 1;
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      return null;
    }
  }

  async findAllWithFilters(query: any): Promise<any> {
    try {
      const { page = 1, limit = 10, search, role, activo, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
      const filtros: FiltroUsuariosDto = { search, role, activo, sortBy, sortOrder };
      
      return await this.obtenerTodos({ page, limit, filtros });
    } catch (error) {
      return null;
    }
  }

  async getUserStatistics(): Promise<any> {
    try {
      return await this.obtenerEstadisticas();
    } catch (error) {
      return null;
    }
  }
}
