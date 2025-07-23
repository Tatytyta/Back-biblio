import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Prestamo } from '../prestamos/prestamo.entity';

@Entity('usuarios')
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: 'usuario' })
    role: string;

    @Column({ default: true })
    activo: boolean;

    @Column({ default: 0 })
    tokenVersion: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Prestamo, prestamo => prestamo.usuario)
    prestamos: Prestamo[];
}
