import { Logger } from '@nestjs/common';
import { ClientesService } from '../clientes/clientes.service';
import { CreditosService } from '../creditos/creditos.service';

interface ClienteSemilla {
  nombre: string;
  email: string;
  edad: number;
  // Solicitudes del cliente; con evaluar=true se pasan por el motor de scoring
  solicitudes: { monto: number; proposito: string; ingresos: number; evaluar: boolean }[];
}

// Casos pensados para ver cada regla del scoring en acción
export const CLIENTES_SEMILLA: ClienteSemilla[] = [
  {
    nombre: 'Ana Gómez',
    email: 'ana@microscore.dev',
    edad: 34,
    // Buenos ingresos y propósito productivo: aprobado (80). La segunda suma historial.
    solicitudes: [
      { monto: 1000, proposito: 'negocio', ingresos: 600, evaluar: true },
      { monto: 2000, proposito: 'inversion', ingresos: 600, evaluar: true },
    ],
  },
  {
    nombre: 'Luis Pérez',
    email: 'luis@microscore.dev',
    edad: 27,
    // Solo cumple ingresos: rechazado (50)
    solicitudes: [{ monto: 800, proposito: 'vacaciones', ingresos: 500, evaluar: true }],
  },
  {
    nombre: 'María Torres',
    email: 'maria@microscore.dev',
    edad: 45,
    // Queda pendiente para evaluarla desde el panel
    solicitudes: [{ monto: 1500, proposito: 'educacion', ingresos: 400, evaluar: false }],
  },
];

// Carga los datos de ejemplo. Es idempotente: si el cliente ya existe (por email) no lo repite.
export async function cargarSemilla(clientes: ClientesService, creditos: CreditosService): Promise<number> {
  const logger = new Logger('Semilla');
  const existentes = new Set((await clientes.findAll()).map((c) => c.email));
  let creados = 0;

  for (const datos of CLIENTES_SEMILLA) {
    if (existentes.has(datos.email)) {
      logger.log(`${datos.email} ya existe, se omite`);
      continue;
    }
    const cliente = await clientes.create({ nombre: datos.nombre, email: datos.email, edad: datos.edad });
    for (const { evaluar, ...datosSolicitud } of datos.solicitudes) {
      const solicitud = await creditos.crearSolicitud({ idCliente: cliente.id_cliente, ...datosSolicitud });
      if (evaluar) await creditos.evaluarCredito(solicitud.id_solicitud);
    }
    logger.log(`${datos.email} creado con ${datos.solicitudes.length} solicitud(es)`);
    creados++;
  }
  return creados;
}
