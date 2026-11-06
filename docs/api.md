# Referencia de la API

Base URL: `http://localhost:3000/v1` (o el valor de `PORT`). Todas las rutas llevan el prefijo `/v1`, excepto el
panel web (`/`) y la documentación Swagger (`/docs`). Los cuerpos son JSON (`Content-Type: application/json`).

## Convenciones

- **Validación**: `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`. Un campo que no
  esté declarado en el DTO responde 400.
- **IDs**: los parámetros `:id` deben ser UUID; si no lo son, responde 400 (`ParseUUIDPipe`).
- **Códigos de estado**: `POST` de creación responde 201, `POST /creditos/:id/evaluar` responde 200,
  `DELETE` responde 204 sin cuerpo y el resto 200.
- **Formato de error** (estándar de NestJS):

  ```json
  { "message": "Cliente 11111111-1111-4111-8111-111111111111 no encontrado", "error": "Not Found", "statusCode": 404 }
  ```

  En errores de validación `message` es un arreglo con los mensajes en español:

  ```json
  { "message": ["El email no es válido"], "error": "Bad Request", "statusCode": 400 }
  ```

- **Conflictos (409)**: email repetido, solicitud pendiente duplicada, solicitud ya evaluada o cliente con créditos
  al intentar eliminarlo.
- **Autenticación**: ningún endpoint la exige todavía.

| Grupo    | Método | Ruta                        | Descripción                                   |
|----------|--------|-----------------------------|-----------------------------------------------|
| Clientes | POST   | `/clientes`                 | Crea un cliente                               |
| Clientes | GET    | `/clientes`                 | Lista los clientes                            |
| Clientes | GET    | `/clientes/{id}`            | Consulta un cliente con sus créditos          |
| Clientes | PUT    | `/clientes/{id}`            | Reemplaza los datos de un cliente             |
| Clientes | PATCH  | `/clientes/{id}`            | Actualiza solo los campos enviados            |
| Clientes | DELETE | `/clientes/{id}`            | Elimina un cliente sin créditos               |
| Clientes | GET    | `/clientes/{id}/creditos`   | Historial de solicitudes del cliente          |
| Créditos | POST   | `/creditos/solicitar`       | Crea una solicitud PENDIENTE                  |
| Créditos | GET    | `/creditos`                 | Lista solicitudes (filtro `?estado=`)         |
| Créditos | GET    | `/creditos/{id}`            | Consulta una solicitud                        |
| Créditos | POST   | `/creditos/{id}/evaluar`    | Evalúa la solicitud con el motor de scoring   |
| Health   | GET    | `/health`                   | Estado de la API y de la base de datos        |

## Clientes

### POST /clientes

| Campo    | Tipo   | Reglas                                        |
|----------|--------|-----------------------------------------------|
| `nombre` | string | Obligatorio, máximo 100 caracteres (se recorta) |
| `email`  | string | Email válido, único, máximo 150 (se guarda en minúsculas) |
| `edad`   | entero | Entre 18 y 120                                |

```bash
curl -X POST localhost:3000/v1/clientes -H 'Content-Type: application/json' \
  -d '{"nombre":"Ana Gómez","email":"ana@correo.com","edad":30}'
```

Respuesta `201`:

```json
{
  "nombre": "Ana Gómez",
  "email": "ana@correo.com",
  "edad": 30,
  "id_cliente": "21e085a0-faac-4bdb-914b-76cc5096299c",
  "fecha_registro": "2026-11-05T15:48:43.512Z"
}
```

Errores: `400` datos inválidos, `409` email ya registrado.

### GET /clientes/{id}

Devuelve el cliente con el arreglo `creditos`. `404` si no existe.

### PUT /clientes/{id} y PATCH /clientes/{id}

`PUT` exige los tres campos; `PATCH` acepta cualquier subconjunto (por ejemplo `{"edad":31}`). Ambos validan
los campos enviados y responden `409` si el nuevo email ya lo usa otro cliente.

### DELETE /clientes/{id}

Responde `204`. Si el cliente tiene créditos registrados responde `409` y no se elimina.

### GET /clientes/{id}/creditos

Solicitudes del cliente ordenadas de la más reciente a la más antigua. `404` si el cliente no existe.

## Créditos

### POST /creditos/solicitar

| Campo       | Tipo   | Reglas                                   |
|-------------|--------|------------------------------------------|
| `idCliente` | UUID   | Cliente existente                         |
| `monto`     | número | Mínimo 1, máximo 2 decimales             |
| `proposito` | string | Obligatorio                              |
| `ingresos`  | número | Ingresos mensuales, mínimo 0, máximo 2 decimales |

```bash
curl -X POST localhost:3000/v1/creditos/solicitar -H 'Content-Type: application/json' \
  -d '{"idCliente":"21e085a0-faac-4bdb-914b-76cc5096299c","monto":1000,"proposito":"negocio","ingresos":600}'
```

Respuesta `201` (queda `PENDIENTE`, sin puntaje):

```json
{
  "estado": "PENDIENTE",
  "id_cliente": "21e085a0-faac-4bdb-914b-76cc5096299c",
  "monto": 1000,
  "proposito": "negocio",
  "ingresos": 600,
  "puntaje": null,
  "desglose": null,
  "id_solicitud": "ee847b75-a522-4a1e-9735-fddf9274a55a",
  "fecha_solicitud": "2026-11-05T15:48:43.731Z"
}
```

Errores: `400` datos inválidos, `404` cliente inexistente, `409` el cliente ya tiene una solicitud pendiente.

### POST /creditos/{id}/evaluar

Aplica las reglas de scoring y guarda el resultado. Respuesta `200`:

```json
{
  "id_solicitud": "ee847b75-a522-4a1e-9735-fddf9274a55a",
  "estado": "APROBADO",
  "puntaje": 80,
  "desglose": { "ingresos": 50, "proposito": 30, "historial": 0 },
  "cliente": { "id_cliente": "21e085a0-faac-4bdb-914b-76cc5096299c", "nombre": "Ana Gómez", "creditos": ["…"] }
}
```

Errores: `404` solicitud inexistente, `409` la solicitud ya fue evaluada.

### GET /creditos

Lista las solicitudes de la más reciente a la más antigua. Filtro opcional `?estado=PENDIENTE|APROBADO|RECHAZADO`
(otro valor responde `400`).

## Reglas de scoring

| Criterio    | Condición                                              | Puntos  |
|-------------|--------------------------------------------------------|---------|
| `ingresos`  | ingresos mensuales ≥ 50% del monto / ≥ 25% del monto   | 50 / 25 |
| `proposito` | negocio, educación, emprendimiento o inversión (sin importar tildes ni mayúsculas) | 30 |
| `historial` | el cliente tiene algún crédito previo aprobado          | 20      |

Se aprueba con 60 puntos o más. Los valores están en `src/common/constantes.ts`.

## Health

`GET /health` responde `{"status":"ok","uptime":42}` si la base de datos responde. Lo usa el `HEALTHCHECK` de Docker.
