import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudDto } from './dto/solicitud.dto';
import { SolicitudBuilder } from './builders/solicitud.builder';
import { MotorScoringService } from './motor-scoring.service';
import { Credito } from './entities/credito.entity';
import { ClientesService } from '../clientes/clientes.service';

@Injectable()
export class CreditosService {
  constructor(
    @InjectRepository(Credito)
    private readonly creditosRepo: Repository<Credito>,
    private readonly clientesService: ClientesService,
    private readonly motorScoring: MotorScoringService,
  ) {}

  async crearSolicitud(dto: SolicitudDto): Promise<Credito> {
    // Lanza 404 si el cliente no existe
    await this.clientesService.findOne(dto.idCliente);

    const solicitud = new SolicitudBuilder()
      .setClienteId(dto.idCliente)
      .setMonto(dto.monto)
      .setProposito(dto.proposito)
      .setIngresos(dto.ingresos)
      .build();

    return this.creditosRepo.save(solicitud);
  }

  findAll(): Promise<Credito[]> {
    return this.creditosRepo.find();
  }

  async findOne(id: string): Promise<Credito> {
    const credito = await this.creditosRepo.findOne({
      where: { id_solicitud: id },
      // El historial del cliente lo usa EstrategiaHistorial
      relations: { cliente: { creditos: true } },
    });
    if (!credito) throw new NotFoundException(`Solicitud ${id} no encontrada`);
    return credito;
  }

  async evaluarCredito(id: string): Promise<Credito> {
    const credito = await this.findOne(id);
    if (credito.estado !== 'PENDIENTE') {
      throw new ConflictException(`La solicitud ya fue evaluada (${credito.estado})`);
    }

    const { puntaje, estado } = this.motorScoring.evaluarSolicitud(credito);
    await this.creditosRepo.update(id, { puntaje, estado });
    return { ...credito, puntaje, estado };
  }
}
