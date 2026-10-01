import { IEstrategiaEvaluacion } from './estrategia-evaluacion.interface';
import { SolicitudDto } from '../dto/solicitud.dto';

export class EstrategiaIngresos implements IEstrategiaEvaluacion {
  evaluar(solicitud: SolicitudDto): number {
    if (solicitud.ingresos >= solicitud.monto * 0.5) {
      return 30;
    }
    return 0;
  }
}
