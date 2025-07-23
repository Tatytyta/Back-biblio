import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../dto/response.dto';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    // Extraer mensaje de error
    let message: string;
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      if (Array.isArray((exceptionResponse as any).message)) {
        message = (exceptionResponse as any).message.join(', ');
      } else {
        message = (exceptionResponse as any).message || 'Error interno del servidor';
      }
    } else {
      message = 'Error interno del servidor';
    }

    // Crear respuesta de error
    const errorResponse = new ErrorResponseDto(
      message,
      status,
      process.env.NODE_ENV === 'development' ? exception.stack : undefined
    );

    // Logging del error
    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') || '';
    
    this.logger.error(
      `❌ ${method} ${originalUrl} - Status: ${status} - IP: ${ip} - User-Agent: ${userAgent} - Error: ${message}`,
      exception.stack
    );

    // Enviar respuesta
    response.status(status).json(errorResponse);
  }
}
