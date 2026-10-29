import { BadRequestException } from '@nestjs/common';
import { SolicitudBuilder } from './solicitud.builder';

describe('SolicitudBuilder', () => {
  it('construye una solicitud PENDIENTE con los datos indicados', () => {
    const solicitud = new SolicitudBuilder()
      .setClienteId('cliente-1')
      .setMonto(1000)
      .setProposito('  negocio ')
      .setIngresos(500)
      .build();

    expect(solicitud).toMatchObject({
      id_cliente: 'cliente-1',
      monto: 1000,
      proposito: 'negocio',
      ingresos: 500,
      estado: 'PENDIENTE',
    });
  });

  it.each([0, -5, NaN])('rechaza el monto %p', (monto) => {
    expect(() => new SolicitudBuilder().setMonto(monto)).toThrow(BadRequestException);
  });

  it('rechaza ingresos negativos', () => {
    expect(() => new SolicitudBuilder().setIngresos(-1)).toThrow(BadRequestException);
  });

  it('no permite construir una solicitud incompleta', () => {
    expect(() => new SolicitudBuilder().setClienteId('cliente-1').setMonto(1000).build()).toThrow(
      'La solicitud está incompleta',
    );
  });
});
