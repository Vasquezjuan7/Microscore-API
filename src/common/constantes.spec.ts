import {
  ESTADOS_CREDITO,
  INGRESOS_RATIO_ALTO,
  INGRESOS_RATIO_MEDIO,
  PROPOSITOS_PRODUCTIVOS,
  PUNTAJE_MAXIMO,
  PUNTAJE_MINIMO_APROBACION,
  PUNTOS_HISTORIAL_APROBADO,
  PUNTOS_INGRESOS_ALTO,
  PUNTOS_INGRESOS_MEDIO,
  PUNTOS_PROPOSITO_PRODUCTIVO,
} from './constantes';

describe('constantes de scoring', () => {
  it('el puntaje máximo es 100', () => {
    expect(PUNTAJE_MAXIMO).toBe(100);
  });

  it('ningún criterio aprueba un crédito por sí solo', () => {
    for (const puntos of [PUNTOS_INGRESOS_ALTO, PUNTOS_PROPOSITO_PRODUCTIVO, PUNTOS_HISTORIAL_APROBADO]) {
      expect(puntos).toBeLessThan(PUNTAJE_MINIMO_APROBACION);
    }
  });

  it('el umbral de aprobación es alcanzable', () => {
    expect(PUNTAJE_MINIMO_APROBACION).toBeLessThanOrEqual(PUNTAJE_MAXIMO);
  });

  it('los tramos de ingresos están ordenados', () => {
    expect(INGRESOS_RATIO_ALTO).toBeGreaterThan(INGRESOS_RATIO_MEDIO);
    expect(PUNTOS_INGRESOS_ALTO).toBeGreaterThan(PUNTOS_INGRESOS_MEDIO);
  });

  it('los propósitos productivos están normalizados (minúsculas y sin tildes)', () => {
    for (const p of PROPOSITOS_PRODUCTIVOS) {
      expect(p).toBe(p.toLowerCase().normalize('NFD').replace(/\p{M}/gu, ''));
    }
  });

  it('define los tres estados de una solicitud', () => {
    expect(ESTADOS_CREDITO).toEqual(['PENDIENTE', 'APROBADO', 'RECHAZADO']);
  });
});
