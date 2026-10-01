import { Credito } from '../entities/credito.entity';
import { BadRequestException } from '@nestjs/common';

export class SolicitudBuilder {
  private solicitud: Credito;

  constructor() {
    this.solicitud = new Credito();
    this.solicitud.estado = 'PENDIENTE';
  }

  setClienteId(idCliente: string): this {
    if (!idCliente) throw new BadRequestException('ID de cliente es requerido');
    this.solicitud.id_cliente = idCliente;
    return this;
  }

  setMonto(monto: number): this {
    if (monto <= 0) throw new BadRequestException('El monto debe ser mayor a cero');
    this.solicitud.monto = monto;
    return this;
  }

  setProposito(proposito: string): this {
    if (!proposito) throw new BadRequestException('El propósito es requerido');
    this.solicitud.proposito = proposito;
    return this;
  }

  setIngresos(ingresos: number): this {
    if (ingresos < 0) throw new BadRequestException('Los ingresos no pueden ser negativos');
    this.solicitud.ingresos = ingresos;
    return this;
  }

  build(): Credito {
    return this.solicitud;
  }
}
