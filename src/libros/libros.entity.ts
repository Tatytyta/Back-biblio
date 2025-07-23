import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Genero } from '../generos/genero.entity';
import { Estanteria } from '../estanterias/estanterias.entity';
import { Prestamo } from '../prestamos/prestamo.entity';

@Entity('libros')
export class Libro {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    titulo: string;

    @Column()
    autor: string;

    @Column({ unique: true })
    ISBN: string;

    @ManyToOne(() => Genero, genero => genero.libros)
    genero: Genero;

    @ManyToOne(() => Estanteria, estanteria => estanteria.libros)
    estanteria: Estanteria;

    @Column({ default: 1 })
    ejemplaresDisponibles: number;

    @Column({ nullable: true })
    fechaPublicacion: Date;

    @OneToMany(() => Prestamo, prestamo => prestamo.libro)
    prestamos: Prestamo[];
}