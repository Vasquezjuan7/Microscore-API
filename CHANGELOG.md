# Changelog

Cambios notables del proyecto. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [2.0.0] - 2026-11-05

### Agregado
- `PATCH /clientes/:id` para actualizar solo los campos enviados.
- `GET /clientes/:id/creditos` con el historial de solicitudes del cliente.
- Filtro `?estado=` en `GET /creditos` y orden de más reciente a más antigua.
- Desglose del puntaje por criterio al evaluar, visible también en el panel web.
- Documentación Swagger en `/docs` y referencia escrita en `docs/api.md`.
- Datos de ejemplo con `npm run seed`.
- Configuración con `@nestjs/config` (`.env`) y CORS configurable con `CORS_ORIGIN`.
- Filtro global de errores de base de datos (409) e interceptor de log de peticiones.
- Pruebas unitarias de clientes, DTOs, filtros, interceptores y semilla; pruebas e2e con SQLite en memoria.
- Lint con oxlint, workflow de CI, plantilla de PR y guía de contribución.

### Cambiado
- Mensajes de validación en español y límites en nombre, email y edad.
- Puntajes y umbral del scoring centralizados en `src/common/constantes.ts`.

### Corregido
- Las fechas de creación guardan milisegundos, para ordenar bien registros creados en el mismo segundo.
- Campos del formulario de clientes que se desbordaban en el panel web.

## [1.2.0] - 2026-11-05

### Cambiado
- Panel web migrado a TypeScript (`web/app.ts`).

## [1.1.0] - 2026-11-05

### Agregado
- Docker (imagen multi-etapa, `docker-compose`, volumen para SQLite) y `GET /health`.

### Corregido
- Una sola solicitud pendiente por cliente incluso con peticiones simultáneas.
