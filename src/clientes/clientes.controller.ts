import { Controller, Get, Post, Body, Put, Patch, Param, Delete, ParseUUIDPipe, HttpCode } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ActualizarClienteDto, ClienteDto } from './dto/cliente.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  create(@Body() dto: ClienteDto) {
    return this.clientesService.create(dto);
  }

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ClienteDto) {
    return this.clientesService.update(id, dto);
  }

  // Actualiza solo los campos enviados
  @Patch(':id')
  actualizarParcial(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ActualizarClienteDto) {
    return this.clientesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.remove(id);
  }
}
