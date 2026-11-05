import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Valida los DTOs y rechaza campos que no estén declarados en ellos
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.setGlobalPrefix('v1');
  // Cierra la conexión a la base de datos limpiamente al recibir SIGTERM (docker stop)
  app.enableShutdownHooks();

  // Panel web de pruebas (carpeta public/) en http://localhost:3000/
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 API en http://localhost:${port}/v1 · Panel en http://localhost:${port}/`);
}
bootstrap();
