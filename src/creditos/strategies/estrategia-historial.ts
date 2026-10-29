import { IEstrategiaEvaluacion } from './estrategia-evaluacion.interface';
import { Credito } from '../entities/credito.entity';

// Premia a clientes con créditos aprobados previamente en MicroScore (máx. 20 puntos).
// No penaliza a clientes nuevos: el sistema está pensado para personas sin historial bancario.
export class EstrategiaHistorial implements IEstrategiaEvaluacion {
  evaluar(solicitud: Credito): number {
    const creditosPrevios = solicitud.cliente?.creditos ?? [];
    const aprobados = creditosPrevios.filter(
      (c) => c.id_solicitud !== solicitud.id_solicitud && c.estado === 'APROBADO',
    );
    return aprobados.length > 0 ? 20 : 0;
  }
}
