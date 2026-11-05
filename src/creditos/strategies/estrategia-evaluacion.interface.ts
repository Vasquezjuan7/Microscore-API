import { Credito } from '../entities/credito.entity';

// Token para inyectar la lista de estrategias en el motor de scoring
export const ESTRATEGIAS_EVALUACION = 'ESTRATEGIAS_EVALUACION';

export interface IEstrategiaEvaluacion {
  // Identificador del criterio en el desglose del puntaje (p. ej. 'ingresos')
  readonly nombre: string;
  evaluar(solicitud: Credito): number;
}
