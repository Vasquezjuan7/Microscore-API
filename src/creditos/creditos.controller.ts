import { Controller, Post, Get, Body, Param, ParseUUIDPipe, HttpCode, Query } from '@nestjs/common';
import { CreditosService } from './creditos.service';
import { SolicitudDto } from './dto/solicitud.dto';
import { FiltroCreditosDto } from './dto/filtro-creditos.dto';

@Controller('creditos')
export class CreditosController {
  constructor(private readonly creditosService: CreditosService) {}

  @Post('solicitar')
  solicitarCredito(@Body() dto: SolicitudDto) {
    return this.creditosService.crearSolicitud(dto);
  }

  @Get()
  findAll(@Query() filtro: FiltroCreditosDto) {
    return this.creditosService.findAll(filtro);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.creditosService.findOne(id);
  }

  @Post(':id/evaluar')
  @HttpCode(200)
  evaluarCredito(@Param('id', ParseUUIDPipe) id: string) {
    return this.creditosService.evaluarCredito(id);
  }
}
