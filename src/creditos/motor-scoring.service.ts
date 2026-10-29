import { Inject, Injectable } from '@nestjs/common';
import { ESTRATEGIAS_EVALUACION, IEstrategiaEvaluacion } from './strategies/estrategia-evaluacion.interface';
import { Credito, EstadoCredito } from './entities/credito.entity';

export const PUNTAJE_MINIMO_APROBACION = 60;

export interface ResultadoEvaluacion {
  puntaje: number;
  estado: EstadoCredito;
}

@Injectable()
export class MotorScoringService {
  constructor(
    @Inject(ESTRATEGIAS_EVALUACION)
    private readonly estrategias: IEstrategiaEvaluacion[],
  ) {}

  evaluarSolicitud(solicitud: Credito): ResultadoEvaluacion {
    const puntaje = this.estrategias.reduce((total, est) => total + est.evaluar(solicitud), 0);
    const estado = puntaje >= PUNTAJE_MINIMO_APROBACION ? 'APROBADO' : 'RECHAZADO';
    return { puntaje, estado };
  }
}
