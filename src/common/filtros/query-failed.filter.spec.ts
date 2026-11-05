import { ArgumentsHost, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { QueryFailedFilter } from './query-failed.filter';

function crearHost() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

function errorSqlite(mensaje: string) {
  return new QueryFailedError('INSERT', [], new Error(mensaje));
}

describe('QueryFailedFilter', () => {
  const filtro = new QueryFailedFilter();

  beforeAll(() => jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined));

  it('responde 409 ante una violación de UNIQUE', () => {
    const { host, status, json } = crearHost();
    filtro.catch(errorSqlite('SQLITE_CONSTRAINT: UNIQUE constraint failed: clientes.email'), host);
    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: 'El registro ya existe' }));
  });

  it('responde 409 ante una violación de clave foránea', () => {
    const { host, status } = crearHost();
    filtro.catch(errorSqlite('SQLITE_CONSTRAINT: FOREIGN KEY constraint failed'), host);
    expect(status).toHaveBeenCalledWith(409);
  });

  it('responde 500 ante cualquier otro error de base de datos', () => {
    const { host, status, json } = crearHost();
    filtro.catch(errorSqlite('SQLITE_ERROR: no such table: clientes'), host);
    expect(status).toHaveBeenCalledWith(500);
    // No expone el detalle interno del error al cliente
    expect(JSON.stringify(json.mock.calls[0][0])).not.toContain('no such table');
  });
});
