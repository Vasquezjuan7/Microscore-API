import { Credito } from '../entities/credito.entity';

// Token para inyectar la lista de estrategias en el motor de scoring
export const ESTRATEGIAS_EVALUACION = 'ESTRATEGIAS_EVALUACION';

export interface IEstrategiaEvaluacion {
  evaluar(solicitud: Credito): number;
}
