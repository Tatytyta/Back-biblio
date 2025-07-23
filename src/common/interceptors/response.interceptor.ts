import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponseDto } from '../dto/response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Si ya es una respuesta estructurada, devolverla tal como está
        if (data instanceof SuccessResponseDto) {
          return data;
        }

        // Si es un objeto con success, message y data, también devolverlo
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Para respuestas simples, envolverlas en SuccessResponseDto
        return new SuccessResponseDto('Operación exitosa', data);
      })
    );
  }
}
