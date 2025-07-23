import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ResenaDocument = Resena & Document;

@Schema({ 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: (doc, ret) => {
      (ret as any).id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  }
})
export class Resena {
  @Prop({ 
    required: [true, 'El ID del libro es requerido'],
    type: Number,
    index: true
  })
  idLibro: number;

  @Prop({ 
    required: [true, 'El ID del usuario es requerido'],
    type: Number,
    index: true
  })
  idUsuario: number;

  @Prop({ 
    required: [true, 'La calificación es requerida'],
    type: Number,
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5']
  })
  calificacion: number;

  @Prop({ 
    type: String,
    maxlength: [1000, 'El comentario no puede exceder 1000 caracteres'],
    trim: true
  })
  comentario?: string;

  @Prop({ 
    type: [String],
    default: []
  })
  meGusta: string[];

  @Prop({ 
    type: [String],
    default: []
  })
  noMeGusta: string[];

  @Prop({ 
    type: Boolean,
    default: true
  })
  estaActivo: boolean;

  @Prop({ 
    type: String,
    enum: ['pendiente', 'aprobada', 'rechazada'],
    default: 'aprobada'
  })
  estado: string;

  @Prop({ 
    type: [{
      usuarioId: String,
      motivo: String,
      fecha: { type: Date, default: Date.now }
    }],
    default: []
  })
  reportes: Array<{
    usuarioId: string;
    motivo: string;
    fecha: Date;
  }>;

  @Prop({ 
    type: Date,
    default: Date.now
  })
  fechaCreacion: Date;

  @Prop({ 
    type: Date,
    default: Date.now
  })
  fechaActualizacion: Date;

  // Campos automáticos de timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const ResenaSchema = SchemaFactory.createForClass(Resena);

// Índices compuestos para optimización
// Se eliminó la restricción unique para permitir múltiples reseñas por usuario y libro
ResenaSchema.index({ idLibro: 1, idUsuario: 1 });  // Ya no es único
ResenaSchema.index({ idLibro: 1, calificacion: -1 });
ResenaSchema.index({ idUsuario: 1, fechaCreacion: -1 });
ResenaSchema.index({ estado: 1, estaActivo: 1 });

// Middleware para actualizar fechaActualizacion
ResenaSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.fechaActualizacion = new Date();
  }
  next();
});

ResenaSchema.pre('findOneAndUpdate', function(next) {
  this.set({ fechaActualizacion: new Date() });
  next();
});
