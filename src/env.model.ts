// Variables de entorno de la API. Las claves coinciden con los nombres del archivo .env
// (ver .env.example). Al agregar una variable, sumarla aquí y en .env.example.
export interface Env {
  PORT: number;
  DB_PATH: string;
  DB_SYNCHRONIZE: string;
  CORS_ORIGIN: string;
}

// Valores por defecto: la API arranca sin .env
export const ENV_POR_DEFECTO: Env = {
  PORT: 3000,
  DB_PATH: 'microscore.sqlite',
  DB_SYNCHRONIZE: 'true',
  // '*' permite cualquier origen; se pueden indicar varios separados por comas
  CORS_ORIGIN: '*',
};
