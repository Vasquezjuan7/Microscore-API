import { ColumnOptions } from 'typeorm';

// SQLite guarda por defecto las fechas de creación con precisión de segundos, así que dos registros
// creados en el mismo segundo no se pueden ordenar. Con %f se guardan también los milisegundos.
export const FECHA_CREACION_CON_MILISEGUNDOS: ColumnOptions = {
  type: 'datetime',
  default: () => "(strftime('%Y-%m-%d %H:%M:%f', 'now'))",
};
