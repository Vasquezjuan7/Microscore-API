import { IEstrategiaEvaluacion } from './estrategia-evaluacion.interface';
import { Credito } from '../entities/credito.entity';

const PROPOSITOS_PRODUCTIVOS = ['negocio', 'educacion', 'emprendimiento', 'inversion'];

// Pasa a minúsculas y quita tildes para que "Educación" y "educacion" cuenten igual
function normalizar(texto: string | undefined): string {
  return (texto ?? '').trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

// Se favorecen los créditos con fines productivos (máx. 30 puntos)
export class EstrategiaProposito implements IEstrategiaEvaluacion {
  evaluar(solicitud: Credito): number {
    return PROPOSITOS_PRODUCTIVOS.includes(normalizar(solicitud.proposito)) ? 30 : 0;
  }
}
