# MicroScore API (En Desarrollo)

Sistema de evaluación de microcréditos para emprendedores sin historial bancario.

## Arquitectura y Tecnologías

Proyecto en **NestJS** con arquitectura modular por características, **TypeORM** y **SQLite**.

1. **ClientesModule (`src/clientes`)**: CRUD de clientes persistido en base de datos.
2. **CreditosModule (`src/creditos`)**: solicitud y evaluación de créditos. Usa dos patrones de diseño:
   - **Builder** (`SolicitudBuilder`): arma y valida la solicitud paso a paso.
   - **Strategy** (`MotorScoringService`): cada regla de scoring es una clase que implementa
     `IEstrategiaEvaluacion`. Las estrategias se registran en `creditos.module.ts`, así que para
     añadir una regla nueva basta con crear la clase y agregarla a esa lista.
3. **Base de datos**: las tablas `clientes` y `creditos` se crean automáticamente a partir de los
   entities (`synchronize`) en el archivo `microscore.sqlite`.

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
| POST   | `/creditos/solicitar`     | Crear solicitud (queda `PENDIENTE`)           |
| GET    | `/creditos`               | Listar solicitudes                            |
| GET    | `/creditos/:id`           | Ver solicitud                                 |
| POST   | `/creditos/:id/evaluar`   | Evaluar solicitud → `APROBADO` / `RECHAZADO`  |

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

```bash
npm install
npm run start:dev     # http://localhost:3000/v1
npm test              # tests unitarios (motor de scoring y builder)
npm run format        # formatea el código con Prettier
```

Variables de entorno opcionales: `PORT` (por defecto 3000) y `DB_PATH` (por defecto `microscore.sqlite`).
