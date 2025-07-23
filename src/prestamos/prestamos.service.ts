import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestamo, EstadoPrestamo } from './prestamo.entity';
import { CreatePrestamoDto } from './dto/create-prestamos.dto';
import { UpdatePrestamoDto, DevolucionPrestamoDto, RenovarPrestamoDto } from './dto/update-prestamos.dto';
import { Usuario } from '../usuarios/usuario.entity';
import { Libro } from '../libros/libros.entity';
import { paginate, Pagination, IPaginationOptions } from 'nestjs-typeorm-paginate';

@Injectable()
export class PrestamosService {
    private readonly DIAS_PRESTAMO_DEFAULT = 15;
    private readonly MULTA_POR_DIA = 2.00; // Multa en pesos por día de retraso
    private readonly MAX_RENOVACIONES = 2;
    private readonly MAX_PRESTAMOS_USUARIO = 5;

    constructor(
        @InjectRepository(Prestamo)
        private readonly prestamoRepository: Repository<Prestamo>,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
        @InjectRepository(Libro)
        private readonly libroRepository: Repository<Libro>
    ) {}

    async create(createPrestamoDto: CreatePrestamoDto): Promise<Prestamo> {
        // Validar que el usuario existe
        const usuario = await this.usuarioRepository.findOne({ 
            where: { id: createPrestamoDto.usuarioId } 
        });
        if (!usuario) {
            throw new NotFoundException(`Usuario con ID ${createPrestamoDto.usuarioId} no encontrado`);
        }

        // Validar que el libro existe y tiene ejemplares disponibles
        const libro = await this.libroRepository.findOne({ 
            where: { id: createPrestamoDto.libroId } 
        });
        if (!libro) {
            throw new NotFoundException(`Libro con ID ${createPrestamoDto.libroId} no encontrado`);
        }

        if (libro.ejemplaresDisponibles <= 0) {
            throw new BadRequestException('No hay ejemplares disponibles de este libro');
        }

        // Verificar que el usuario no tenga préstamos vencidos
        const prestamosVencidos = await this.prestamoRepository.count({
            where: { 
                usuarioId: createPrestamoDto.usuarioId, 
                estado: EstadoPrestamo.VENCIDO 
            }
        });
        if (prestamosVencidos > 0) {
            throw new BadRequestException('El usuario tiene préstamos vencidos. Debe devolverlos antes de solicitar nuevos préstamos');
        }

        // Verificar límite de préstamos activos por usuario
        const prestamosActivos = await this.prestamoRepository.count({
            where: { 
                usuarioId: createPrestamoDto.usuarioId, 
                estado: EstadoPrestamo.ACTIVO 
            }
        });
        if (prestamosActivos >= this.MAX_PRESTAMOS_USUARIO) {
            throw new BadRequestException(`El usuario ha alcanzado el límite máximo de ${this.MAX_PRESTAMOS_USUARIO} préstamos activos`);
        }

        // Verificar que el usuario no tenga ya este libro prestado
        const prestamoExistente = await this.prestamoRepository.findOne({
            where: { 
                usuarioId: createPrestamoDto.usuarioId, 
                libroId: createPrestamoDto.libroId,
                estado: EstadoPrestamo.ACTIVO 
            }
        });
        if (prestamoExistente) {
            throw new ConflictException('El usuario ya tiene un préstamo activo de este libro');
        }

        // Crear el préstamo
        const prestamo = this.prestamoRepository.create({
            ...createPrestamoDto,
            estado: createPrestamoDto.estado || EstadoPrestamo.ACTIVO
        });

        // Asegurarse de que siempre haya una fechaDevolucionEstimada
        if (!prestamo.fechaDevolucionEstimada) {
            const fechaPrestamo = new Date();
            const fechaDevolucion = new Date(fechaPrestamo);
            fechaDevolucion.setDate(fechaPrestamo.getDate() + this.DIAS_PRESTAMO_DEFAULT);
            prestamo.fechaDevolucionEstimada = fechaDevolucion;
        }

        const prestamoGuardado = await this.prestamoRepository.save(prestamo);

        // Reducir ejemplares disponibles del libro
        await this.libroRepository.update(libro.id, {
            ejemplaresDisponibles: libro.ejemplaresDisponibles - 1
        });

        return this.findOne(prestamoGuardado.id);
    }

