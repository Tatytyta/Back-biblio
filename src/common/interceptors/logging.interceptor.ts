import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    this.logger.log(
      `📥 ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`
    );

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const duration = Date.now() - now;
        
        this.logger.log(
          `📤 ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms`
        );
      }),
      catchError((error) => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const duration = Date.now() - now;
        
        this.logger.error(
          `❌ ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms - Error: ${error.message}`
        );
        
        return throwError(() => error);
      })
    );
  }
}
