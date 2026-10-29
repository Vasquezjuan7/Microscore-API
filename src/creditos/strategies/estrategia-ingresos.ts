import { IEstrategiaEvaluacion } from './estrategia-evaluacion.interface';
import { Credito } from '../entities/credito.entity';

// Capacidad de pago: compara los ingresos mensuales con el monto solicitado (máx. 50 puntos)
export class EstrategiaIngresos implements IEstrategiaEvaluacion {
  evaluar(solicitud: Credito): number {
    const ratio = solicitud.ingresos / solicitud.monto;
    if (ratio >= 0.5) return 50;
    if (ratio >= 0.25) return 25;
    return 0;
  }
}