    async findAll(options: IPaginationOptions): Promise<Pagination<Prestamo>> {
        const queryBuilder = this.prestamoRepository.createQueryBuilder('prestamo')
            .leftJoinAndSelect('prestamo.usuario', 'usuario')
            .leftJoinAndSelect('prestamo.libro', 'libro')
            .orderBy('prestamo.fechaPrestamo', 'DESC');

        return paginate<Prestamo>(queryBuilder, options);
    }

    async findOne(id: number): Promise<Prestamo> {
        const prestamo = await this.prestamoRepository.findOne({
            where: { id },
            relations: ['usuario', 'libro']
        });

        if (!prestamo) {
            throw new NotFoundException(`Préstamo con ID ${id} no encontrado`);
        }

        // Actualizar días de retraso si está vencido
        if (prestamo.estaVencido && prestamo.estado === EstadoPrestamo.ACTIVO) {
            const diasRetraso = prestamo.calcularDiasRetraso;
            if (diasRetraso > 0) {
                await this.prestamoRepository.update(id, {
                    diasRetraso,
                    multaAcumulada: diasRetraso * this.MULTA_POR_DIA,
                    estado: EstadoPrestamo.VENCIDO
                });
                prestamo.diasRetraso = diasRetraso;
                prestamo.multaAcumulada = diasRetraso * this.MULTA_POR_DIA;
                prestamo.estado = EstadoPrestamo.VENCIDO;
            }
        }

        return prestamo;
    }

