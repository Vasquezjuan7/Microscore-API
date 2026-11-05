import { ConflictException, NotFoundException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { CreditosService } from './creditos.service';
import { MotorScoringService } from './motor-scoring.service';
import { Credito } from './entities/credito.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { ClientesService } from '../clientes/clientes.service';

const ID_CLIENTE = '11111111-1111-4111-8111-111111111111';
const ID_SOLICITUD = '22222222-2222-4222-8222-222222222222';

function crearCliente(creditos: Partial<Credito>[] = []): Cliente {
  return Object.assign(new Cliente(), {
    id_cliente: ID_CLIENTE,
    creditos: creditos.map((c) => Object.assign(new Credito(), c)),
  });
}

describe('CreditosService', () => {
  let repo: jest.Mocked<Pick<Repository<Credito>, 'save' | 'findOne' | 'update' | 'find'>>;
  let clientes: jest.Mocked<Pick<ClientesService, 'findOne'>>;
  let motor: jest.Mocked<Pick<MotorScoringService, 'evaluarSolicitud'>>;
  let service: CreditosService;

  beforeEach(() => {
    repo = { save: jest.fn(), findOne: jest.fn(), update: jest.fn(), find: jest.fn() };
    clientes = { findOne: jest.fn() };
    motor = { evaluarSolicitud: jest.fn().mockReturnValue({ puntaje: 80, estado: 'APROBADO' }) };
    service = new CreditosService(
      repo as unknown as Repository<Credito>,
      clientes as unknown as ClientesService,
      motor as unknown as MotorScoringService,
    );
  });

  const dto = { idCliente: ID_CLIENTE, monto: 1000, proposito: 'negocio', ingresos: 600 };

  it('rechaza una nueva solicitud si el cliente ya tiene una pendiente', async () => {
    clientes.findOne.mockResolvedValue(crearCliente([{ estado: 'PENDIENTE' }]));
    await expect(service.crearSolicitud(dto)).rejects.toThrow(ConflictException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('permite una nueva solicitud si las anteriores ya fueron evaluadas', async () => {
    clientes.findOne.mockResolvedValue(crearCliente([{ estado: 'APROBADO' }, { estado: 'RECHAZADO' }]));
    repo.save.mockImplementation(async (c) => c as Credito);
    await expect(service.crearSolicitud(dto)).resolves.toMatchObject({ estado: 'PENDIENTE' });
  });

  it('devuelve 409 si dos solicitudes simultáneas chocan con el índice de pendientes', async () => {
    clientes.findOne.mockResolvedValue(crearCliente());
    repo.save.mockRejectedValue(
      new QueryFailedError('INSERT', [], new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed: creditos.id_cliente')),
    );
    await expect(service.crearSolicitud(dto)).rejects.toThrow(ConflictException);
  });

  it('solo actualiza si la solicitud sigue PENDIENTE y devuelve el estado guardado', async () => {
    const pendiente = Object.assign(new Credito(), { id_solicitud: ID_SOLICITUD, estado: 'PENDIENTE' });
    const evaluada = Object.assign(new Credito(), { id_solicitud: ID_SOLICITUD, estado: 'APROBADO', puntaje: 80 });
    repo.findOne.mockResolvedValueOnce(pendiente).mockResolvedValueOnce(evaluada);
    repo.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

    await expect(service.evaluarCredito(ID_SOLICITUD)).resolves.toBe(evaluada);
    expect(repo.update).toHaveBeenCalledWith(
      { id_solicitud: ID_SOLICITUD, estado: 'PENDIENTE' },
      { puntaje: 80, estado: 'APROBADO' },
    );
  });

  it('devuelve 409 si otra petición evaluó la solicitud entre medias', async () => {
    repo.findOne.mockResolvedValue(Object.assign(new Credito(), { id_solicitud: ID_SOLICITUD, estado: 'PENDIENTE' }));
    repo.update.mockResolvedValue({ affected: 0, raw: [], generatedMaps: [] });
    await expect(service.evaluarCredito(ID_SOLICITUD)).rejects.toThrow(ConflictException);
  });

  describe('findByCliente', () => {
    it('devuelve las solicitudes del cliente de la más reciente a la más antigua', async () => {
      clientes.findOne.mockResolvedValue(crearCliente());
      const creditos = [Object.assign(new Credito(), { id_cliente: ID_CLIENTE })];
      repo.find.mockResolvedValue(creditos);
      await expect(service.findByCliente(ID_CLIENTE)).resolves.toBe(creditos);
      expect(repo.find).toHaveBeenCalledWith({ where: { id_cliente: ID_CLIENTE }, order: { fecha_solicitud: 'DESC' } });
    });

    it('lanza 404 si el cliente no existe', async () => {
      clientes.findOne.mockRejectedValue(new NotFoundException());
      await expect(service.findByCliente(ID_CLIENTE)).rejects.toThrow(NotFoundException);
      expect(repo.find).not.toHaveBeenCalled();
    });
  });
});
