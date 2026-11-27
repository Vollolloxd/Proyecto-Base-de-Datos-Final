// Modelo de los pedidos del cliente web (sus solicitudes de compra y productos)
import { api } from './http.js';

export const RUTA_MIS_PEDIDOS = '/cliente/mis-solicitudes';
export const RUTA_METODOS_PAGO_CLIENTE = `${RUTA_MIS_PEDIDOS}/metodos-pago`;
const rutaPedido = (idSolicitud) => `${RUTA_MIS_PEDIDOS}/${idSolicitud}`;
export const rutaProductos = (idSolicitud) => `${rutaPedido(idSolicitud)}/productos`;

export const listar = () => api(RUTA_MIS_PEDIDOS);
export const crear = () => api(RUTA_MIS_PEDIDOS, { metodo: 'POST', cuerpo: {} });
export const anular = (idSolicitud) => api(rutaPedido(idSolicitud), { metodo: 'DELETE' });
export const enviar = (idSolicitud, idMetodoPago, producto) =>
    api(`${rutaPedido(idSolicitud)}/enviar`, {
        metodo: 'POST',
        cuerpo: { ID_METODO_PAGO: idMetodoPago, ...producto }
    });

export const listarProductos = (idSolicitud) => api(rutaProductos(idSolicitud));
export const agregarProducto = (idSolicitud, idProducto, cantidad) =>
    api(rutaProductos(idSolicitud), { metodo: 'POST', cuerpo: { ID_PRODUCTO: idProducto, CANTIDAD: cantidad } });
export const cambiarCantidad = (idSolicitud, idProducto, cantidad) =>
    api(`${rutaProductos(idSolicitud)}/${idProducto}`, { metodo: 'PUT', cuerpo: { CANTIDAD: cantidad } });
export const quitarProducto = (idSolicitud, idProducto) =>
    api(`${rutaProductos(idSolicitud)}/${idProducto}`, { metodo: 'DELETE' });

// Pedido en preparacion (BORRADOR) mas reciente; si no hay, crea uno
export async function pedidoEnPreparacion() {
    const buscar = async () => (await listar())
        .filter((s) => s.ESTADO === 'BORRADOR')
        .sort((a, b) => b.ID_SOLICITUD - a.ID_SOLICITUD)[0];
    let pedido = await buscar();
    if (!pedido) {
        await crear();
        pedido = await buscar();
    }
    return pedido;
}

// Agrega un producto al pedido en preparacion (si ya estaba, suma la cantidad)
export async function agregarAlPedido(idProducto, cantidad) {
    const pedido = await pedidoEnPreparacion();
    const lineas = await listarProductos(pedido.ID_SOLICITUD);
    const existente = lineas.find((l) => l.ID_PRODUCTO === idProducto);
    if (existente) {
        await cambiarCantidad(pedido.ID_SOLICITUD, idProducto, existente.CANTIDAD + cantidad);
    } else {
        await agregarProducto(pedido.ID_SOLICITUD, idProducto, cantidad);
    }
    return pedido;
}
