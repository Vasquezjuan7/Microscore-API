import { MotorScoringService } from './motor-scoring.service';
import { Credito } from './entities/credito.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { EstrategiaIngresos } from './strategies/estrategia-ingresos';
import { EstrategiaProposito } from './strategies/estrategia-proposito';
import { EstrategiaHistorial } from './strategies/estrategia-historial';

function crearSolicitud(datos: Partial<Credito>): Credito {
  return Object.assign(new Credito(), { id_solicitud: 'nueva', monto: 1000, ingresos: 0, proposito: 'otro' }, datos);
}

function clienteConCredito(estado: Credito['estado']): Cliente {
  const cliente = new Cliente();
  cliente.creditos = [Object.assign(new Credito(), { id_solicitud: 'anterior', estado })];
  return cliente;
}

describe('MotorScoringService', () => {
  const motor = new MotorScoringService([
    new EstrategiaIngresos(),
    new EstrategiaProposito(),
    new EstrategiaHistorial(),
  ]);

  it('aprueba con buenos ingresos y propósito productivo', () => {
    const resultado = motor.evaluarSolicitud(crearSolicitud({ ingresos: 600, proposito: 'Negocio' }));
    expect(resultado).toMatchObject({ puntaje: 80, estado: 'APROBADO' });
  });

  it('rechaza si solo cumple los ingresos', () => {
    const resultado = motor.evaluarSolicitud(crearSolicitud({ ingresos: 600, proposito: 'vacaciones' }));
    expect(resultado).toMatchObject({ puntaje: 50, estado: 'RECHAZADO' });
  });

  it('rechaza si solo cumple el propósito', () => {
    const resultado = motor.evaluarSolicitud(crearSolicitud({ ingresos: 100, proposito: 'educacion' }));
    expect(resultado).toMatchObject({ puntaje: 30, estado: 'RECHAZADO' });
  });

  it.each(['Educación', 'INVERSIÓN', ' educacion '])('reconoce el propósito %p con o sin tilde', (proposito) => {
    const resultado = motor.evaluarSolicitud(crearSolicitud({ ingresos: 600, proposito }));
    expect(resultado).toMatchObject({ puntaje: 80, estado: 'APROBADO' });
  });

  it('el historial aprobado compensa ingresos medios', () => {
    const solicitud = crearSolicitud({ ingresos: 300, proposito: 'negocio', cliente: clienteConCredito('APROBADO') });
    expect(motor.evaluarSolicitud(solicitud)).toMatchObject({ puntaje: 75, estado: 'APROBADO' });
  });

  it('un crédito previo rechazado no suma historial', () => {
    const solicitud = crearSolicitud({ ingresos: 300, proposito: 'negocio', cliente: clienteConCredito('RECHAZADO') });
    expect(motor.evaluarSolicitud(solicitud)).toMatchObject({ puntaje: 55, estado: 'RECHAZADO' });
  });

  it('devuelve el puntaje de cada criterio en el desglose', () => {
    const solicitud = crearSolicitud({ ingresos: 300, proposito: 'negocio', cliente: clienteConCredito('APROBADO') });
    expect(motor.evaluarSolicitud(solicitud).desglose).toEqual({ ingresos: 25, proposito: 30, historial: 20 });
  });

  it('el puntaje total es la suma del desglose', () => {
    const { puntaje, desglose } = motor.evaluarSolicitud(crearSolicitud({ ingresos: 600, proposito: 'viaje' }));
    expect(puntaje).toBe(Object.values(desglose).reduce((a, b) => a + b, 0));
  });
});
