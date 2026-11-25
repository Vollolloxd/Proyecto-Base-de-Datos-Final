// Controlador del pedido del cliente: productos, cambiar cantidad, quitar, anular, elegir como pagar y enviar a la viña
import { useState } from 'react';
import * as pedidosModelo from '../modelos/pedidosModelo.js';
import { separarPago } from '../utilidades/pagoElegido.js';
import { useDatos } from './useDatos.js';
import { useMensajes } from './MensajesContexto.jsx';

export function usePedido(pedido, alCambiar) {
    const { avisar } = useMensajes();
    const id = pedido.ID_SOLICITUD;
    const { datos: lineas, recargar } = useDatos(pedidosModelo.rutaProductos(id));
    const editable = pedido.ESTADO === 'BORRADOR';
    const { datos: metodos } = useDatos(pedidosModelo.RUTA_METODOS_PAGO_CLIENTE, { activo: editable });
    const [metodo, setMetodo] = useState('');
    const pagoElegido = separarPago(pedido.OBSERVACIONES).metodo;
    const total = lineas.reduce((s, l) => s + l.SUBTOTAL, 0);

    async function llamar(fn, mensaje) {
        try {
            await fn();
            avisar(mensaje);
            recargar();
            alCambiar();
        } catch (err) {
            avisar(err.message, 'error');
        }
    }

    return {
        lineas, editable, total, metodos, metodo, setMetodo, pagoElegido,
        cambiarCantidad: (linea, cantidad) => llamar(
            () => pedidosModelo.cambiarCantidad(id, linea.ID_PRODUCTO, cantidad), 'Cantidad actualizada'),
        quitar: (linea) => llamar(() => pedidosModelo.quitarProducto(id, linea.ID_PRODUCTO), 'Producto quitado'),
        anular: () => window.confirm('¿Anular este pedido?') && llamar(() => pedidosModelo.anular(id), 'Pedido anulado'),
        enviar: () => (metodo
            ? llamar(() => pedidosModelo.enviar(id, metodo), 'Pedido enviado a la viña')
            : avisar('Elige cómo vas a pagar antes de enviar el pedido', 'error'))
    };
}
