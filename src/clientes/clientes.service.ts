import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClienteDto } from './dto/cliente.dto';
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
    return this.clientesRepo.save(cliente);
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

  async update(id: string, dto: ClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id);
    if (dto.email !== cliente.email) await this.validarEmailDisponible(dto.email);
    Object.assign(cliente, dto);
    return this.clientesRepo.save(cliente);
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
