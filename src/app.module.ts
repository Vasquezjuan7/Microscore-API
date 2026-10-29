import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from './clientes/clientes.module';
import { CreditosModule } from './creditos/creditos.module';
import { Cliente } from './clientes/entities/cliente.entity';
import { Credito } from './creditos/entities/credito.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH ?? 'microscore.sqlite',
      entities: [Cliente, Credito],
      // Crea/actualiza las tablas a partir de los entities. Útil en desarrollo;
      // en producción se reemplazaría por migraciones.
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    ClientesModule,
    CreditosModule,
  ],
})
export class AppModule {}
