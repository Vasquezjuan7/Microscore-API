// Panel de pruebas de MicroScore: consume la API en /v1 y registra cada petición.
// Se compila a public/app.js con `npm run build:web` (tsconfig.web.json).

type EstadoCredito = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
type Filtro = EstadoCredito | 'TODOS';
type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Hijo = Node | string | null | undefined;

interface Cliente {
  id_cliente: string;
  nombre: string;
  email: string;
  edad: number;
  fecha_registro: string;
}

interface Credito {
  id_solicitud: string;
  id_cliente: string;
  monto: number;
  proposito: string;
  ingresos: number;
  estado: EstadoCredito;
  puntaje: number | null;
  // Puntos por criterio; null mientras la solicitud está PENDIENTE
  desglose: Record<string, number> | null;
  fecha_solicitud: string;
}

interface EstadoPanel {
  clientes: Cliente[];
  creditos: Credito[];
  filtro: Filtro;
  editandoId: string | null;
}

const API = '/v1';
const UMBRAL = 60;

const estado: EstadoPanel = { clientes: [], creditos: [], filtro: 'TODOS', editandoId: null };
const $ = <T extends HTMLElement = HTMLElement>(sel: string): T => document.querySelector<T>(sel);

const dinero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });
const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

// ---------- Utilidades ----------

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, unknown> = {},
  ...hijos: (Hijo | Hijo[])[]
): HTMLElementTagNameMap[K] {
  const nodo = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') nodo.className = String(v);
    else if (k.startsWith('on')) nodo.addEventListener(k.slice(2), v as EventListener);
    else if (v !== false && v != null) nodo.setAttribute(k, String(v));
  }
  for (const h of hijos.flat()) if (h != null) nodo.append(h);
  return nodo;
}

function toast(mensaje: string, tipo: 'ok' | 'error' = 'ok'): void {
  const t = el('div', { class: `toast ${tipo}` }, mensaje);
  $('#toasts').append(t);
  setTimeout(() => t.remove(), 4200);
}

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

// Los errores de class-validator llegan como lista de mensajes
function mensajeError(cuerpo: { message?: string | string[] } | null, status: number): string {
  const m = cuerpo?.message;
  if (Array.isArray(m)) return m.join(' · ');
  return m || `Error HTTP ${status}`;
}

function textoForm(f: FormData, campo: string): string {
  return String(f.get(campo) ?? '').trim();
}

// ---------- Cliente HTTP con registro ----------

