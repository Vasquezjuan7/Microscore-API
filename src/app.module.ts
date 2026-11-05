import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from './clientes/clientes.module';
import { CreditosModule } from './creditos/creditos.module';
import { Cliente } from './clientes/entities/cliente.entity';
import { Credito } from './creditos/entities/credito.entity';
import { HealthController } from './health/health.controller';
import { Env, ENV_POR_DEFECTO } from './env.model';

@Module({
  imports: [
    // Lee el archivo .env (si existe) y deja ConfigService disponible en toda la app
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        type: 'sqlite',
        database: config.get('DB_PATH', ENV_POR_DEFECTO.DB_PATH, { infer: true }),
        entities: [Cliente, Credito],
        // Crea/actualiza las tablas a partir de los entities. Activo por defecto (el proyecto no
        // tiene migraciones); se puede desactivar con DB_SYNCHRONIZE=false.
        synchronize: config.get('DB_SYNCHRONIZE', ENV_POR_DEFECTO.DB_SYNCHRONIZE, { infer: true }) !== 'false',
      }),
    }),
    ClientesModule,
    CreditosModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
