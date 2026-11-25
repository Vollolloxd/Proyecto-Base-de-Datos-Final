// Formatos de presentacion (Chile)
const pesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
const numeros = new Intl.NumberFormat('es-CL');

export const dinero = (v) => (v === null || v === undefined || v === '' ? '' : pesos.format(v));
export const numero = (v) => (v === null || v === undefined || v === '' ? '' : numeros.format(v));
export const fecha = (v) => (v ? new Date(v).toLocaleDateString('es-CL') : '');
export const fechaHora = (v) => (v ? new Date(v).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : '');

export const nombrePropio = (texto) =>
    (texto || '').toLowerCase().replace(/(^|[\s(-])(\S)/g, (m, sep, letra) => sep + letra.toUpperCase());

export const normalizar = (texto) =>
    String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function nombreCliente(c) {
    if (!c) return '';
    if (c.TIPO_CLIENTE === 'EMPRESA') return c.RAZON_SOCIAL;
    return [c.NOMBRE, c.APELLIDO1, c.APELLIDO2].filter(Boolean).join(' ');
}

export const mesActual = () => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
};

export const esPorKilo = (unidad) => String(unidad || '').toUpperCase() === 'KG';
export const unidadCorta = (unidad, cantidad = 1) => {
    if (esPorKilo(unidad)) return 'kg';
    return Number(cantidad) === 1 ? 'botella' : 'botellas';
};
export const cantidadConUnidad = (cantidad, unidad) => `${numero(cantidad)} ${unidadCorta(unidad, cantidad)}`;
