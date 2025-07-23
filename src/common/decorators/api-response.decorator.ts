import { SetMetadata } from '@nestjs/common';

// Decorador para marcar endpoints con respuestas exitosas
export const API_SUCCESS_RESPONSE = 'api_success_response';
export const ApiSuccessResponse = (description: string, type?: any) =>
  SetMetadata(API_SUCCESS_RESPONSE, { description, type });

// Decorador para marcar endpoints con respuestas de error
export const API_ERROR_RESPONSE = 'api_error_response';
export const ApiErrorResponse = (description: string, status: number = 400) =>
  SetMetadata(API_ERROR_RESPONSE, { description, status });

// Decorador combinado para respuestas estándar
export const API_STANDARD_RESPONSES = 'api_standard_responses';
export const ApiStandardResponses = (
  successDescription: string,
  successType?: any,
  errorDescription: string = 'Error en la operación'
) =>
  SetMetadata(API_STANDARD_RESPONSES, {
    success: { description: successDescription, type: successType },
    error: { description: errorDescription },
  });

// Decorador para marcar operaciones públicas (sin autenticación)
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Decorador para marcar operaciones que no requieren logging
export const SKIP_LOGGING = 'skipLogging';
export const SkipLogging = () => SetMetadata(SKIP_LOGGING, true);
