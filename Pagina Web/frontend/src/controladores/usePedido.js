// Controlador del pedido del cliente: cantidades, pagos por producto y envío.
import { useRef, useState } from 'react';
import * as pedidosModelo from '../modelos/pedidosModelo.js';
import { useDatos } from './useDatos.js';
import { useMensajes } from './MensajesContexto.jsx';

export function usePedido(pedido, alCambiar) {
    const { avisar } = useMensajes();
    const id = pedido.ID_SOLICITUD;
    const { datos: lineas, recargar } = useDatos(pedidosModelo.rutaProductos(id));
    const editable = pedido.ESTADO === 'BORRADOR';
    const necesitaMetodo = pedido.ESTADO === 'PENDIENTE' ||
        (pedido.ESTADO === 'ACEPTADA' && pedido.ESTADO_VENTA === 'BORRADOR');
    const { datos: metodos, cargando: cargandoMetodos, error: errorMetodos } =
        useDatos(pedidosModelo.RUTA_METODOS_PAGO_CLIENTE, { activo: editable || necesitaMetodo });
    const [selecciones, setSelecciones] = useState({});
    const [cantidades, setCantidades] = useState({});
    const [ocupado, setOcupado] = useState(false);
    const operacion = useRef(false);

    const cantidadDe = (linea) => cantidades[linea.ID_PRODUCTO] ?? String(linea.CANTIDAD);
    const cantidadValida = (linea) => Number.isFinite(Number(cantidadDe(linea))) && Number(cantidadDe(linea)) > 0;
    const subtotalDe = (linea) => editable && cantidadValida(linea)
        ? Number(cantidadDe(linea)) * Number(linea.PRECIO_UNITARIO)
        : Number(linea.SUBTOTAL);
    const total = lineas.reduce((suma, linea) => suma + subtotalDe(linea), 0);

    const metodoDe = (idProducto = 'pedido') =>
        selecciones[idProducto] ?? (editable ? '' : String(pedido.ID_METODO_PAGO ?? ''));
    const metodoValido = (idProducto) =>
        metodos.some((m) => String(m.ID_METODO_PAGO) === metodoDe(idProducto));
    const setMetodo = (idProducto, valor) => setSelecciones((previo) => ({ ...previo, [idProducto]: valor }));

    async function llamar(fn, mensaje) {
        if (operacion.current) return;
        operacion.current = true;
        setOcupado(true);
        try {
            await fn();
            avisar(mensaje);
        } catch (err) {
            avisar(err.message, 'error');
        } finally {
            try {
                await Promise.all([recargar(), alCambiar()]);
            } finally {
                operacion.current = false;
                setOcupado(false);
            }
        }
    }

    function guardarCantidad(linea) {
        if (!cantidadValida(linea)) return;
        return llamar(async () => {
            await pedidosModelo.cambiarCantidad(id, linea.ID_PRODUCTO, Number(cantidadDe(linea)));
            setCantidades(({ [linea.ID_PRODUCTO]: guardada, ...resto }) => resto);
        }, 'Cantidad actualizada');
    }

    function enviarProducto(linea) {
        if (!cantidadValida(linea) || !metodoValido(linea.ID_PRODUCTO)) return;
        return llamar(() => pedidosModelo.enviar(id, Number(metodoDe(linea.ID_PRODUCTO)), {
            ID_PRODUCTO: linea.ID_PRODUCTO,
            CANTIDAD: Number(cantidadDe(linea))
        }), 'Producto enviado a la viña');
    }

    function guardarMetodo(e) {
        e.preventDefault();
        if (!metodoValido()) return;
        return llamar(() => pedidosModelo.enviar(id, Number(metodoDe())), 'Método de pago guardado');
    }

    return {
        lineas, editable, total, necesitaMetodo, metodos, cargandoMetodos, errorMetodos, ocupado,
        cantidadDe, cantidadValida, subtotalDe, metodoDe, metodoValido, setMetodo,
        cambiarCantidad: (linea, valor) => setCantidades((previo) => ({ ...previo, [linea.ID_PRODUCTO]: valor })),
        guardarCantidad, enviarProducto, guardarMetodo,
        quitar: (linea) => llamar(() => pedidosModelo.quitarProducto(id, linea.ID_PRODUCTO), 'Producto quitado'),
        anular: () => window.confirm('¿Anular este pedido?') && llamar(() => pedidosModelo.anular(id), 'Pedido anulado')
    };
}
