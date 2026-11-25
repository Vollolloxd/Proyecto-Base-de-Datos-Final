// Controlador del resumen del panel: ventas del mes, solicitudes pendientes, stock bajo y pedidos del cliente
import { RUTA_MIS_PEDIDOS } from '../modelos/pedidosModelo.js';
import { RUTA_PRODUCTOS, RUTA_SOLICITUDES } from '../modelos/mantenedoresModelo.js';
import { RUTA_ALERTAS_PENDIENTES } from '../modelos/monitoreoModelo.js';
import { rutaListar } from '../modelos/ventasModelo.js';
import { mesActual } from '../utilidades/formato.js';
import { useDatos } from './useDatos.js';
import { useSesion } from './SesionContexto.jsx';

const NOMBRE_MES = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' });

export function useInicio() {
    const { usuario, tiene } = useSesion();
    const esPersonal = !tiene('CATALOGO');
    const veStock = tiene('INVENTARIO') || tiene('PRODUCTOS');
    const { datos: ventas } = useDatos(rutaListar('CONFIRMADA'), { activo: tiene('VENTAS') });
    const { datos: solicitudes } = useDatos(RUTA_SOLICITUDES, { activo: tiene('SOLICITUDES') });
    const { datos: alertas } = useDatos(RUTA_ALERTAS_PENDIENTES,
        { activo: ['MONITOREO', 'INVENTARIO', 'REPORTES', 'VENTAS'].some(tiene) });
    const { datos: productos } = useDatos(RUTA_PRODUCTOS, { activo: veStock });
    const { datos: pedidos } = useDatos(RUTA_MIS_PEDIDOS, { activo: tiene('MIS_SOLICITUDES') });

    const mes = mesActual();
    const nombreMes = NOMBRE_MES.format(new Date(`${mes}-15T12:00:00`));
    const delMes = ventas.filter((v) => (v.FECHA_CONFIRMACION || '').startsWith(mes));
    const pendientes = solicitudes.filter((s) => s.ESTADO === 'PENDIENTE')
        .sort((a, b) => String(b.FECHA_CREACION).localeCompare(String(a.FECHA_CREACION)));
    const bajoMinimo = productos.filter((p) => Number(p.ACTIVO) === 1 && p.STOCK_ACTUAL < p.STOCK_MINIMO)
        .sort((a, b) => (a.STOCK_ACTUAL - a.STOCK_MINIMO) - (b.STOCK_ACTUAL - b.STOCK_MINIMO));

    return {
        usuario, tiene, esPersonal, veStock, alertas, pedidos, nombreMes,
        ventasDelMes: delMes, montoDelMes: delMes.reduce((s, v) => s + v.TOTAL, 0), pendientes, bajoMinimo
    };
}
