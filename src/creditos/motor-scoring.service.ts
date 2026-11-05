import { Inject, Injectable } from '@nestjs/common';
import { ESTRATEGIAS_EVALUACION, IEstrategiaEvaluacion } from './strategies/estrategia-evaluacion.interface';
import { Credito, EstadoCredito } from './entities/credito.entity';

import { PUNTAJE_MINIMO_APROBACION } from '../common/constantes';

// Se reexporta para no romper los imports existentes
export { PUNTAJE_MINIMO_APROBACION };

// Puntos obtenidos en cada criterio, p. ej. { ingresos: 50, proposito: 30, historial: 0 }
export type DesglosePuntaje = Record<string, number>;

export interface ResultadoEvaluacion {
  puntaje: number;
  estado: EstadoCredito;
  desglose: DesglosePuntaje;
}

@Injectable()
export class MotorScoringService {
  constructor(
    @Inject(ESTRATEGIAS_EVALUACION)
    private readonly estrategias: IEstrategiaEvaluacion[],
  ) {}

  evaluarSolicitud(solicitud: Credito): ResultadoEvaluacion {
    const desglose: DesglosePuntaje = {};
    for (const estrategia of this.estrategias) desglose[estrategia.nombre] = estrategia.evaluar(solicitud);

    const puntaje = Object.values(desglose).reduce((total, puntos) => total + puntos, 0);
    const estado = puntaje >= PUNTAJE_MINIMO_APROBACION ? 'APROBADO' : 'RECHAZADO';
    return { puntaje, estado, desglose };
  }
}
