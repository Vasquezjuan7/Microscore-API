import { IEstrategiaEvaluacion } from './estrategia-evaluacion.interface';
import { Credito } from '../entities/credito.entity';

const PROPOSITOS_PRODUCTIVOS = ['negocio', 'educacion', 'emprendimiento', 'inversion'];

// Se favorecen los créditos con fines productivos (máx. 30 puntos)
export class EstrategiaProposito implements IEstrategiaEvaluacion {
  evaluar(solicitud: Credito): number {
    const proposito = solicitud.proposito?.trim().toLowerCase();
    return PROPOSITOS_PRODUCTIVOS.includes(proposito) ? 30 : 0;
  }
}
