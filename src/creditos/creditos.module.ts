import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditosController } from './creditos.controller';
import { CreditosService } from './creditos.service';
import { MotorScoringService } from './motor-scoring.service';
import { Credito } from './entities/credito.entity';
import { ClientesModule } from '../clientes/clientes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Credito]), ClientesModule],
  controllers: [CreditosController],
  providers: [CreditosService, MotorScoringService],
})
export class CreditosModule {}
