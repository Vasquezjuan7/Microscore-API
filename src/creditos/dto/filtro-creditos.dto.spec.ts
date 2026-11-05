import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FiltroCreditosDto } from './filtro-creditos.dto';

async function errores(datos: object): Promise<string[]> {
  const resultado = await validate(plainToInstance(FiltroCreditosDto, datos));
  return resultado.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('FiltroCreditosDto', () => {
  it('permite consultar sin filtros', async () => {
    expect(await errores({})).toEqual([]);
  });

  it.each(['PENDIENTE', 'APROBADO', 'RECHAZADO'])('acepta el estado %p', async (estado) => {
    expect(await errores({ estado })).toEqual([]);
  });

  it('rechaza un estado desconocido', async () => {
    expect(await errores({ estado: 'CANCELADO' })).toContain(
      'El estado debe ser uno de: PENDIENTE, APROBADO, RECHAZADO',
    );
  });
});
