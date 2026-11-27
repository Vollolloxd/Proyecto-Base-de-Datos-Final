// Controlador del detalle de venta: datos, productos, agregar, confirmar con pago (G4) y anular (G5)
import { useState } from 'react';
import { RUTA_METODOS_PAGO, RUTA_PRODUCTOS } from '../modelos/mantenedoresModelo.js';
import * as ventasModelo from '../modelos/ventasModelo.js';
import { useDatos } from './useDatos.js';
import { useMensajes } from './MensajesContexto.jsx';

export function useVentaDetalle(id) {
    const { avisar } = useMensajes();
    const { datos: ventas, cargando, recargar: recargarVentas } = useDatos(ventasModelo.RUTA_TODAS);
    const { datos: lineas, recargar: recargarLineas } = useDatos(ventasModelo.rutaDetalle(id));
    const { datos: productos, recargar: recargarProductos } = useDatos(RUTA_PRODUCTOS);
    const { datos: metodos } = useDatos(RUTA_METODOS_PAGO);
    const [agregar, setAgregar] = useState({ CANTIDAD: 1 });
    const [pago, setPago] = useState({});
    const [motivo, setMotivo] = useState('');
    const [confirmando, setConfirmando] = useState(false);
    const [confirmacion, setConfirmacion] = useState(null);

    const venta = ventas.find((v) => String(v.ID_VENTA) === String(id));
    const total = lineas.reduce((s, l) => s + l.SUBTOTAL, 0);
    const activos = productos.filter((p) => Number(p.ACTIVO) === 1);
    const recargarTodo = () => { recargarVentas(); recargarLineas(); recargarProductos(); };

    async function ejecutar(operacion, mensaje) {
        try {
            await operacion();
            avisar(mensaje);
            recargarTodo();
            return true;
        } catch (err) {
            avisar(err.message, 'error');
            return false;
        }
    }

    async function agregarProducto(e) {
        e.preventDefault();
        const { ID_PRODUCTO, CANTIDAD } = agregar;
        if (!activos.some((p) => String(p.ID_PRODUCTO) === String(ID_PRODUCTO))) return;
        if (await ejecutar(() => ventasModelo.agregarProducto(id, { ID_PRODUCTO, CANTIDAD }), 'Producto agregado')) {
            setAgregar({ CANTIDAD: 1, BUSCAR_PRODUCTO: agregar.BUSCAR_PRODUCTO });
        }
    }

    async function confirmar(e) {
        e.preventDefault();
        if (confirmando) return;
        setConfirmando(true);
        try {
            await ejecutar(async () => {
                const resultado = await ventasModelo.confirmar(id, { ID_METODO_PAGO: pago.ID_METODO_PAGO });
                setConfirmacion({ id, referencia: resultado?.REFERENCIA });
            }, 'Venta confirmada: stock descontado y pago registrado');
        } finally {
            setConfirmando(false);
        }
    }

    function anular(e) {
        e.preventDefault();
        if (window.confirm('¿Anular la venta? Se devolverá el stock de sus productos.')) {
            ejecutar(() => ventasModelo.anular(id, { MOTIVO: motivo }), 'Venta anulada: stock devuelto');
        }
    }

    return {
        venta, cargando, lineas, total, activos, metodos, confirmando,
        referencia: confirmacion?.id === id ? confirmacion.referencia : undefined,
        agregar, setAgregar, pago, setPago, motivo, setMotivo, agregarProducto, confirmar, anular
    };
}
