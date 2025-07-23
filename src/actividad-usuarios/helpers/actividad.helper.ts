import { Injectable } from '@nestjs/common';
import { ActividadUsuariosService } from '../actividad-usuarios.service';
import { TipoActividad } from '../schemas/actividad.schema';

@Injectable()
export class ActividadHelper {
  constructor(private readonly actividadService: ActividadUsuariosService) {}

  async registrarBusqueda(idUsuario: number, consulta: string, resultados?: number) {
    return this.actividadService.registrar(idUsuario, {
      tipo: TipoActividad.BUSQUEDA,
      descripcion: `Búsqueda: "${consulta}"`,
      consulta,
      metadata: { resultados }
    });
  }

  async registrarVisualizacionLibro(idUsuario: number, idLibro: number, tituloLibro?: string) {
    return this.actividadService.registrar(idUsuario, {
      tipo: TipoActividad.VISUALIZACION,
      descripcion: `Visualización del libro: ${tituloLibro || `ID ${idLibro}`}`,
      idLibro,
      metadata: { tituloLibro }
    });
  }

  async registrarPrestamo(idUsuario: number, idLibro: number, idPrestamo: number, tituloLibro?: string) {
    return this.actividadService.registrar(idUsuario, {
      tipo: TipoActividad.PRESTAMO,
      descripcion: `Préstamo del libro: ${tituloLibro || `ID ${idLibro}`}`,
      idLibro,
      idPrestamo,
      metadata: { tituloLibro }
    });
  }

  async registrarDevolucion(idUsuario: number, idLibro: number, idPrestamo: number, tituloLibro?: string) {
    return this.actividadService.registrar(idUsuario, {
      tipo: TipoActividad.DEVOLUCION,
      descripcion: `Devolución del libro: ${tituloLibro || `ID ${idLibro}`}`,
      idLibro,
      idPrestamo,
      metadata: { tituloLibro }
    });
  }

  async registrarResena(idUsuario: number, idLibro: number, idResena: number, tituloLibro?: string) {
    return this.actividadService.registrar(idUsuario, {
      tipo: TipoActividad.RESENA,
      descripcion: `Reseña del libro: ${tituloLibro || `ID ${idLibro}`}`,
      idLibro,
      idResena,
      metadata: { tituloLibro }
    });
  }

  async registrarLogin(idUsuario: number, ipAddress?: string, userAgent?: string) {
    return this.actividadService.registrar(idUsuario, {
      tipo: TipoActividad.LOGIN,
      descripcion: 'Inicio de sesión',
      ipAddress,
      userAgent,
      metadata: { timestamp: new Date() }
    });
  }

  async registrarLogout(idUsuario: number, ipAddress?: string, userAgent?: string) {
    return this.actividadService.registrar(idUsuario, {
      tipo: TipoActividad.LOGOUT,
      descripcion: 'Cierre de sesión',
      ipAddress,
      userAgent,
      metadata: { timestamp: new Date() }
    });
  }

  async registrarRegistro(idUsuario: number, ipAddress?: string, userAgent?: string) {
    return this.actividadService.registrar(idUsuario, {
      tipo: TipoActividad.REGISTRO,
      descripcion: 'Registro de nuevo usuario',
      ipAddress,
      userAgent,
      metadata: { timestamp: new Date() }
    });
  }
}
