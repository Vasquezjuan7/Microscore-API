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
      database: 'microscore.sqlite',
      entities: [Cliente, Credito],
      synchronize: true, // solo para desarrollo
    }),
    ClientesModule,
    CreditosModule,
  ],
})
export class AppModule {}
