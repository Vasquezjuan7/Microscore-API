import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { crearApp } from './utilidades';

describe('Clientes: validaciones y errores (e2e)', () => {
  let app: INestApplication;
  const ana = { nombre: 'Ana', email: 'ana@correo.com', edad: 30 };

  beforeAll(async () => {
    app = await crearApp();
    await request(app.getHttpServer()).post('/v1/clientes').send(ana).expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde 400 con mensajes en español si los datos no son válidos', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/clientes')
      .send({ nombre: '', email: 'x', edad: 10 })
      .expect(400);
    expect(res.body.message).toEqual(
      expect.arrayContaining([
        'El nombre es obligatorio',
        'El email no es válido',
        'El cliente debe ser mayor de 18 años',
      ]),
    );
  });

  it('responde 400 si se envían campos no declarados', async () => {
    await request(app.getHttpServer())
      .post('/v1/clientes')
      .send({ ...ana, email: 'otro@correo.com', admin: true })
      .expect(400);
  });

  it('responde 409 si el email ya existe, sin importar mayúsculas', async () => {
    await request(app.getHttpServer())
      .post('/v1/clientes')
      .send({ ...ana, email: 'ANA@Correo.com' })
      .expect(409);
  });

  it('responde 400 si el id no es un UUID', async () => {
    await request(app.getHttpServer()).get('/v1/clientes/123').expect(400);
  });

  it('responde 404 si el cliente no existe', async () => {
    await request(app.getHttpServer()).get('/v1/clientes/11111111-1111-4111-8111-111111111111').expect(404);
  });
});
