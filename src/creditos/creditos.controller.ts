import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CreditosService } from './creditos.service';
import { SolicitudDto } from './dto/solicitud.dto';

@Controller('creditos')
export class CreditosController {
  constructor(private readonly creditosService: CreditosService) {}

  @Post('solicitar')
  solicitarCredito(@Body() dto: SolicitudDto) {
    return this.creditosService.crearSolicitud(dto);
  }

  @Get(':id/evaluar')
  evaluarCredito(@Param('id') id: string) {
    return this.creditosService.evaluarCredito(id);
  }
}
