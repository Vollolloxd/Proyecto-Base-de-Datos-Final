// Etiqueta de estado: texto y color semantico discreto (no depende solo del color)
const TIPOS = {
    verde: ['CONFIRMADA', 'ACEPTADA', 'APLICADO', 'OK', 'DISPONIBLE', 'ACTIVO', 'SI', 'LOGIN_OK', 'STOCK_REPUESTO'],
    gris: ['BORRADOR', 'INACTIVO', 'INSERT', 'UPDATE'],
    amarillo: ['PENDIENTE', 'CRITICO'],
    rojo: ['ANULADA', 'ANULADO', 'RECHAZADA', 'CANCELADA', 'BAJO MINIMO', 'SIN STOCK', 'AGOTADO',
        'NO', 'LOGIN_FALLIDO', 'ALERTA_STOCK', 'DELETE'],
    azul: ['PRESENCIAL', 'DIGITAL', 'ADMINISTRADOR', 'VENDEDOR', 'CLIENTE', 'MAS VENDIDO', 'MENOS VENDIDO']
};

const COLORES = {
    verde: 'bg-emerald-50 text-exito',
    gris: 'bg-stone-100 text-suave',
    amarillo: 'bg-amber-50 text-aviso',
    rojo: 'bg-red-50 text-peligro',
    azul: 'bg-blue-50 text-info'
};
const PUNTOS = { verde: 'bg-exito', gris: 'bg-control', amarillo: 'bg-aviso', rojo: 'bg-peligro', azul: 'bg-info' };

const TEXTOS = {
    BORRADOR: 'Borrador', PENDIENTE: 'Pendiente', ACEPTADA: 'Aceptada', RECHAZADA: 'Rechazada',
    CONFIRMADA: 'Confirmada', ANULADA: 'Anulada', APLICADO: 'Aplicado', ANULADO: 'Anulado',
    'BAJO MINIMO': 'Bajo mínimo', 'SIN STOCK': 'Sin stock', CRITICO: 'Crítico', OK: 'OK',
    DISPONIBLE: 'Disponible', AGOTADO: 'Agotado', ACTIVO: 'Activo', INACTIVO: 'Inactivo',
    PRESENCIAL: 'Presencial', DIGITAL: 'Digital', 'MAS VENDIDO': 'Más vendido', 'MENOS VENDIDO': 'Menos vendido',
    ADMINISTRADOR: 'Administrador', VENDEDOR: 'Vendedor', CLIENTE: 'Cliente',
    LOGIN_OK: 'Login OK', LOGIN_FALLIDO: 'Login fallido', ALERTA_STOCK: 'Alerta de stock',
    STOCK_REPUESTO: 'Stock repuesto', CANCELADA: 'Cancelada'
};

export default function Insignia({ valor, texto }) {
    if (valor === null || valor === undefined || valor === '') return null;
    const clave = String(valor).toUpperCase();
    const tipo = Object.keys(TIPOS).find((t) => TIPOS[t].includes(clave)) || 'gris';
    return (
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded px-2 py-0.5 align-middle text-xs font-medium ${COLORES[tipo]}`}>
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${PUNTOS[tipo]}`} />
            {texto || TEXTOS[clave] || valor}
        </span>
    );
}

export function InsigniaActivo({ valor }) {
    return <Insignia valor={Number(valor) === 1 ? 'ACTIVO' : 'INACTIVO'} />;
}
