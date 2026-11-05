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
      // Crea/actualiza las tablas a partir de los entities. Activo por defecto (el proyecto no
      // tiene migraciones); se puede desactivar con DB_SYNCHRONIZE=false.
      synchronize: process.env.DB_SYNCHRONIZE !== 'false',
    }),
    ClientesModule,
    CreditosModule,
  ],
})
export class AppModule {}
