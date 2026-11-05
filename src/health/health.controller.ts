import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

// Endpoint de salud para Docker (HEALTHCHECK) y balanceadores: comprueba que la base de datos responde
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    await this.dataSource.query('SELECT 1');
    return { status: 'ok', uptime: Math.round(process.uptime()) };
  }
}
