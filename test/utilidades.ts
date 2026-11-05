import { INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';

// Levanta la API completa sobre una base SQLite en memoria (cada app empieza vacía)
export async function crearApp(): Promise<INestApplication> {
  process.env.DB_PATH = ':memory:';
  Logger.overrideLogger(['error']);
  const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = configurarApp(modulo.createNestApplication());
  await app.init();
  return app;
}
