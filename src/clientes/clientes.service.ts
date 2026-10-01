import { Injectable } from '@nestjs/common';
import { ClienteDto } from './dto/cliente.dto';

@Injectable()
export class ClientesService {
  create(dto: ClienteDto) {
    return 'This action adds a new cliente (En desarrollo / Avance)';
  }

  findOne(id: string) {
    return `This action returns a #${id} cliente (En desarrollo / Avance)`;
  }

  update(id: string, dto: ClienteDto) {
    return `This action updates a #${id} cliente (En desarrollo / Avance)`;
  }

  remove(id: string) {
    return `This action removes a #${id} cliente (En desarrollo / Avance)`;
  }
}
