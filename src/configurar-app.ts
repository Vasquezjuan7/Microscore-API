import { INestApplication, ValidationPipe } from '@nestjs/common';
import { QueryFailedFilter } from './common/filtros/query-failed.filter';
import { LoggingInterceptor } from './common/interceptores/logging.interceptor';

// Configuración global compartida por main.ts y las pruebas e2e, para que ambas usen
// exactamente las mismas validaciones, filtros y prefijo.
export function configurarApp(app: INestApplication): INestApplication {
  // Valida los DTOs y rechaza campos que no estén declarados en ellos
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  // Traduce las violaciones de restricciones de la base de datos a 409
  app.useGlobalFilters(new QueryFailedFilter());
  // Registra método, ruta, estado y duración de cada petición
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.setGlobalPrefix('v1');
  return app;
}
