import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditosController } from './creditos.controller';
import { CreditosService } from './creditos.service';
import { MotorScoringService } from './motor-scoring.service';
import { Credito } from './entities/credito.entity';
import { ClientesModule } from '../clientes/clientes.module';
import { ESTRATEGIAS_EVALUACION } from './strategies/estrategia-evaluacion.interface';
import { EstrategiaIngresos } from './strategies/estrategia-ingresos';
import { EstrategiaProposito } from './strategies/estrategia-proposito';
import { EstrategiaHistorial } from './strategies/estrategia-historial';

@Module({
  imports: [TypeOrmModule.forFeature([Credito]), ClientesModule],
  controllers: [CreditosController],
  providers: [
    CreditosService,
    MotorScoringService,
    // Para añadir una regla nueva basta con agregarla a esta lista
    {
      provide: ESTRATEGIAS_EVALUACION,
      useValue: [new EstrategiaIngresos(), new EstrategiaProposito(), new EstrategiaHistorial()],
    },
  ],
})
export class CreditosModule {}
