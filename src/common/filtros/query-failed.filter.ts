import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

// Respaldo para errores de base de datos que no maneja cada servicio: en lugar de un 500
// genérico, las violaciones de restricciones de SQLite responden 409 con un mensaje claro.
@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
  private readonly logger = new Logger(QueryFailedFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const respuesta = host.switchToHttp().getResponse<Response>();
    const mensaje = exception.message ?? '';

    let error: HttpException;
    if (/UNIQUE constraint failed/i.test(mensaje)) {
      error = new ConflictException('El registro ya existe');
    } else if (/FOREIGN KEY constraint failed/i.test(mensaje)) {
      error = new ConflictException('El registro está relacionado con otros datos');
    } else {
      this.logger.error(mensaje, exception.stack);
      error = new InternalServerErrorException('Error inesperado en la base de datos');
    }

    respuesta.status(error.getStatus()).json(error.getResponse());
  }
}
