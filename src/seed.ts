import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClientesService } from './clientes/clientes.service';
import { CreditosService } from './creditos/creditos.service';
import { cargarSemilla } from './common/semilla';

// Carga los datos de ejemplo en la base configurada (DB_PATH): npm run seed
async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn'] });
  try {
    const creados = await cargarSemilla(app.get(ClientesService), app.get(CreditosService));
    console.log(`Semilla terminada: ${creados} cliente(s) nuevo(s)`);
  } finally {
    await app.close();
  }
}
main();
