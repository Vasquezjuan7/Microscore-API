import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SolicitudDto } from './solicitud.dto';

async function errores(datos: object): Promise<string[]> {
  const resultado = await validate(plainToInstance(SolicitudDto, datos));
  return resultado.flatMap((e) => Object.values(e.constraints ?? {}));
}

const valida = {
  idCliente: '11111111-1111-4111-8111-111111111111',
  monto: 1000,
  proposito: 'negocio',
  ingresos: 600,
};

describe('SolicitudDto', () => {
  it('acepta una solicitud válida', async () => {
    expect(await errores(valida)).toEqual([]);
  });

  it('rechaza un idCliente que no es UUID', async () => {
    expect(await errores({ ...valida, idCliente: '123' })).toContain('El idCliente debe ser un UUID válido');
  });

  it('rechaza un monto menor a 1', async () => {
    expect(await errores({ ...valida, monto: 0 })).toContain('El monto debe ser de al menos 1');
  });

  it('rechaza un monto con más de 2 decimales', async () => {
    expect(await errores({ ...valida, monto: 10.123 })).toContain('El monto debe ser un número con máximo 2 decimales');
  });

  it('rechaza ingresos negativos', async () => {
    expect(await errores({ ...valida, ingresos: -1 })).toContain('Los ingresos no pueden ser negativos');
  });

  it('rechaza un propósito vacío', async () => {
    expect(await errores({ ...valida, proposito: '' })).toContain('El propósito es obligatorio');
  });
});
