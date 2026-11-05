import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { ActualizarClienteDto, ClienteDto } from './dto/cliente.dto';
import { Cliente } from './entities/cliente.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clientesRepo: Repository<Cliente>,
  ) {}

  async create(dto: ClienteDto): Promise<Cliente> {
    await this.validarEmailDisponible(dto.email);
    const cliente = this.clientesRepo.create(dto);
    return this.guardar(cliente);
  }

  findAll(): Promise<Cliente[]> {
    return this.clientesRepo.find();
  }

  async findOne(id: string): Promise<Cliente> {
    const cliente = await this.clientesRepo.findOne({
      where: { id_cliente: id },
      relations: { creditos: true },
    });
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return cliente;
  }

  // Sirve para PUT (todos los campos) y PATCH (solo los enviados)
  async update(id: string, dto: ActualizarClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id);
    if (dto.email !== undefined && dto.email !== cliente.email) await this.validarEmailDisponible(dto.email);
    Object.assign(cliente, dto);
    return this.guardar(cliente);
  }

  // Si dos peticiones registran el mismo email a la vez, la restricción UNIQUE de la base
  // de datos salta: se devuelve 409 en lugar de un 500.
  private async guardar(cliente: Cliente): Promise<Cliente> {
    try {
      return await this.clientesRepo.save(cliente);
    } catch (error) {
      if (error instanceof QueryFailedError && /UNIQUE/i.test(error.message)) {
        throw new ConflictException(`Ya existe un cliente con el email ${cliente.email}`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const cliente = await this.findOne(id);
    if (cliente.creditos.length > 0) {
      throw new ConflictException('No se puede eliminar un cliente con créditos registrados');
    }
    await this.clientesRepo.remove(cliente);
  }

  private async validarEmailDisponible(email: string): Promise<void> {
    if (await this.clientesRepo.exists({ where: { email } })) {
      throw new ConflictException(`Ya existe un cliente con el email ${email}`);
    }
  }
}
