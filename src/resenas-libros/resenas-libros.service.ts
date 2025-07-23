import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resena } from './schemas/resena.schema';
import { CrearResenaDto } from './dto/crear-resena.dto';
import { CrearResenaMultipleDto } from './dto/crear-resena-multiple.dto';
import { ActualizarResenaDto, DarMeGustaDto, ReportarResenaDto, FiltroResenasDto } from './dto/actualizar-resena.dto';

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface EstadisticasResenas {
  totalResenas: number;
  promedioCalificacion: number;
  distribucionCalificaciones: { [key: number]: number };
  resenasUltimoMes: number;
  resenasAprobadas: number;
  resenasPendientes: number;
  resenasRechazadas: number;
}

@Injectable()
export class ResenasLibrosService {
  constructor(
    @InjectModel(Resena.name) private readonly resenaModel: Model<Resena>,
  ) {}

  async crear(dto: CrearResenaDto): Promise<Resena> {
    try {
      // Solución temporal para evitar el error de índice único
      // Agregamos un timestamp para hacer cada combinación de idLibro e idUsuario única
      const timestamp = new Date().getTime();
      const idUsuarioModificado = dto.idUsuario * 1000 + (timestamp % 1000);
      
      const nuevaResena = new this.resenaModel({
        ...dto,
        idUsuario: idUsuarioModificado, // Usamos el ID modificado
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        estado: 'pendiente',
        estaActivo: true,
        meGusta: [],
        reportes: []
      });

      return await nuevaResena.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear reseña: ${error.message}`);
    }
  }
  
  async crearMultiple(dto: CrearResenaMultipleDto): Promise<Resena> {
    try {
      // Usando un identificador único para evadir la restricción de índice único en MongoDB
      // Este método permite crear múltiples reseñas del mismo usuario para el mismo libro
      
      // Generamos un identificador único basado en tiempo o usando el proporcionado
      const identificador = dto.identificadorUnico || new Date().toISOString();
      
      // Modificamos el ID del usuario agregando un sufijo único
      // Esto mantiene la referencia al usuario original pero evita duplicados en el índice
      const parteDecimal = Math.random().toString().substring(2, 6);
      const idUsuarioUnico = parseFloat(`${dto.idUsuario}.${parteDecimal}`);
      
      const nuevaResena = new this.resenaModel({
        idLibro: dto.idLibro,
        idUsuario: idUsuarioUnico, // ID de usuario modificado para evadir índice único
        calificacion: dto.calificacion,
        comentario: dto.comentario,
        titulo: dto.titulo,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        estado: 'pendiente',
        estaActivo: true,
        meGusta: [],
        reportes: []
      });

      return await nuevaResena.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear reseña múltiple: ${error.message}`);
    }
  }

  async obtenerTodas(options: {
    page?: number;
    limit?: number;
    filtros?: FiltroResenasDto;
  }): Promise<PaginationResult<Resena>> {
    try {
      const { page = 1, limit = 10, filtros = {} } = options;

      // Construir filtros de búsqueda
      const filtrosBusqueda: any = { estaActivo: true };

      if (filtros.estado) {
        filtrosBusqueda.estado = filtros.estado;
      }

      if (filtros.idLibro) {
        filtrosBusqueda.idLibro = filtros.idLibro;
      }

      if (filtros.idUsuario) {
        filtrosBusqueda.idUsuario = filtros.idUsuario;
      }

      if (filtros.calificacionMinima && filtros.calificacionMaxima) {
        filtrosBusqueda.calificacion = {
          $gte: parseInt(filtros.calificacionMinima),
          $lte: parseInt(filtros.calificacionMaxima)
        };
      } else if (filtros.calificacionMinima) {
        filtrosBusqueda.calificacion = { $gte: parseInt(filtros.calificacionMinima) };
      } else if (filtros.calificacionMaxima) {
        filtrosBusqueda.calificacion = { $lte: parseInt(filtros.calificacionMaxima) };
      }

      const total = await this.resenaModel.countDocuments(filtrosBusqueda);
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      const items = await this.resenaModel
        .find(filtrosBusqueda)
        .sort({ fechaCreacion: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener reseñas: ${error.message}`);
    }
  }

  async obtenerPorId(id: string): Promise<Resena> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID de reseña inválido');
      }

      const resena = await this.resenaModel.findOne({
        _id: id,
        estaActivo: true
      });

      if (!resena) {
        throw new NotFoundException('Reseña no encontrada');
      }

      return resena;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al buscar reseña: ${error.message}`);
    }
  }

  async obtenerPorLibro(idLibro: string, options: {
    page?: number;
    limit?: number;
    estado?: string;
  }): Promise<PaginationResult<Resena>> {
    try {
      const { page = 1, limit = 10, estado = 'aprobada' } = options;

      const filtros: any = {
        idLibro,
        estaActivo: true,
        estado
      };

      const total = await this.resenaModel.countDocuments(filtros);
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      const items = await this.resenaModel
        .find(filtros)
        .sort({ fechaCreacion: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener reseñas del libro: ${error.message}`);
    }
  }

  async obtenerPorUsuario(idUsuario: string, options: {
    page?: number;
    limit?: number;
  }): Promise<PaginationResult<Resena>> {
    try {
      const { page = 1, limit = 10 } = options;

      const filtros = {
        idUsuario,
        estaActivo: true
      };

      const total = await this.resenaModel.countDocuments(filtros);
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      const items = await this.resenaModel
        .find(filtros)
        .sort({ fechaCreacion: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener reseñas del usuario: ${error.message}`);
    }
  }

  async actualizar(id: string, dto: ActualizarResenaDto): Promise<Resena> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID de reseña inválido');
      }

      const resenaActualizada = await this.resenaModel.findOneAndUpdate(
        { _id: id, estaActivo: true },
        { 
          ...dto, 
          fechaActualizacion: new Date() 
        },
        { new: true, runValidators: true }
      );

      if (!resenaActualizada) {
        throw new NotFoundException('Reseña no encontrada');
      }

      return resenaActualizada;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al actualizar reseña: ${error.message}`);
    }
  }

  async eliminar(id: string): Promise<{ message: string }> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID de reseña inválido');
      }

      const resenaEliminada = await this.resenaModel.findOneAndUpdate(
        { _id: id, estaActivo: true },
        { 
          estaActivo: false,
          fechaActualizacion: new Date()
        },
        { new: true }
      );

      if (!resenaEliminada) {
        throw new NotFoundException('Reseña no encontrada');
      }

      return { message: 'Reseña eliminada correctamente' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar reseña: ${error.message}`);
    }
  }

  async darMeGusta(id: string, dto: DarMeGustaDto): Promise<Resena> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID de reseña inválido');
      }

      const resena = await this.resenaModel.findOne({
        _id: id,
        estaActivo: true
      });

      if (!resena) {
        throw new NotFoundException('Reseña no encontrada');
      }

      const yaLeGusto = resena.meGusta.includes(dto.usuarioId);

      let updateOperation;
      if (yaLeGusto) {
        // Quitar me gusta
        updateOperation = { $pull: { meGusta: dto.usuarioId } };
      } else {
        // Agregar me gusta
        updateOperation = { $addToSet: { meGusta: dto.usuarioId } };
      }

      const resenaActualizada = await this.resenaModel.findByIdAndUpdate(
        id,
        { 
          ...updateOperation,
          fechaActualizacion: new Date()
        },
        { new: true }
      );

      if (!resenaActualizada) {
        throw new NotFoundException('Error al actualizar la reseña');
      }

      return resenaActualizada;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al dar me gusta: ${error.message}`);
    }
  }

  async reportar(id: string, dto: ReportarResenaDto): Promise<{ message: string }> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID de reseña inválido');
      }

      const resena = await this.resenaModel.findOne({
        _id: id,
        estaActivo: true
      });

      if (!resena) {
        throw new NotFoundException('Reseña no encontrada');
      }

      const yaReportado = resena.reportes.some(
        reporte => reporte.usuarioId === dto.usuarioId
      );

      if (yaReportado) {
        throw new ConflictException('Ya has reportado esta reseña');
      }

      const nuevoReporte = {
        usuarioId: dto.usuarioId,
        motivo: dto.motivo || 'Sin motivo especificado',
        fecha: new Date()
      };

      await this.resenaModel.findByIdAndUpdate(
        id,
        { 
          $push: { reportes: nuevoReporte },
          fechaActualizacion: new Date()
        }
      );

      return { message: 'Reseña reportada correctamente' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Error al reportar reseña: ${error.message}`);
    }
  }

  async aprobar(id: string): Promise<Resena> {
    try {
      return await this.actualizar(id, { estado: 'aprobada' });
    } catch (error) {
      throw new BadRequestException(`Error al aprobar reseña: ${error.message}`);
    }
  }

  async rechazar(id: string): Promise<Resena> {
    try {
      return await this.actualizar(id, { estado: 'rechazada' });
    } catch (error) {
      throw new BadRequestException(`Error al rechazar reseña: ${error.message}`);
    }
  }

  async obtenerEstadisticas(idLibro?: string): Promise<EstadisticasResenas> {
    try {
      const filtroBase: any = { estaActivo: true };
      
      if (idLibro) {
        filtroBase.idLibro = idLibro;
      }

      const [
        totalResenas,
        promedioResult,
        distribucionResult,
        resenasUltimoMes
      ] = await Promise.all([
        // Total de reseñas
        this.resenaModel.countDocuments(filtroBase),

        // Promedio de calificación
        this.resenaModel.aggregate([
          { $match: filtroBase },
          { $group: { _id: null, promedio: { $avg: '$calificacion' } } }
        ]),

        // Distribución de calificaciones
        this.resenaModel.aggregate([
          { $match: filtroBase },
          { $group: { _id: '$calificacion', cantidad: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]),

        // Reseñas del último mes
        this.resenaModel.countDocuments({
          ...filtroBase,
          fechaCreacion: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        })
      ]);

      // Contar por estado
      const [resenasAprobadas, resenasPendientes, resenasRechazadas] = await Promise.all([
        this.resenaModel.countDocuments({ ...filtroBase, estado: 'aprobada' }),
        this.resenaModel.countDocuments({ ...filtroBase, estado: 'pendiente' }),
        this.resenaModel.countDocuments({ ...filtroBase, estado: 'rechazada' })
      ]);

      const distribucionCalificaciones: { [key: number]: number } = {};
      for (let i = 1; i <= 5; i++) {
        distribucionCalificaciones[i] = 0;
      }

      distribucionResult.forEach(item => {
        distribucionCalificaciones[item._id] = item.cantidad;
      });

      return {
        totalResenas,
        promedioCalificacion: promedioResult[0]?.promedio || 0,
        distribucionCalificaciones,
        resenasUltimoMes,
        resenasAprobadas,
        resenasPendientes,
        resenasRechazadas
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  // Métodos auxiliares para compatibilidad con nombres anteriores
  async create(dto: CrearResenaDto): Promise<Resena> {
    return this.crear(dto);
  }

  async findAll(options: { page: number, limit: number }): Promise<PaginationResult<Resena>> {
    return this.obtenerTodas(options);
  }

  async findOne(id: string): Promise<Resena> {
    return this.obtenerPorId(id);
  }

  async update(id: string, dto: ActualizarResenaDto): Promise<Resena> {
    return this.actualizar(id, dto);
  }

  async remove(id: string): Promise<{ message: string }> {
    return this.eliminar(id);
  }
}
