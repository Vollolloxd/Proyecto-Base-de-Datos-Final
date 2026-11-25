// Servicio del metodo de pago elegido por el cliente web: lo guarda al enviar el pedido y lo impone al confirmar la venta
const metodoPagoModelo = require('../modelos/metodoPagoModelo');
const pedidoModelo = require('../modelos/pedidoModelo');
const solicitudModelo = require('../modelos/solicitudModelo');
const pagoElegido = require('../utilidades/pagoElegido');
const { errorApp } = require('../utilidades/errores');

// Cliente: guarda el metodo en su solicitud y la envia a la vina (G3)
async function enviarConPago(idSolicitud, idMetodoPago, usuario) {
    const metodos = await metodoPagoModelo.listar(true, usuario);
    const metodo = metodos.find((m) => String(m.ID_METODO_PAGO) === String(idMetodoPago));
    if (!metodo) throw errorApp(20320, 'ELIJA UN METODO DE PAGO VALIDO');

    const pedidos = await pedidoModelo.listar(usuario.idCliente, usuario);
    const pedido = pedidos.find((p) => String(p.ID_SOLICITUD) === String(idSolicitud));
    await pedidoModelo.modificar(idSolicitud, usuario.idCliente,
        pagoElegido.componer(metodo.NOMBRE, pedido && pedido.OBSERVACIONES), usuario);
    await solicitudModelo.enviar(idSolicitud, usuario);
}

// Personal: nombre del metodo elegido por el cliente para cada venta generada desde una solicitud
async function elegidosPorVenta(usuario) {
    const solicitudes = await solicitudModelo.listar(usuario);
    const mapa = new Map();
    for (const s of solicitudes) {
        const { metodo } = pagoElegido.extraer(s.OBSERVACIONES);
        if (s.ID_VENTA && metodo) mapa.set(String(s.ID_VENTA), metodo);
    }
    return mapa;
}

// Personal: metodo que debe usarse al confirmar (el del cliente si eligio uno; si no, el del vendedor)
// y la referencia del pago, que se genera sola: <METODO>-<AAAAMMDD>-<N° venta>, por ejemplo TRF-20261125-000298
async function datosDeConfirmacion(idVenta, idMetodoVendedor, usuario) {
    const [elegidos, metodos] = await Promise.all([
        elegidosPorVenta(usuario),
        metodoPagoModelo.listar(false, usuario)
    ]);
    const elegido = elegidos.get(String(idVenta));
    const metodo = (elegido && metodos.find((m) => m.NOMBRE === elegido))
        || metodos.find((m) => String(m.ID_METODO_PAGO) === String(idMetodoVendedor));
    if (!metodo) return { idMetodo: idMetodoVendedor, referencia: null };
    return { idMetodo: metodo.ID_METODO_PAGO, referencia: generarReferencia(metodo.NOMBRE, idVenta) };
}

const PREFIJOS = { EFECTIVO: 'EFE', 'TARJETA DE DEBITO': 'DEB', 'TARJETA DE CREDITO': 'CRE', TRANSFERENCIA: 'TRF' };

function generarReferencia(nombreMetodo, idVenta) {
    const nombre = String(nombreMetodo).toUpperCase();
    const prefijo = PREFIJOS[nombre] || nombre.replace(/[^A-Z]/g, '').slice(0, 3) || 'PAG';
    const hoy = new Date();
    const fecha = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`;
    return `${prefijo}-${fecha}-${String(idVenta).padStart(6, '0')}`;
}

module.exports = { enviarConPago, elegidosPorVenta, datosDeConfirmacion };
