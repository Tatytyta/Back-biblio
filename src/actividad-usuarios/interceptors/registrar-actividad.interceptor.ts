import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActividadUsuariosService } from '../actividad-usuarios.service';
import { TipoActividad } from '../schemas/actividad.schema';

@Injectable()
export class RegistrarActividadInterceptor implements NestInterceptor {
  constructor(private readonly actividadService: ActividadUsuariosService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Obtener información del usuario si está autenticado
    const user = request.user;
    
    // Obtener información de la request
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'];
    
    // Determinar el tipo de actividad basado en la URL y método
    const tipoActividad = this.determinarTipoActividad(method, url);
    
    return next.handle().pipe(
      tap((data) => {
        // Solo registrar si hay un usuario autenticado y un tipo de actividad válido
        if (user && tipoActividad && response.statusCode < 400) {
          this.registrarActividad(user.id, tipoActividad, {
            url,
            method,
            ip,
            userAgent,
            statusCode: response.statusCode,
            timestamp: new Date(),
          });
        }
      })
    );
  }

  private determinarTipoActividad(method: string, url: string): TipoActividad | null {
    // Mapear rutas a tipos de actividad
    if (url.includes('/auth/login')) return TipoActividad.LOGIN;
    if (url.includes('/auth/logout')) return TipoActividad.LOGOUT;
    if (url.includes('/auth/register')) return TipoActividad.REGISTRO;
    if (url.includes('/libros') && method === 'GET') return TipoActividad.BUSQUEDA;
    if (url.includes('/libros') && method === 'POST') return TipoActividad.VISUALIZACION;
    if (url.includes('/prestamos') && method === 'POST') return TipoActividad.PRESTAMO;
    if (url.includes('/prestamos') && method === 'PUT') return TipoActividad.DEVOLUCION;
    if (url.includes('/resenas') && method === 'POST') return TipoActividad.RESENA;
    
    return null;
  }

  private async registrarActividad(
    idUsuario: number,
    tipo: TipoActividad,
    metadata: any
  ) {
    try {
      await this.actividadService.registrar(idUsuario, {
        tipo,
        descripcion: `${metadata.method} ${metadata.url}`,
        ipAddress: metadata.ip,
        userAgent: metadata.userAgent,
        metadata: {
          statusCode: metadata.statusCode,
          timestamp: metadata.timestamp,
        },
      });
    } catch (error) {
      // No fallar la request principal si falla el registro de actividad
      console.error('Error al registrar actividad automática:', error);
    }
  }
}