    async findByUsuario(usuarioId: number, options: IPaginationOptions): Promise<Pagination<Prestamo>> {
        const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId } });
        if (!usuario) {
            throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
        }

        const queryBuilder = this.prestamoRepository.createQueryBuilder('prestamo')
            .leftJoinAndSelect('prestamo.usuario', 'usuario')
            .leftJoinAndSelect('prestamo.libro', 'libro')
            .where('prestamo.usuarioId = :usuarioId', { usuarioId })
            .orderBy('prestamo.fechaPrestamo', 'DESC');

        return paginate<Prestamo>(queryBuilder, options);
    }

    async findByLibro(libroId: number, options: IPaginationOptions): Promise<Pagination<Prestamo>> {
        const libro = await this.libroRepository.findOne({ where: { id: libroId } });
        if (!libro) {
            throw new NotFoundException(`Libro con ID ${libroId} no encontrado`);
        }

        const queryBuilder = this.prestamoRepository.createQueryBuilder('prestamo')
            .leftJoinAndSelect('prestamo.usuario', 'usuario')
            .leftJoinAndSelect('prestamo.libro', 'libro')
            .where('prestamo.libroId = :libroId', { libroId })
            .orderBy('prestamo.fechaPrestamo', 'DESC');

        return paginate<Prestamo>(queryBuilder, options);
    }

    async findByEstado(estado: EstadoPrestamo, options: IPaginationOptions): Promise<Pagination<Prestamo>> {
        const queryBuilder = this.prestamoRepository.createQueryBuilder('prestamo')
            .leftJoinAndSelect('prestamo.usuario', 'usuario')
            .leftJoinAndSelect('prestamo.libro', 'libro')
            .where('prestamo.estado = :estado', { estado })
            .orderBy('prestamo.fechaPrestamo', 'DESC');

        return paginate<Prestamo>(queryBuilder, options);
    }

    async findVencidos(): Promise<Prestamo[]> {
        const hoy = new Date();
        return this.prestamoRepository.find({
            where: { estado: EstadoPrestamo.ACTIVO },
            relations: ['usuario', 'libro']
        }).then(prestamos => {
            return prestamos.filter(prestamo => new Date(prestamo.fechaDevolucionEstimada) < hoy);
        });
    }

    async getEstadisticas() {
        const [total, activos, devueltos, vencidos, renovados] = await Promise.all([
            this.prestamoRepository.count(),
            this.prestamoRepository.count({ where: { estado: EstadoPrestamo.ACTIVO } }),
            this.prestamoRepository.count({ where: { estado: EstadoPrestamo.DEVUELTO } }),
            this.prestamoRepository.count({ where: { estado: EstadoPrestamo.VENCIDO } }),
            this.prestamoRepository.count({ where: { estado: EstadoPrestamo.RENOVADO } })
        ]);

        const multaTotal = await this.prestamoRepository
            .createQueryBuilder('prestamo')
            .select('SUM(prestamo.multaAcumulada)', 'total')
            .getRawOne();

        return {
            totalPrestamos: total,
            prestamosActivos: activos,
            prestamosDevueltos: devueltos,
            prestamosVencidos: vencidos,
            prestamosRenovados: renovados,
            multaTotal: parseFloat(multaTotal?.total || '0')
        };
    }

    async devolver(id: number, devolucionDto: DevolucionPrestamoDto): Promise<Prestamo> {
        const prestamo = await this.findOne(id);

        if (prestamo.estado === EstadoPrestamo.DEVUELTO) {
            throw new BadRequestException('Este préstamo ya ha sido devuelto');
        }

        // Calcular multa si hay retraso
        let multaFinal = prestamo.multaAcumulada;
        const diasRetraso = prestamo.calcularDiasRetraso;
        
        if (diasRetraso > 0) {
            multaFinal = diasRetraso * this.MULTA_POR_DIA;
        }

        // Actualizar el préstamo
        await this.prestamoRepository.update(id, {
            fechaDevolucionReal: devolucionDto.fechaDevolucionReal,
            estado: EstadoPrestamo.DEVUELTO,
            observaciones: devolucionDto.observaciones || prestamo.observaciones,
            diasRetraso,
            multaAcumulada: multaFinal
        });

        // Incrementar ejemplares disponibles del libro
        await this.libroRepository.update(prestamo.libroId, {
            ejemplaresDisponibles: () => 'ejemplaresDisponibles + 1'
        });

        return this.findOne(id);
    }

    async renovar(id: number, renovarDto: RenovarPrestamoDto): Promise<Prestamo> {
        const prestamo = await this.findOne(id);

        if (prestamo.estado !== EstadoPrestamo.ACTIVO) {
            throw new BadRequestException('Solo se pueden renovar préstamos activos');
        }

        // Verificar que no esté vencido
        if (prestamo.estaVencido) {
            throw new BadRequestException('No se pueden renovar préstamos vencidos');
        }

        // Verificar el número de renovaciones (esto requeriría un campo adicional en la entidad)
        // Por ahora, permitimos la renovación si está activo

        await this.prestamoRepository.update(id, {
            fechaDevolucionEstimada: renovarDto.fechaDevolucionEstimada,
            estado: EstadoPrestamo.RENOVADO,
            observaciones: renovarDto.observaciones || prestamo.observaciones
        });

        return this.findOne(id);
    }

    async update(id: number, updatePrestamoDto: UpdatePrestamoDto): Promise<Prestamo> {
        const prestamo = await this.findOne(id);

        // Validar cambios de estado
        if (updatePrestamoDto.estado && updatePrestamoDto.estado !== prestamo.estado) {
            if (prestamo.estado === EstadoPrestamo.DEVUELTO && updatePrestamoDto.estado !== EstadoPrestamo.DEVUELTO) {
                throw new BadRequestException('No se puede cambiar el estado de un préstamo ya devuelto');
            }
        }

        await this.prestamoRepository.update(id, updatePrestamoDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const prestamo = await this.findOne(id);

        if (prestamo.estado === EstadoPrestamo.ACTIVO) {
            throw new BadRequestException('No se puede eliminar un préstamo activo. Primero debe ser devuelto.');
        }

        await this.prestamoRepository.remove(prestamo);
    }

    // Métodos utilitarios
    async actualizarPrestamosVencidos(): Promise<number> {
        const prestamosVencidos = await this.findVencidos();
        let actualizados = 0;

        for (const prestamo of prestamosVencidos) {
            const diasRetraso = prestamo.calcularDiasRetraso;
            if (diasRetraso > 0) {
                await this.prestamoRepository.update(prestamo.id, {
                    estado: EstadoPrestamo.VENCIDO,
                    diasRetraso,
                    multaAcumulada: diasRetraso * this.MULTA_POR_DIA
                });
                actualizados++;
            }
        }

        return actualizados;
    }
}