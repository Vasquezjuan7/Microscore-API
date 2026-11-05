import { IEstrategiaEvaluacion } from './estrategia-evaluacion.interface';
import { Credito } from '../entities/credito.entity';
import { PROPOSITOS_PRODUCTIVOS, PUNTOS_PROPOSITO_PRODUCTIVO } from '../../common/constantes';

// Pasa a minúsculas y quita tildes para que "Educación" y "educacion" cuenten igual
function normalizar(texto: string | undefined): string {
  return (texto ?? '').trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

// Se favorecen los créditos con fines productivos
export class EstrategiaProposito implements IEstrategiaEvaluacion {
  evaluar(solicitud: Credito): number {
    return PROPOSITOS_PRODUCTIVOS.includes(normalizar(solicitud.proposito)) ? PUNTOS_PROPOSITO_PRODUCTIVO : 0;
  }
}
