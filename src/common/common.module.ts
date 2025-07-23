import { Module, Global } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalHttpExceptionFilter } from './filters/http-exception.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Global()
@Module({
  providers: [
    // Filtros globales
    {
      provide: APP_FILTER,
      useClass: GlobalHttpExceptionFilter,
    },
    // Interceptores globales
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // Providers exportables
    GlobalHttpExceptionFilter,
    ResponseInterceptor,
    LoggingInterceptor,
  ],
  exports: [
    GlobalHttpExceptionFilter,
    ResponseInterceptor,
    LoggingInterceptor,
  ],
})
export class CommonModule {}