async function api<T = unknown>(metodo: Metodo, ruta: string, cuerpo?: object): Promise<T> {
  const inicio = performance.now();
  let status = 0;
  let datos = null;
  try {
    const res = await fetch(API + ruta, {
      method: metodo,
      headers: cuerpo ? { 'Content-Type': 'application/json' } : undefined,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    status = res.status;
    const texto = await res.text();
    marcarConexion(true);
    try {
      datos = texto ? JSON.parse(texto) : null;
    } catch {
      datos = { message: `Respuesta no válida del servidor (HTTP ${status})` };
    }
  } catch {
    datos = { message: 'No se pudo conectar con la API. ¿Está el servidor encendido?' };
    marcarConexion(false);
  }
  registrar(metodo, ruta, status, Math.round(performance.now() - inicio), cuerpo, datos);
  if (status < 200 || status >= 300) throw new Error(mensajeError(datos, status));
  return datos as T;
}

function registrar(
  metodo: Metodo,
  ruta: string,
  status: number,
  ms: number,
  cuerpo: object | undefined,
  respuesta: unknown,
): void {
  const pre = el('pre');
  if (cuerpo) pre.append(el('span', { class: 'k' }, '// cuerpo enviado'), JSON.stringify(cuerpo, null, 2), '\n');
  pre.append(
    el('span', { class: 'k' }, '// respuesta'),
    respuesta == null ? '(sin contenido)' : JSON.stringify(respuesta, null, 2),
  );
  const item = el(
    'li',
    {},
    el(
      'details',
      {},
      el(
        'summary',
        {},
        el('span', { class: `method ${metodo}` }, metodo),
        el('span', { class: 'path', title: API + ruta }, API + ruta),
        el('span', { class: `code s${String(status)[0]}` }, status ? String(status) : 'ERR'),
        el('span', { class: 'ms' }, `${ms} ms`),
      ),
      pre,
    ),
  );
  $('#log').prepend(item);
}

function marcarConexion(online: boolean): void {
  $('#status').dataset.state = online ? 'online' : 'offline';
  $('#status-text').textContent = online ? 'API en línea' : 'API sin conexión';
}

// ---------- Carga de datos ----------

async function cargar(): Promise<void> {
  try {
    const [clientes, creditos] = await Promise.all([
      api<Cliente[]>('GET', '/clientes'),
      api<Credito[]>('GET', '/creditos'),
    ]);
    estado.clientes = clientes;
    estado.creditos = creditos.sort(
      (a, b) => new Date(b.fecha_solicitud).getTime() - new Date(a.fecha_solicitud).getTime(),
    );
    pintar();
  } catch (e) {
    toast((e as Error).message, 'error');
  }
}

// ---------- Render ----------

function pintar(): void {
  pintarResumen();
  pintarClientes();
  pintarSelectClientes();
  pintarCreditos();
}

function pintarResumen(): void {
  const cuenta = (e: EstadoCredito) => String(estado.creditos.filter((c) => c.estado === e).length);
  $('#stat-clientes').textContent = String(estado.clientes.length);
  $('#stat-solicitudes').textContent = String(estado.creditos.length);
  $('#stat-pendientes').textContent = cuenta('PENDIENTE');
  $('#stat-aprobadas').textContent = cuenta('APROBADO');
  $('#stat-rechazadas').textContent = cuenta('RECHAZADO');
}

function pintarClientes(): void {
  const lista = $('#lista-clientes');
  lista.replaceChildren();
  if (!estado.clientes.length) {
    lista.append(el('li', { class: 'empty' }, 'Aún no hay clientes. Crea el primero arriba.'));
    return;
  }
  for (const c of estado.clientes) {
    const nCreditos = estado.creditos.filter((cr) => cr.id_cliente === c.id_cliente).length;
    lista.append(
      el(
        'li',
        { class: 'item cliente' },
        el('span', { class: 'avatar' }, iniciales(c.nombre)),
        el(
          'div',
          { class: 'grow' },
          el('div', { class: 'item-title' }, c.nombre),
          el(
            'div',
            { class: 'item-sub' },
            `${c.email} · ${c.edad} años · ${nCreditos} crédito${nCreditos === 1 ? '' : 's'}`,
          ),
        ),
        el(
          'div',
          { class: 'item-actions' },
          el('button', { class: 'ghost small', title: 'Editar', onclick: () => editarCliente(c) }, 'Editar'),
          el(
            'button',
            { class: 'ghost small danger', title: 'Eliminar', onclick: () => eliminarCliente(c) },
            'Eliminar',
          ),
        ),
      ),
    );
  }
}

function pintarSelectClientes(): void {
  const select = $<HTMLSelectElement>('#select-cliente');
  const previo = select.value;
  select.replaceChildren(
    el('option', { value: '' }, estado.clientes.length ? 'Selecciona un cliente…' : 'Primero crea un cliente'),
  );
  for (const c of estado.clientes) select.append(el('option', { value: c.id_cliente }, `${c.nombre} — ${c.email}`));
  if (estado.clientes.some((c) => c.id_cliente === previo)) select.value = previo;
}

function pintarCreditos(): void {
  const lista = $('#lista-creditos');
  lista.replaceChildren();
  const visibles = estado.creditos.filter((c) => estado.filtro === 'TODOS' || c.estado === estado.filtro);
  if (!visibles.length) {
    lista.append(
      el(
        'li',
        { class: 'empty' },
        estado.creditos.length ? 'No hay créditos con este filtro.' : 'Aún no hay solicitudes.',
      ),
    );
    return;
  }
  const nombres: Record<string, string> = Object.fromEntries(estado.clientes.map((c) => [c.id_cliente, c.nombre]));

  for (const cr of visibles) {
    const pie =
      cr.estado === 'PENDIENTE'
        ? el(
            'div',
            { class: 'actions' },
            el(
              'button',
              { class: 'primary small', onclick: (e: Event) => evaluar(cr, e.currentTarget as HTMLButtonElement) },
              'Evaluar ahora',
            ),
          )
        : el(
            'div',
            { class: 'score', title: `Se aprueba con ${UMBRAL} puntos o más` },
            el(
              'div',
              { class: 'score-bar' },
              el('div', { class: `score-fill ${cr.estado}`, style: `width:${Math.min(cr.puntaje ?? 0, 100)}%` }),
              el('div', { class: 'score-threshold' }),
            ),
            el('b', {}, `${cr.puntaje ?? 0} / 100`),
          );

    lista.append(
      el(
        'li',
        { class: 'item' },
        el(
          'div',
          { class: 'item-top' },
          el(
            'div',
            {},
            el('div', { class: 'item-title' }, nombres[cr.id_cliente] ?? 'Cliente'),
            el('div', { class: 'item-sub' }, `${cr.proposito} · ${fecha.format(new Date(cr.fecha_solicitud))}`),
          ),
          el('span', { class: `badge ${cr.estado}` }, cr.estado),
        ),
        el(
          'div',
          { class: 'meta' },
          el('div', {}, el('span', {}, 'Monto'), el('b', {}, `$${dinero.format(cr.monto)}`)),
          el('div', {}, el('span', {}, 'Ingresos'), el('b', {}, `$${dinero.format(cr.ingresos)}`)),
          el(
            'div',
            {},
            el('span', {}, 'Ingresos / monto'),
            el('b', {}, `${Math.round((cr.ingresos / cr.monto) * 100)}%`),
          ),
        ),
        pie,
      ),
    );
  }
}

// ---------- Acciones de clientes ----------

const formCliente = $<HTMLFormElement>('#form-cliente');

formCliente.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(formCliente);
  const datos = { nombre: textoForm(f, 'nombre'), email: textoForm(f, 'email'), edad: Number(f.get('edad')) };
  const boton = $<HTMLButtonElement>('#btn-guardar-cliente');
  boton.disabled = true;
  try {
    if (estado.editandoId) {
      await api('PUT', `/clientes/${estado.editandoId}`, datos);
      toast(`Cliente ${datos.nombre} actualizado`);
    } else {
      await api('POST', '/clientes', datos);
      toast(`Cliente ${datos.nombre} creado`);
    }
    salirEdicion();
    await cargar();
  } catch (err) {
    toast((err as Error).message, 'error');
  } finally {
    boton.disabled = false;
  }
});

