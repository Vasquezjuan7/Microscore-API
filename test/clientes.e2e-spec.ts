import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { crearApp } from './utilidades';

describe('Clientes (e2e)', () => {
  let app: INestApplication;
  const ana = { nombre: 'Ana Gómez', email: 'ana@correo.com', edad: 30 };

  beforeAll(async () => {
    app = await crearApp();
  });

  afterAll(async () => {
    await app.close();
  });

  let id: string;

  it('POST /v1/clientes crea un cliente', async () => {
    const res = await request(app.getHttpServer()).post('/v1/clientes').send(ana).expect(201);
    expect(res.body).toMatchObject(ana);
    expect(res.body.id_cliente).toBeDefined();
    id = res.body.id_cliente;
  });

  it('GET /v1/clientes lista los clientes', async () => {
    const res = await request(app.getHttpServer()).get('/v1/clientes').expect(200);
    expect(res.body).toHaveLength(1);
  });

  it('GET /v1/clientes/:id devuelve el cliente con sus créditos', async () => {
    const res = await request(app.getHttpServer()).get(`/v1/clientes/${id}`).expect(200);
    expect(res.body).toMatchObject({ ...ana, creditos: [] });
  });

  it('PUT /v1/clientes/:id reemplaza los datos', async () => {
    const res = await request(app.getHttpServer())
      .put(`/v1/clientes/${id}`)
      .send({ ...ana, nombre: 'Ana María Gómez' })
      .expect(200);
    expect(res.body.nombre).toBe('Ana María Gómez');
  });

  it('PATCH /v1/clientes/:id actualiza solo los campos enviados', async () => {
    const res = await request(app.getHttpServer()).patch(`/v1/clientes/${id}`).send({ edad: 31 }).expect(200);
    expect(res.body).toMatchObject({ nombre: 'Ana María Gómez', edad: 31 });
  });

  it('DELETE /v1/clientes/:id elimina el cliente', async () => {
    await request(app.getHttpServer()).delete(`/v1/clientes/${id}`).expect(204);
    await request(app.getHttpServer()).get(`/v1/clientes/${id}`).expect(404);
  });
});
