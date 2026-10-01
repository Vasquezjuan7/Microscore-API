import { SolicitudDto } from '../dto/solicitud.dto';

export interface IEstrategiaEvaluacion {
  evaluar(solicitud: SolicitudDto): number;
}