function campo(form: HTMLFormElement, nombre: string): HTMLInputElement {
  return form.elements.namedItem(nombre) as HTMLInputElement;
}

function editarCliente(c: Cliente): void {
  estado.editandoId = c.id_cliente;
  campo(formCliente, 'nombre').value = c.nombre;
  campo(formCliente, 'email').value = c.email;
  campo(formCliente, 'edad').value = String(c.edad);
  formCliente.classList.add('editing');
  $('#form-cliente-title').textContent = `Editando a ${c.nombre}`;
  $('#btn-guardar-cliente').textContent = 'Guardar cambios';
  $('#btn-cancelar-edicion').hidden = false;
  campo(formCliente, 'nombre').focus();
}

function salirEdicion(): void {
  estado.editandoId = null;
  formCliente.reset();
  formCliente.classList.remove('editing');
  $('#form-cliente-title').textContent = 'Nuevo cliente';
  $('#btn-guardar-cliente').textContent = 'Crear cliente';
  $('#btn-cancelar-edicion').hidden = true;
}

$('#btn-cancelar-edicion').addEventListener('click', salirEdicion);

async function eliminarCliente(c: Cliente): Promise<void> {
  if (!confirm(`¿Eliminar a ${c.nombre}? Esta acción no se puede deshacer.`)) return;
  try {
    await api('DELETE', `/clientes/${c.id_cliente}`);
    toast(`Cliente ${c.nombre} eliminado`);
    if (estado.editandoId === c.id_cliente) salirEdicion();
    await cargar();
  } catch (err) {
    toast((err as Error).message, 'error');
  }
}

// ---------- Acciones de créditos ----------

const formCredito = $<HTMLFormElement>('#form-credito');

formCredito.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(formCredito);
  const datos = {
    idCliente: textoForm(f, 'idCliente'),
    monto: Number(f.get('monto')),
    ingresos: Number(f.get('ingresos')),
    proposito: textoForm(f, 'proposito'),
  };
  try {
    await api('POST', '/creditos/solicitar', datos);
    toast('Solicitud creada: queda PENDIENTE de evaluación');
    campo(formCredito, 'monto').value = '';
    campo(formCredito, 'ingresos').value = '';
    campo(formCredito, 'proposito').value = '';
    actualizarPista();
    await cargar();
  } catch (err) {
    toast((err as Error).message, 'error');
  }
});

async function evaluar(credito: Credito, boton: HTMLButtonElement): Promise<void> {
  boton.disabled = true;
  boton.textContent = 'Evaluando…';
  try {
    const r = await api<Credito>('POST', `/creditos/${credito.id_solicitud}/evaluar`);
    const aprobado = r.estado === 'APROBADO';
    toast(`${aprobado ? '✅ Aprobado' : '❌ Rechazado'} con ${r.puntaje} puntos`, aprobado ? 'ok' : 'error');
    await cargar();
  } catch (err) {
    toast((err as Error).message, 'error');
    boton.disabled = false;
    boton.textContent = 'Evaluar ahora';
  }
}

// Muestra la relación ingresos/monto mientras se escribe (es lo que mira la regla de ingresos)
function actualizarPista(): void {
  const monto = Number(campo(formCredito, 'monto').value);
  const ingresosTexto = campo(formCredito, 'ingresos').value;
  const pista = $('#hint-ratio');
  if (!monto || ingresosTexto === '') {
    pista.textContent = '';
    return;
  }
  const ratio = Math.round((Number(ingresosTexto) / monto) * 100);
  pista.replaceChildren('Los ingresos cubren el ', el('strong', {}, `${ratio}%`), ' del monto solicitado.');
}
campo(formCredito, 'monto').addEventListener('input', actualizarPista);
campo(formCredito, 'ingresos').addEventListener('input', actualizarPista);

// ---------- Filtros y otros ----------

document.querySelectorAll<HTMLElement>('.chip').forEach((chip) =>
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
    estado.filtro = chip.dataset.filtro as Filtro;
    pintarCreditos();
  }),
);

$('#btn-refrescar').addEventListener('click', cargar);
$('#btn-limpiar-log').addEventListener('click', () => $('#log').replaceChildren());

cargar();
