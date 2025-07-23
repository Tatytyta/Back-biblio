import { Logger, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { join } from 'path';
// Importamos winston-daily-rotate-file como módulo
import 'winston-daily-rotate-file';

export class CustomLogger implements LoggerService {
  private context?: string;
  private logger: winston.Logger;

  constructor(context?: string) {
    this.context = context;

    const logDir = join(process.cwd(), 'logs');

    // Configuración de transporte para guardar logs en archivos con rotación diaria
    const fileTransport = new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d', // Mantener logs por 14 días
    });

    // Configuración de formato para console y archivo
    const consoleFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, context, trace }) => {
        return `${timestamp} [${level}] [${context || this.context || 'Application'}] ${message}${trace ? `\n${trace}` : ''}`;
      }),
    );

    const fileFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    );

    // Crear logger de Winston
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transports: [
        new winston.transports.Console({
          format: consoleFormat,
        }),
        fileTransport,
      ],
      format: fileFormat,
    });
  }

  log(message: any, context?: string): void {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: any, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context: context || this.context });
  }

  warn(message: any, context?: string): void {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: any, context?: string): void {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: any, context?: string): void {
    this.logger.verbose(message, { context: context || this.context });
  }

  setContext(context: string) {
    this.context = context;
    return this;
  }

  // Método para crear una instancia del logger para un contexto específico
  static forContext(context: string): CustomLogger {
    return new CustomLogger(context);
  }
}
