// Valores de negocio del motor de scoring. Centralizarlos evita números mágicos repartidos
// por las estrategias y permite ajustar las reglas desde un solo lugar.

// Puntaje mínimo para aprobar un crédito
export const PUNTAJE_MINIMO_APROBACION = 60;

// Regla de ingresos: proporción ingresos mensuales / monto solicitado
export const INGRESOS_RATIO_ALTO = 0.5;
export const INGRESOS_RATIO_MEDIO = 0.25;
export const PUNTOS_INGRESOS_ALTO = 50;
export const PUNTOS_INGRESOS_MEDIO = 25;

// Regla de propósito
export const PROPOSITOS_PRODUCTIVOS = ['negocio', 'educacion', 'emprendimiento', 'inversion'];
export const PUNTOS_PROPOSITO_PRODUCTIVO = 30;

// Regla de historial
export const PUNTOS_HISTORIAL_APROBADO = 20;

// Puntaje máximo posible sumando todas las reglas
export const PUNTAJE_MAXIMO = PUNTOS_INGRESOS_ALTO + PUNTOS_PROPOSITO_PRODUCTIVO + PUNTOS_HISTORIAL_APROBADO;

// Estados posibles de una solicitud
export const ESTADOS_CREDITO = ['PENDIENTE', 'APROBADO', 'RECHAZADO'] as const;
