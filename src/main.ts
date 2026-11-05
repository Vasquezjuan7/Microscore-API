import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Env, ENV_POR_DEFECTO } from './env.model';
import { QueryFailedFilter } from './common/filtros/query-failed.filter';
import { LoggingInterceptor } from './common/interceptores/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Valida los DTOs y rechaza campos que no estén declarados en ellos
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  // Traduce las violaciones de restricciones de la base de datos a 409
  app.useGlobalFilters(new QueryFailedFilter());
  // Registra método, ruta, estado y duración de cada petición
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.setGlobalPrefix('v1');
  // Cierra la conexión a la base de datos limpiamente al recibir SIGTERM (docker stop)
  app.enableShutdownHooks();

  // Panel web de pruebas (carpeta public/) en http://localhost:3000/
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const config = app.get<ConfigService<Env, true>>(ConfigService);
  const port = config.get('PORT', ENV_POR_DEFECTO.PORT, { infer: true });

  // Permite consumir la API desde un frontend en otro dominio
  const origen = config.get('CORS_ORIGIN', ENV_POR_DEFECTO.CORS_ORIGIN, { infer: true });
  app.enableCors({ origin: origen === '*' ? true : origen.split(',').map((o) => o.trim()) });
  await app.listen(port);
  console.log(`🚀 API en http://localhost:${port}/v1 · Panel en http://localhost:${port}/`);
}
bootstrap();
