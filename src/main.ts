import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { configurarApp } from './configurar-app';
import { Env, ENV_POR_DEFECTO } from './env.model';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configurarApp(app);
  // Cierra la conexión a la base de datos limpiamente al recibir SIGTERM (docker stop)
  app.enableShutdownHooks();

  // Panel web de pruebas (carpeta public/) en http://localhost:3000/
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const config = app.get<ConfigService<Env, true>>(ConfigService);
  const port = config.get('PORT', ENV_POR_DEFECTO.PORT, { infer: true });

  // Permite consumir la API desde un frontend en otro dominio
  const origen = config.get('CORS_ORIGIN', ENV_POR_DEFECTO.CORS_ORIGIN, { infer: true });
  app.enableCors({ origin: origen === '*' ? true : origen.split(',').map((o) => o.trim()) });

  // Documentación interactiva de la API en /docs (JSON en /docs-json)
  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('MicroScore API')
      .setDescription('Evaluación de microcréditos para emprendedores sin historial bancario')
      .setVersion('1.2.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, documento);

  await app.listen(port);
  console.log(
    `🚀 API en http://localhost:${port}/v1 · Panel en http://localhost:${port}/ · Docs en http://localhost:${port}/docs`,
  );
}
bootstrap();
