import { Logger } from '@nestjs/common';
import { ClientesService } from '../clientes/clientes.service';
import { CreditosService } from '../creditos/creditos.service';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Credito } from '../creditos/entities/credito.entity';
import { SolicitudDto } from '../creditos/dto/solicitud.dto';
import { CLIENTES_SEMILLA, cargarSemilla } from './semilla';

describe('cargarSemilla', () => {
  let clientes: jest.Mocked<Pick<ClientesService, 'findAll' | 'create'>>;
  let creditos: jest.Mocked<Pick<CreditosService, 'crearSolicitud' | 'evaluarCredito'>>;

  beforeAll(() => jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined));

  beforeEach(() => {
    let n = 0;
    clientes = {
      findAll: jest.fn().mockResolvedValue([]),
      create: jest.fn(async (dto) => Object.assign(new Cliente(), dto, { id_cliente: `cliente-${++n}` })),
    };
    creditos = {
      crearSolicitud: jest.fn(async (dto: SolicitudDto) =>
        Object.assign(new Credito(), dto, { id_solicitud: `solicitud-${++n}` }),
      ),
      evaluarCredito: jest.fn(),
    };
  });

  const ejecutar = () => cargarSemilla(clientes as unknown as ClientesService, creditos as unknown as CreditosService);

  it('crea todos los clientes y sus solicitudes en una base vacía', async () => {
    await expect(ejecutar()).resolves.toBe(CLIENTES_SEMILLA.length);
    const totalSolicitudes = CLIENTES_SEMILLA.flatMap((c) => c.solicitudes).length;
    expect(creditos.crearSolicitud).toHaveBeenCalledTimes(totalSolicitudes);
  });

  it('solo evalúa las solicitudes marcadas para evaluar', async () => {
    await ejecutar();
    const aEvaluar = CLIENTES_SEMILLA.flatMap((c) => c.solicitudes).filter((s) => s.evaluar).length;
    expect(creditos.evaluarCredito).toHaveBeenCalledTimes(aEvaluar);
  });

  it('no envía el campo evaluar a la solicitud', async () => {
    await ejecutar();
    for (const [dto] of creditos.crearSolicitud.mock.calls) expect(dto).not.toHaveProperty('evaluar');
  });

  it('es idempotente: no repite clientes que ya existen', async () => {
    clientes.findAll.mockResolvedValue(CLIENTES_SEMILLA.map((c) => Object.assign(new Cliente(), { email: c.email })));
    await expect(ejecutar()).resolves.toBe(0);
    expect(clientes.create).not.toHaveBeenCalled();
  });
});
