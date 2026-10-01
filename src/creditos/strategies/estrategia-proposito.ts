import { IEstrategiaEvaluacion } from './estrategia-evaluacion.interface';
import { SolicitudDto } from '../dto/solicitud.dto';

export class EstrategiaProposito implements IEstrategiaEvaluacion {
  evaluar(solicitud: SolicitudDto): number {
    const propositosValidos = ['negocio', 'educacion', 'emprendimiento', 'inversion'];
    if (solicitud.proposito && propositosValidos.includes(solicitud.proposito.toLowerCase())) {
      return 20;
    }
    return 0;
  }
}
