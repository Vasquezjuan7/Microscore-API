# MicroScore API

[![CI](https://github.com/Vasquezjuan7/Microscore-API/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/Vasquezjuan7/Microscore-API/actions/workflows/ci.yml)

Sistema de evaluación de microcréditos para emprendedores sin historial bancario.

## Arquitectura y Tecnologías

Proyecto **100% TypeScript** sobre Node.js, con arquitectura modular por características, **TypeORM** y **SQLite**.

1. **ClientesModule (`src/clientes`)**: CRUD de clientes persistido en base de datos.
2. **CreditosModule (`src/creditos`)**: solicitud y evaluación de créditos. Usa dos patrones de diseño:
   - **Builder** (`SolicitudBuilder`): arma y valida la solicitud paso a paso.
   - **Strategy** (`MotorScoringService`): cada regla de scoring es una clase que implementa
     `IEstrategiaEvaluacion`. Las estrategias se registran en `creditos.module.ts`, así que para
     añadir una regla nueva basta con crear la clase y agregarla a esa lista.
3. **Base de datos**: las tablas `clientes` y `creditos` se crean automáticamente a partir de los
   entities (`synchronize`) en el archivo `microscore.sqlite`.

## Estructura del proyecto

```
src/
├── main.ts                      # Punto de entrada: ValidationPipe, prefijo /v1 y panel web
├── app.module.ts                # Módulo raíz: TypeORM (SQLite), ClientesModule y CreditosModule
├── health/
│   └── health.controller.ts     # GET /v1/health (lo usa el HEALTHCHECK de Docker)
├── clientes/
│   ├── clientes.module.ts
│   ├── clientes.controller.ts   # CRUD de clientes (/v1/clientes)
│   ├── clientes.service.ts      # Lógica de clientes persistida con TypeORM (email único)
│   ├── dto/cliente.dto.ts       # Validaciones: nombre, email, edad ≥ 18
│   └── entities/cliente.entity.ts
└── creditos/
    ├── creditos.module.ts       # Registra las estrategias de scoring
    ├── creditos.controller.ts   # Solicitud y evaluación (/v1/creditos)
    ├── creditos.service.ts      # Orquesta el Builder y el motor de scoring
    ├── motor-scoring.service.ts # Suma los puntos de cada estrategia y decide (≥ 60 aprueba)
    ├── builders/
    │   └── solicitud.builder.ts # Patrón Builder: construye y valida la solicitud
    ├── strategies/              # Patrón Strategy: una clase por regla de evaluación
    │   ├── estrategia-evaluacion.interface.ts  # evaluar(solicitud): number
    │   ├── estrategia-ingresos.ts   # Ingresos ≥ 50% del monto: 50 pts · ≥ 25%: 25 pts
    │   ├── estrategia-proposito.ts  # Negocio/educación/emprendimiento/inversión: 30 pts
    │   └── estrategia-historial.ts  # Crédito previo aprobado: 20 pts
    ├── dto/solicitud.dto.ts     # Validaciones: UUID, monto ≥ 1, máx. 2 decimales
    └── entities/credito.entity.ts   # Índice único: una sola solicitud PENDIENTE por cliente
web/app.ts                       # Lógica del panel web en TypeScript (se compila a public/app.js)
public/                          # HTML y CSS del panel web de pruebas
Dockerfile · docker-compose.yml  # Contenerización
```

## Reglas de scoring

| Estrategia  | Criterio                                                        | Puntos |
|-------------|-----------------------------------------------------------------|--------|
| Ingresos    | ingresos mensuales ≥ 50% del monto / ≥ 25% del monto            | 50 / 25 |
| Propósito   | negocio, educación, emprendimiento o inversión                  | 30     |
| Historial   | el cliente tiene algún crédito previo aprobado en MicroScore     | 20     |

Se aprueba con **60 puntos o más**. Ningún criterio aprueba un crédito por sí solo.

## Endpoints (prefijo `/v1`)

| Método | Ruta                      | Descripción                                   |
|--------|---------------------------|-----------------------------------------------|
| POST   | `/clientes`               | Crear cliente                                 |
| GET    | `/clientes`               | Listar clientes                               |
| GET    | `/clientes/:id`           | Ver cliente con sus créditos                  |
| PUT    | `/clientes/:id`           | Actualizar cliente                            |
| DELETE | `/clientes/:id`           | Eliminar cliente (solo si no tiene créditos)  |
| POST   | `/creditos/solicitar`     | Crear solicitud (queda `PENDIENTE`; 409 si el cliente ya tiene una pendiente) |
| GET    | `/creditos`               | Listar solicitudes                            |
| GET    | `/creditos/:id`           | Ver solicitud                                 |
| POST   | `/creditos/:id/evaluar`   | Evaluar solicitud → `APROBADO` / `RECHAZADO`  |
| GET    | `/health`                 | Estado de la API y de la base de datos        |

Ejemplo:

```bash
# 1. Crear cliente
curl -X POST localhost:3000/v1/clientes -H 'Content-Type: application/json' \
  -d '{"nombre":"Ana","email":"ana@correo.com","edad":30}'

# 2. Solicitar crédito con el id_cliente devuelto
curl -X POST localhost:3000/v1/creditos/solicitar -H 'Content-Type: application/json' \
  -d '{"idCliente":"<id_cliente>","monto":1000,"proposito":"negocio","ingresos":600}'

# 3. Evaluarlo con el id_solicitud devuelto
curl -X POST localhost:3000/v1/creditos/<id_solicitud>/evaluar
```

## Instalación y Uso

### Con Node.js (requiere Node 20 o superior)

```bash
npm install
npm run start:dev     # desarrollo con recarga: http://localhost:3000/v1
npm test              # tests unitarios (motor de scoring, builder y servicio de créditos)
npm run lint          # revisa el código con oxlint (src/, web/ y test/)
npm run format        # formatea el código con Prettier

# Producción
npm run build
npm run start:prod
```

### Con Docker

```bash
docker compose up -d --build   # o: npm run docker:up
docker compose logs -f api     # o: npm run docker:logs
docker compose down            # o: npm run docker:down (los datos se conservan)
docker compose down -v         # además borra el volumen con la base de datos
```

La API queda en **http://localhost:3000/v1** y el panel en **http://localhost:3000/**. La base SQLite se
guarda en el volumen `microscore-data`, así que los datos sobreviven a reinicios del contenedor. La imagen
es multi-etapa, corre con un usuario sin privilegios y tiene `HEALTHCHECK` contra `/v1/health`
(`docker ps` muestra `healthy`). Para usar otro puerto en el host: `PORT=8080 docker compose up -d`.

### Panel web de pruebas

Con el servidor encendido, abre **http://localhost:3000/**. El panel (`public/`) permite crear, editar y
eliminar clientes, solicitar y evaluar créditos, y muestra cada petición a la API con su código HTTP,
tiempo y respuesta JSON. Lo sirve el propio NestJS, así que no necesita instalación ni CORS. Su lógica está
en `web/app.ts` y se compila automáticamente a `public/app.js` con `npm run build`, `npm start` o
`npm run start:dev` (también a mano con `npm run build:web`).

### Variables de entorno

Se leen con `@nestjs/config` desde un archivo `.env` en la raíz (opcional: sin él se usan los valores
por defecto). Para crearlo: `cp .env.example .env`. Sus nombres están tipados en `src/env.model.ts`.

| Variable         | Por defecto          | Descripción                                             |
|------------------|----------------------|---------------------------------------------------------|
| `PORT`           | `3000`               | Puerto HTTP                                             |
| `DB_PATH`        | `microscore.sqlite`  | Archivo de la base de datos SQLite                      |
| `DB_SYNCHRONIZE` | `true`               | Crea/actualiza las tablas a partir de los entities      |
| `CORS_ORIGIN`    | `*`                  | Orígenes permitidos por CORS, separados por comas       |

## Flujo de trabajo con Git

- `develop`: rama por defecto e integración. Cada cambio entra por Pull Request.
- `main`: versión estable; recibe `develop` al cerrar una versión.
- `feature/*`, `fix/*`, `docs/*`, `chore/*`: una rama por cambio, creada desde `develop`.

Los commits siguen [Conventional Commits](https://www.conventionalcommits.org/es/) (`feat:`, `fix:`, `docs:`…).
Detalles en [CONTRIBUTING.md](CONTRIBUTING.md).

Cada push y PR a `develop` ejecuta el workflow de CI (`.github/workflows/ci.yml`): lint, formato, build,
pruebas unitarias y construcción de la imagen Docker con una prueba de `/v1/health`.
