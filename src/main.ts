import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Valida los DTOs y rechaza campos que no estén declarados en ellos
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.setGlobalPrefix('v1');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Servidor NestJS ejecutándose en http://localhost:${port}/v1`);
}
bootstrap();
