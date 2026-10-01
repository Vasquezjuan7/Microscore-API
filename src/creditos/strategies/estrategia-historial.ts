import { IEstrategiaEvaluacion } from './estrategia-evaluacion.interface';
import { SolicitudDto } from '../dto/solicitud.dto';

export class EstrategiaHistorial implements IEstrategiaEvaluacion {
  evaluar(solicitud: SolicitudDto): number {
    return 15;
  }
}
