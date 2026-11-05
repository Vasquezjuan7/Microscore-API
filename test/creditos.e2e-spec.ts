import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { crearApp } from './utilidades';

describe('Créditos: flujo de solicitud y evaluación (e2e)', () => {
  let app: INestApplication;
  let idCliente: string;
  let idSolicitud: string;

  const solicitar = (datos: object) =>
    request(app.getHttpServer())
      .post('/v1/creditos/solicitar')
      .send({ idCliente, ...datos });

  beforeAll(async () => {
    app = await crearApp();
    const res = await request(app.getHttpServer())
      .post('/v1/clientes')
      .send({ nombre: 'Ana', email: 'ana@correo.com', edad: 30 });
    idCliente = res.body.id_cliente;
  });

  afterAll(async () => {
    await app.close();
  });

  it('crea la solicitud en estado PENDIENTE', async () => {
    const res = await solicitar({ monto: 1000, proposito: 'Educación', ingresos: 600 }).expect(201);
    expect(res.body).toMatchObject({ estado: 'PENDIENTE', puntaje: null, monto: 1000 });
    idSolicitud = res.body.id_solicitud;
  });

  it('no permite una segunda solicitud mientras haya una pendiente', async () => {
    await solicitar({ monto: 500, proposito: 'negocio', ingresos: 600 }).expect(409);
  });

  it('evalúa la solicitud y guarda el puntaje con su desglose', async () => {
    const res = await request(app.getHttpServer()).post(`/v1/creditos/${idSolicitud}/evaluar`).expect(200);
    expect(res.body).toMatchObject({
      estado: 'APROBADO',
      puntaje: 80,
      desglose: { ingresos: 50, proposito: 30, historial: 0 },
    });
  });

  it('no permite evaluar dos veces la misma solicitud', async () => {
    await request(app.getHttpServer()).post(`/v1/creditos/${idSolicitud}/evaluar`).expect(409);
  });

  it('suma puntos de historial en la siguiente solicitud', async () => {
    const nueva = await solicitar({ monto: 2000, proposito: 'inversion', ingresos: 600 }).expect(201);
    const res = await request(app.getHttpServer()).post(`/v1/creditos/${nueva.body.id_solicitud}/evaluar`).expect(200);
    expect(res.body).toMatchObject({ estado: 'APROBADO', puntaje: 75, desglose: { historial: 20 } });
  });
});
