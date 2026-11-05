# Guia de contribucion

## Ramas

- `main`: version estable. Solo recibe merges desde `develop` al cerrar una version.
- `develop`: rama por defecto e integracion. No se commitea directo sobre ella.
- Trabajo nuevo: crear una rama desde `develop` actualizado (`git pull` primero):
  - `feature/<nombre>` para funcionalidades.
  - `fix/<nombre>` para correcciones.
  - `docs/<nombre>` o `chore/<nombre>` para documentacion y configuracion.

## Commits

Convencion `tipo: descripcion corta` en espanol y en minusculas:

| Tipo       | Uso                                         |
|------------|---------------------------------------------|
| `feat`     | Nueva funcionalidad                         |
| `fix`      | Correccion de un error                      |
| `test`     | Pruebas nuevas o ajustes a pruebas          |
| `docs`     | Documentacion                               |
| `refactor` | Cambio interno sin alterar el comportamiento |
| `chore`    | Configuracion, dependencias, CI             |

Ejemplo: `feat: filtrar creditos por estado`.

Un commit por cambio logico: la funcionalidad, sus pruebas y su documentacion van en commits separados.

## Pull Requests

- Base siempre `develop`.
- Usar la plantilla de `.github/pull_request_template.md`.
- Antes de abrirlo: `npm run lint`, `npm run build` y `npm test` deben pasar.
