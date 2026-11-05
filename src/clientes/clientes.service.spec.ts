import { ConflictException, NotFoundException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { ClientesService } from './clientes.service';
import { Cliente } from './entities/cliente.entity';
import { Credito } from '../creditos/entities/credito.entity';

const ID = '11111111-1111-4111-8111-111111111111';
const dto = { nombre: 'Ana', email: 'ana@correo.com', edad: 30 };

function crearCliente(datos: Partial<Cliente> = {}): Cliente {
  return Object.assign(new Cliente(), { id_cliente: ID, ...dto, creditos: [] }, datos);
}

describe('ClientesService', () => {
  let repo: jest.Mocked<Pick<Repository<Cliente>, 'create' | 'save' | 'find' | 'findOne' | 'exists' | 'remove'>>;
  let service: ClientesService;

  beforeEach(() => {
    repo = {
      create: jest.fn((datos) => Object.assign(new Cliente(), datos)),
      save: jest.fn(async (c) => c as Cliente),
      find: jest.fn(),
      findOne: jest.fn(),
      exists: jest.fn().mockResolvedValue(false),
      remove: jest.fn(),
    } as never;
    service = new ClientesService(repo as unknown as Repository<Cliente>);
  });

  describe('create', () => {
    it('guarda un cliente nuevo', async () => {
      await expect(service.create(dto)).resolves.toMatchObject(dto);
      expect(repo.save).toHaveBeenCalled();
    });

    it('rechaza un email ya registrado', async () => {
      repo.exists.mockResolvedValue(true);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('devuelve 409 si la restricción UNIQUE salta por concurrencia', async () => {
      repo.save.mockRejectedValue(
        new QueryFailedError('INSERT', [], new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed: clientes.email')),
      );
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('devuelve el cliente con sus créditos', async () => {
      const cliente = crearCliente();
      repo.findOne.mockResolvedValue(cliente);
      await expect(service.findOne(ID)).resolves.toBe(cliente);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id_cliente: ID }, relations: { creditos: true } });
    });

    it('lanza 404 si el cliente no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('permite conservar el mismo email sin validarlo de nuevo', async () => {
      repo.findOne.mockResolvedValue(crearCliente());
      await expect(service.update(ID, { ...dto, nombre: 'Ana María' })).resolves.toMatchObject({ nombre: 'Ana María' });
      expect(repo.exists).not.toHaveBeenCalled();
    });

    it('rechaza cambiar a un email que ya usa otro cliente', async () => {
      repo.findOne.mockResolvedValue(crearCliente());
      repo.exists.mockResolvedValue(true);
      await expect(service.update(ID, { ...dto, email: 'otro@correo.com' })).rejects.toThrow(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('lanza 404 si el cliente no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update(ID, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('elimina un cliente sin créditos', async () => {
      const cliente = crearCliente();
      repo.findOne.mockResolvedValue(cliente);
      await service.remove(ID);
      expect(repo.remove).toHaveBeenCalledWith(cliente);
    });

    it('no elimina un cliente con créditos registrados', async () => {
      repo.findOne.mockResolvedValue(crearCliente({ creditos: [new Credito()] }));
      await expect(service.remove(ID)).rejects.toThrow(ConflictException);
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
