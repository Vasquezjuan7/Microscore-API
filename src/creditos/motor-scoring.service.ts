import { Injectable } from '@nestjs/common';
import { IEstrategiaEvaluacion } from './strategies/estrategia-evaluacion.interface';
import { SolicitudDto } from './dto/solicitud.dto';
import { EstrategiaIngresos } from './strategies/estrategia-ingresos';
import { EstrategiaProposito } from './strategies/estrategia-proposito';
// TODO: Desarrollar e importar más estrategias (ej. Historial)

@Injectable()
export class MotorScoringService {
  private estrategias: IEstrategiaEvaluacion[] = [];

  constructor() {
    // Solo cargamos un par de estrategias como avance preliminar
    this.estrategias.push(new EstrategiaIngresos());
    this.estrategias.push(new EstrategiaProposito());
  }

  evaluarSolicitud(solicitud: SolicitudDto): string {
    let puntaje = 0;
    for (const est of this.estrategias) {
      puntaje += est.evaluar(solicitud);
    }
    
    // Regla temporal para pruebas de desarrollo
    return puntaje >= 30 ? 'APROBADO_PRELIMINAR' : 'RECHAZADO_PRELIMINAR';
  }
}
