# MicroScore API (En Desarrollo)

Sistema de evaluación de microcréditos para emprendedores sin historial bancario. Actualmente el proyecto se encuentra en una **fase preliminar (avances)**.

## Arquitectura y Tecnologías

El proyecto ha sido inicializado utilizando **NestJS**, adoptando una arquitectura modular por características (Features).

Módulos principales integrados en el avance:
1. **ClientesModule (`src/clientes`)**: Estructura básica para la gestión de clientes. Los endpoints actualmente devuelven datos simulados de desarrollo.
2. **CreditosModule (`src/creditos`)**: Contiene la lógica inicial para la solicitud de créditos. Implementa los cimientos de los siguientes patrones de diseño:
   - **Builder**: Estructura para la creación paso a paso de la solicitud (`SolicitudBuilder`).
   - **Strategy**: Estructura inicial para el motor de evaluación (`MotorScoringService`), con reglas de validación en memoria (mock).
3. **Database**: Configuración inicial preparada con SQLite y TypeORM, lista para integrarse con los modelos en futuras fases.

## Instalación y Uso

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar el proyecto en modo desarrollo:
   ```bash
   npm run start:dev
   ```
   *El servidor iniciará en `http://localhost:3000/v1`.*
