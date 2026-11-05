import { CallHandler, ExecutionContext, Logger, NotFoundException } from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

function crearContexto(statusCode = 200): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'GET', originalUrl: '/v1/clientes' }),
      getResponse: () => ({ statusCode }),
    }),
  } as unknown as ExecutionContext;
}

describe('LoggingInterceptor', () => {
  const interceptor = new LoggingInterceptor();
  let log: jest.SpyInstance;

  beforeEach(() => {
    log = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => log.mockRestore());

  it('registra método, ruta y código de una respuesta exitosa', async () => {
    const next: CallHandler = { handle: () => of([]) };
    await lastValueFrom(interceptor.intercept(crearContexto(200), next));
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/^GET \/v1\/clientes 200 - \d+ms$/));
  });

  it('registra el código de una HttpException', async () => {
    const next: CallHandler = { handle: () => throwError(() => new NotFoundException()) };
    await expect(lastValueFrom(interceptor.intercept(crearContexto(), next))).rejects.toThrow(NotFoundException);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('GET /v1/clientes 404'));
  });

  it('registra 500 ante un error inesperado', async () => {
    const next: CallHandler = { handle: () => throwError(() => new Error('fallo')) };
    await expect(lastValueFrom(interceptor.intercept(crearContexto(), next))).rejects.toThrow('fallo');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('GET /v1/clientes 500'));
  });
});
