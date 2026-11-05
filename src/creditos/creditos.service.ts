import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
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
    const cliente = await this.clientesService.findOne(dto.idCliente);

    // Evita acumular solicitudes: hay que evaluar la pendiente antes de pedir otra
    if (cliente.creditos.some((c) => c.estado === 'PENDIENTE')) {
      throw new ConflictException('El cliente ya tiene una solicitud pendiente de evaluación');
    }

    const solicitud = new SolicitudBuilder()
      .setClienteId(dto.idCliente)
      .setMonto(dto.monto)
      .setProposito(dto.proposito)
      .setIngresos(dto.ingresos)
      .build();

    try {
      return await this.creditosRepo.save(solicitud);
    } catch (error) {
      // Dos solicitudes simultáneas: la segunda choca con el índice único de pendientes
      if (error instanceof QueryFailedError && /UNIQUE/i.test(error.message)) {
        throw new ConflictException('El cliente ya tiene una solicitud pendiente de evaluación');
      }
      throw error;
    }
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
    // Solo actualiza si sigue PENDIENTE: si otra petición la evaluó entre medias, no se pisa
    const resultado = await this.creditosRepo.update({ id_solicitud: id, estado: 'PENDIENTE' }, { puntaje, estado });
    if (!resultado.affected) {
      throw new ConflictException('La solicitud ya fue evaluada por otra petición');
    }
    // Se relee para que la respuesta (incluido el historial del cliente) refleje el estado guardado
    return this.findOne(id);
  }
}
