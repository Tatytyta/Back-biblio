import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Enum para tipos de actividad
export enum TipoActividad {
  BUSQUEDA = 'busqueda',
  PRESTAMO = 'prestamo',
  DEVOLUCION = 'devolucion',
  RESENA = 'resena',
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTRO = 'registro',
  VISUALIZACION = 'visualizacion',
}

@Schema({ _id: false })
export class EventoActividad {
  @Prop({ required: true, enum: TipoActividad })
  tipo: TipoActividad;

  @Prop()
  descripcion?: string;

  @Prop()
  consulta?: string;

  @Prop()
  idLibro?: number;

  @Prop()
  idPrestamo?: number;

  @Prop()
  idResena?: number;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ default: Date.now })
  fecha: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

@Schema({ timestamps: true })
export class ActividadUsuario extends Document {
  @Prop({ required: true, unique: true })
  idUsuario: number;

  @Prop({ type: [EventoActividad], default: [] })
  eventos: EventoActividad[];

  @Prop({ default: Date.now })
  ultimaActividad: Date;

  @Prop({ default: 0 })
  totalEventos: number;
}

export const ActividadUsuarioSchema = SchemaFactory.createForClass(ActividadUsuario);

// Índices para mejorar performance
// El índice de idUsuario ya se crea automáticamente por el unique: true
ActividadUsuarioSchema.index({ 'eventos.fecha': -1 });
ActividadUsuarioSchema.index({ 'eventos.tipo': 1 });
ActividadUsuarioSchema.index({ ultimaActividad: -1 });
