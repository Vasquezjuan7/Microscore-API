import { Injectable } from '@nestjs/common';
import { SolicitudDto } from './dto/solicitud.dto';
import { SolicitudBuilder } from './builders/solicitud.builder';
import { MotorScoringService } from './motor-scoring.service';

@Injectable()
export class CreditosService {
  constructor(private readonly motorScoring: MotorScoringService) {}

  crearSolicitud(dto: SolicitudDto) {
    // TODO: Integrar con base de datos real más adelante
    const builder = new SolicitudBuilder();
    const solicitud = builder
      .setClienteId(dto.idCliente)
      .setMonto(dto.monto)
      .setProposito(dto.proposito)
      .setIngresos(dto.ingresos)
      .build();

    return {
      message: 'Solicitud creada en memoria (Avance)',
      data: solicitud
    };
  }

  evaluarCredito(id: string) {
    // TODO: Obtener solicitud de la base de datos cuando esté conectada
    // Simulamos un DTO para probar el motor por ahora
    const mockDto: SolicitudDto = {
      idCliente: '123',
      monto: 1000,
      proposito: 'negocio',
      ingresos: 1500,
      estado: 'PENDIENTE'
    };

    const resultado = this.motorScoring.evaluarSolicitud(mockDto);
    
    return {
      idSolicitud: id,
      estadoFinal: resultado,
      nota: 'Evaluación simulada (Avance)'
    };
  }
}
