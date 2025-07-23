import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof UnauthorizedException) {
          // Verificar si el token está próximo a expirar
          const token = this.extractTokenFromHeader(request);
          if (token) {
            try {
              const decoded = this.jwtService.decode(token) as any;
              const now = Math.floor(Date.now() / 1000);
              const timeUntilExpiration = decoded.exp - now;

              // Si el token expira en menos de 5 minutos, agregar header para refresh
              if (timeUntilExpiration < 300) {
                response.setHeader('X-Token-Refresh-Required', 'true');
              }
            } catch (decodeError) {
              // Token inválido, no hacer nada
            }
          }
        }
        return throwError(() => error);
      }),
    );
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
