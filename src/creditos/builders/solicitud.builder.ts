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
    if (!Number.isFinite(monto) || monto <= 0) {
      throw new BadRequestException('El monto debe ser mayor a cero');
    }
    this.solicitud.monto = monto;
    return this;
  }

  setProposito(proposito: string): this {
    if (!proposito?.trim()) throw new BadRequestException('El propósito es requerido');
    this.solicitud.proposito = proposito.trim();
    return this;
  }

  setIngresos(ingresos: number): this {
    if (!Number.isFinite(ingresos) || ingresos < 0) {
      throw new BadRequestException('Los ingresos no pueden ser negativos');
    }
    this.solicitud.ingresos = ingresos;
    return this;
  }

  build(): Credito {
    const { id_cliente, monto, proposito, ingresos } = this.solicitud;
    if (id_cliente === undefined || monto === undefined || proposito === undefined || ingresos === undefined) {
      throw new BadRequestException('La solicitud está incompleta');
    }
    return this.solicitud;
  }
}
