import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Libro } from '../libros/libros.entity';

@Entity('generos')
export class Genero {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    nombre: string;

    @Column({ nullable: true })
    descripcion: string;

    @OneToMany(() => Libro, libro => libro.genero)
    libros: Libro[];
}