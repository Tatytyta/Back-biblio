import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Libro } from '../libros/libros.entity';

export enum EstadoPrestamo {
  ACTIVO = 'activo',
  DEVUELTO = 'devuelto',
  VENCIDO = 'vencido',
  RENOVADO = 'renovado'
}

@Entity('prestamos')
export class Prestamo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true }) // Temporalmente nullable para permitir la migración
    usuarioId: number;

    @Column({ nullable: true }) // Temporalmente nullable para permitir la migración
    libroId: number;

    @ManyToOne(() => Usuario, usuario => usuario.prestamos, { eager: true })
    @JoinColumn({ name: 'usuarioId' })
    usuario: Usuario;

    @ManyToOne(() => Libro, libro => libro.prestamos, { eager: true })
    @JoinColumn({ name: 'libroId' })
    libro: Libro;

    @CreateDateColumn()
    fechaPrestamo: Date;

    @Column({ type: 'date' }) // No permite valores nulos
    fechaDevolucionEstimada: Date;

    @Column({ type: 'date', nullable: true })
    fechaDevolucionReal: Date;

    @Column({ 
        type: 'enum', 
        enum: EstadoPrestamo, 
        default: EstadoPrestamo.ACTIVO 
    })
    estado: EstadoPrestamo;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @Column({ default: 0 })
    diasRetraso: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    multaAcumulada: number;

    @CreateDateColumn()
    creadoEn: Date;

    @UpdateDateColumn()
    actualizadoEn: Date;

    // Método para calcular si está vencido
    get estaVencido(): boolean {
        if (this.estado === EstadoPrestamo.DEVUELTO) return false;
        return new Date() > new Date(this.fechaDevolucionEstimada);
    }

    // Método para calcular días de retraso
    get calcularDiasRetraso(): number {
        if (this.estado === EstadoPrestamo.DEVUELTO) return 0;
        
        const hoy = new Date();
        const fechaDevolucion = new Date(this.fechaDevolucionEstimada);
        
        if (hoy <= fechaDevolucion) return 0;
        
        const diferencia = hoy.getTime() - fechaDevolucion.getTime();
        return Math.ceil(diferencia / (1000 * 3600 * 24));
    }
}