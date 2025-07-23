import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Libro } from '../libros/libros.entity';

@Entity('estanterias')
export class Estanteria {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 20 })
    codigo: string;

    @Column({ length: 100 })
    ubicacion: string;

    @Column({ type: 'int', unsigned: true })
    capacidad: number;

    @Column({ nullable: true, length: 500 })
    descripcion?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Libro, libro => libro.estanteria)
    libros: Libro[];

    // Método virtual para calcular libros disponibles
    get librosDisponibles(): number {
        return this.capacidad - (this.libros?.length || 0);
    }

    // Método virtual para calcular porcentaje de ocupación
    get porcentajeOcupacion(): number {
        const ocupados = this.libros?.length || 0;
        return Math.round((ocupados / this.capacidad) * 100 * 100) / 100;
    }

    // Método virtual para verificar si está llena
    get estaLlena(): boolean {
        return (this.libros?.length || 0) >= this.capacidad;
    }

    // Método virtual para verificar si está disponible
    get estaDisponible(): boolean {
        return (this.libros?.length || 0) < this.capacidad;
    }
}