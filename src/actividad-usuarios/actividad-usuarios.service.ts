import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ActividadUsuario, TipoActividad } from './schemas/actividad.schema';
import { Model } from 'mongoose';
import { RegistrarActividadDto } from './dto/registrar-actividad.dto';
import { ObtenerActividadesDto, EstadisticasActividadDto } from './dto/obtener-actividades.dto';

@Injectable()
export class ActividadUsuariosService {
  constructor(
    @InjectModel(ActividadUsuario.name) private readonly modelo: Model<ActividadUsuario>,
  ) {}

  async registrar(idUsuario: number, evento: RegistrarActividadDto): Promise<ActividadUsuario | null> {
    try {
      const eventoCompleto = {
        ...evento,
        fecha: new Date(),
      };

      const actividad = await this.modelo.findOneAndUpdate(
        { idUsuario },
        { 
          $push: { eventos: eventoCompleto },
          $inc: { totalEventos: 1 },
          $set: { ultimaActividad: new Date() }
        },
        { upsert: true, new: true },
      );

      console.log(`Actividad registrada para usuario ${idUsuario}: ${evento.tipo}`);
      return actividad;
    } catch (err) {
      console.error('Error al registrar actividad:', err);
      return null;
    }
  }

  async obtenerTodas(options: ObtenerActividadesDto): Promise<any | null> {
    try {
      const { page = 1, limit = 10, tipo, fechaInicio, fechaFin, busqueda } = options;
      const skip = (page - 1) * limit;

      // Construir filtros
      const matchStage: any = {};
      
      if (tipo) {
        matchStage['eventos.tipo'] = tipo;
      }

      if (fechaInicio || fechaFin) {
        matchStage['eventos.fecha'] = {};
        if (fechaInicio) {
          matchStage['eventos.fecha'].$gte = new Date(fechaInicio);
        }
        if (fechaFin) {
          matchStage['eventos.fecha'].$lte = new Date(fechaFin);
        }
      }

      if (busqueda) {
        matchStage.$or = [
          { 'eventos.descripcion': { $regex: busqueda, $options: 'i' } },
          { 'eventos.consulta': { $regex: busqueda, $options: 'i' } }
        ];
      }

      const pipeline: any[] = [
        { $unwind: '$eventos' },
        { $match: matchStage },
        { $sort: { 'eventos.fecha': -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $group: {
            _id: '$_id',
            idUsuario: { $first: '$idUsuario' },
            eventos: { $push: '$eventos' },
            ultimaActividad: { $first: '$ultimaActividad' },
            totalEventos: { $first: '$totalEventos' }
          }
        }
      ];

      const actividades = await this.modelo.aggregate(pipeline);
      const total = await this.modelo.countDocuments(matchStage);

      return {
        items: actividades,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      };
    } catch (err) {
      console.error('Error al obtener actividades:', err);
      return null;
    }
  }

  async obtenerPorUsuario(idUsuario: number, options: ObtenerActividadesDto = {}): Promise<any | null> {
    try {
      const { page = 1, limit = 10, tipo, fechaInicio, fechaFin } = options;
      const skip = (page - 1) * limit;

      const matchStage: any = { idUsuario };
      
      const pipeline: any[] = [
        { $match: matchStage },
        { $unwind: '$eventos' },
      ];

      // Filtros adicionales
      const eventoMatch: any = {};
      if (tipo) {
        eventoMatch['eventos.tipo'] = tipo;
      }
      if (fechaInicio || fechaFin) {
        eventoMatch['eventos.fecha'] = {};
        if (fechaInicio) {
          eventoMatch['eventos.fecha'].$gte = new Date(fechaInicio);
        }
        if (fechaFin) {
          eventoMatch['eventos.fecha'].$lte = new Date(fechaFin);
        }
      }

      if (Object.keys(eventoMatch).length > 0) {
        pipeline.push({ $match: eventoMatch });
      }

      pipeline.push(
        { $sort: { 'eventos.fecha': -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $group: {
            _id: '$_id',
            idUsuario: { $first: '$idUsuario' },
            eventos: { $push: '$eventos' },
            ultimaActividad: { $first: '$ultimaActividad' },
            totalEventos: { $first: '$totalEventos' }
          }
        }
      );

      const result = await this.modelo.aggregate(pipeline);
      
      if (result.length === 0) {
        return null;
      }

      const actividad = result[0];
      const totalEventos = await this.modelo.aggregate([
        { $match: matchStage },
        { $unwind: '$eventos' },
        ...(Object.keys(eventoMatch).length > 0 ? [{ $match: eventoMatch }] : []),
        { $count: 'total' }
      ]);

      const total = totalEventos.length > 0 ? totalEventos[0].total : 0;

      return {
        ...actividad,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (err) {
      console.error('Error al obtener actividad por usuario:', err);
      return null;
    }
  }

  async obtenerEstadisticas(idUsuario?: number, options: EstadisticasActividadDto = {}): Promise<any | null> {
    try {
      const { dias = 30, tipo } = options;
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - dias);

      const matchStage: any = {};
      if (idUsuario) {
        matchStage.idUsuario = idUsuario;
      }

      const pipeline: any[] = [
        { $match: matchStage },
        { $unwind: '$eventos' },
        { $match: { 'eventos.fecha': { $gte: fechaInicio } } },
      ];

      if (tipo) {
        pipeline.push({ $match: { 'eventos.tipo': tipo } });
      }

      pipeline.push(
        {
          $group: {
            _id: {
              fecha: { $dateToString: { format: '%Y-%m-%d', date: '$eventos.fecha' } },
              tipo: '$eventos.tipo'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.fecha': 1 } }
      );

      const estadisticas = await this.modelo.aggregate(pipeline);

      // Estadísticas por tipo
      const estadisticasPorTipo = await this.modelo.aggregate([
        { $match: matchStage },
        { $unwind: '$eventos' },
        { $match: { 'eventos.fecha': { $gte: fechaInicio } } },
        ...(tipo ? [{ $match: { 'eventos.tipo': tipo } }] : []),
        {
          $group: {
            _id: '$eventos.tipo',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return {
        estadisticasPorDia: estadisticas,
        estadisticasPorTipo,
        periodo: { dias, fechaInicio, fechaFin: new Date() }
      };
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      return null;
    }
  }

  async eliminar(id: string): Promise<ActividadUsuario | null> {
    try {
      const actividad = await this.modelo.findByIdAndDelete(id);
      if (!actividad) {
        throw new NotFoundException('Actividad no encontrada');
      }
      return actividad;
    } catch (err) {
      console.error('Error al eliminar actividad:', err);
      return null;
    }
  }

  async eliminarEventoUsuario(idUsuario: number, eventoId: string): Promise<ActividadUsuario | null> {
    try {
      return await this.modelo.findOneAndUpdate(
        { idUsuario },
        { 
          $pull: { eventos: { _id: eventoId } },
          $inc: { totalEventos: -1 }
        },
        { new: true }
      );
    } catch (err) {
      console.error('Error al eliminar evento de usuario:', err);
      return null;
    }
  }

  async limpiarActividadesAntiguas(diasAntiguedad: number = 365): Promise<number> {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);

      const result = await this.modelo.updateMany(
        {},
        {
          $pull: {
            eventos: { fecha: { $lt: fechaLimite } }
          }
        }
      );

      console.log(`Limpieza completada. Documentos modificados: ${result.modifiedCount}`);
      return result.modifiedCount;
    } catch (err) {
      console.error('Error al limpiar actividades antiguas:', err);
      return 0;
    }
  }
  
  async actualizarEvento(idUsuario: number, eventoId: string, datosActualizacion: any): Promise<ActividadUsuario | null> {
    try {
      const resultado = await this.modelo.findOneAndUpdate(
        { 
          idUsuario,
          "eventos._id": eventoId 
        },
        { 
          $set: {
            "eventos.$.tipo": datosActualizacion.tipo,
            "eventos.$.descripcion": datosActualizacion.descripcion,
            "eventos.$.consulta": datosActualizacion.consulta,
            "eventos.$.metadata": datosActualizacion.metadata,
            "eventos.$.fechaActualizacion": new Date()
          },
        },
        { new: true }
      );
      
      if (!resultado) {
        throw new NotFoundException('Evento no encontrado o no pertenece al usuario especificado');
      }
      
      return resultado;
    } catch (err) {
      console.error('Error al actualizar evento de actividad:', err);
      return null;
    }
  }
}
