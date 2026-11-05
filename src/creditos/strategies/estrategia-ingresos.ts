import { IEstrategiaEvaluacion } from './estrategia-evaluacion.interface';
import { Credito } from '../entities/credito.entity';
import {
  INGRESOS_RATIO_ALTO,
  INGRESOS_RATIO_MEDIO,
  PUNTOS_INGRESOS_ALTO,
  PUNTOS_INGRESOS_MEDIO,
} from '../../common/constantes';

// Capacidad de pago: compara los ingresos mensuales con el monto solicitado
export class EstrategiaIngresos implements IEstrategiaEvaluacion {
  readonly nombre = 'ingresos';

  evaluar(solicitud: Credito): number {
    const ratio = solicitud.ingresos / solicitud.monto;
    if (ratio >= INGRESOS_RATIO_ALTO) return PUNTOS_INGRESOS_ALTO;
    if (ratio >= INGRESOS_RATIO_MEDIO) return PUNTOS_INGRESOS_MEDIO;
    return 0;
  }
}
