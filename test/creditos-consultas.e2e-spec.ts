import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { crearApp } from './utilidades';

describe('Créditos: consultas y errores (e2e)', () => {
  let app: INestApplication;
  let idCliente: string;

  beforeAll(async () => {
    app = await crearApp();
    const servidor = app.getHttpServer();
    idCliente = (
      await request(servidor).post('/v1/clientes').send({ nombre: 'Luis', email: 'luis@correo.com', edad: 40 })
    ).body.id_cliente;

    // Una solicitud rechazada (solo cumple ingresos) y otra pendiente
    const rechazada = await request(servidor)
      .post('/v1/creditos/solicitar')
      .send({ idCliente, monto: 800, proposito: 'vacaciones', ingresos: 500 });
    await request(servidor).post(`/v1/creditos/${rechazada.body.id_solicitud}/evaluar`);
    await request(servidor)
      .post('/v1/creditos/solicitar')
      .send({ idCliente, monto: 1000, proposito: 'negocio', ingresos: 100 });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/creditos?estado filtra por estado', async () => {
    const res = await request(app.getHttpServer()).get('/v1/creditos?estado=RECHAZADO').expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ estado: 'RECHAZADO', puntaje: 50 });
  });

  it('GET /v1/creditos?estado rechaza un estado desconocido', async () => {
    await request(app.getHttpServer()).get('/v1/creditos?estado=CANCELADO').expect(400);
  });

  it('GET /v1/clientes/:id/creditos devuelve el historial, más reciente primero', async () => {
    const res = await request(app.getHttpServer()).get(`/v1/clientes/${idCliente}/creditos`).expect(200);
    expect(res.body.map((c: { estado: string }) => c.estado)).toEqual(['PENDIENTE', 'RECHAZADO']);
  });

  it('no permite eliminar un cliente con créditos', async () => {
    await request(app.getHttpServer()).delete(`/v1/clientes/${idCliente}`).expect(409);
  });

  it('responde 404 al solicitar un crédito para un cliente inexistente', async () => {
    await request(app.getHttpServer())
      .post('/v1/creditos/solicitar')
      .send({ idCliente: '11111111-1111-4111-8111-111111111111', monto: 100, proposito: 'negocio', ingresos: 50 })
      .expect(404);
  });

  it('responde 400 si el monto tiene más de 2 decimales', async () => {
    await request(app.getHttpServer())
      .post('/v1/creditos/solicitar')
      .send({ idCliente, monto: 10.123, proposito: 'negocio', ingresos: 50 })
      .expect(400);
  });
});
