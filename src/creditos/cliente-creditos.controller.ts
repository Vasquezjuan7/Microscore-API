import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CreditosService } from './creditos.service';
import { ApiTags } from '@nestjs/swagger';

// Vive en CreditosModule (y no en ClientesController) para no crear una dependencia circular
// entre los módulos de clientes y créditos.
@ApiTags('clientes')
@Controller('clientes/:id/creditos')
export class ClienteCreditosController {
  constructor(private readonly creditosService: CreditosService) {}

  @Get()
  findByCliente(@Param('id', ParseUUIDPipe) id: string) {
    return this.creditosService.findByCliente(id);
  }
}
