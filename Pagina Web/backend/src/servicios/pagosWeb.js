// La selección de pago y el motivo de rechazo se guardan en Oracle (CEMJ_PAGO_SOLICITUD y CEMJ_SOLICITUD_COMPRA).
const pedidos = require('../modelos/pedidoModelo');
const solicitudes = require('../modelos/solicitudModelo');
const { errorApp } = require('../utilidades/errores');

const operaciones = new Map();

async function serializar(id, trabajo) {
    const clave = String(id);
    const anterior = operaciones.get(clave) || Promise.resolve();
    const actual = anterior.catch(() => {}).then(trabajo);
    operaciones.set(clave, actual);
    try {
        return await actual;
    } finally {
        if (operaciones.get(clave) === actual) operaciones.delete(clave);
    }
}

async function buscar(id, idCliente, usuario) {
    const lista = await pedidos.listar(idCliente, usuario);
    const solicitud = lista.find((fila) => String(fila.ID_SOLICITUD) === String(id));
    if (!solicitud) throw errorApp(20100, 'SOLICITUD NO ENCONTRADA');
    return solicitud;
}

async function separarProducto(solicitud, linea, cantidad, usuario) {
    const anteriores = await pedidos.listar(usuario.idCliente, usuario);
    const ids = new Set(anteriores.map((fila) => fila.ID_SOLICITUD));
    await pedidos.crear(usuario.idCliente, solicitud.OBSERVACIONES, usuario);
    const actuales = await pedidos.listar(usuario.idCliente, usuario);
    const nuevos = actuales.filter((fila) => fila.ESTADO === 'BORRADOR' && !ids.has(fila.ID_SOLICITUD));
    if (nuevos.length !== 1) throw errorApp(20308, 'NO SE PUDO IDENTIFICAR EL PEDIDO DEL PRODUCTO');

    const nuevo = nuevos[0];
    try {
        await pedidos.agregarProducto(nuevo.ID_SOLICITUD, linea.ID_PRODUCTO, cantidad, usuario);
        await pedidos.quitarProducto(solicitud.ID_SOLICITUD, linea.ID_PRODUCTO, usuario);
    } catch (error) {
        // Una respuesta perdida al quitar la línea no debe eliminar la única copia del producto.
        const restantes = await pedidos.listarProductos(solicitud.ID_SOLICITUD, usuario);
        if (restantes.some((fila) => fila.ID_PRODUCTO === linea.ID_PRODUCTO)) {
            await pedidos.anular(nuevo.ID_SOLICITUD, usuario);
            throw error;
        }
    }
    return nuevo;
}

async function enviar(id, { idMetodoPago, idProducto, cantidad }, usuario) {
    return serializar('cliente:' + usuario.idCliente, () => serializar(id, async () => {
        let solicitud = await buscar(id, usuario.idCliente, usuario);
        const borrador = solicitud.ESTADO === 'BORRADOR';
        const pendientePago = solicitud.ESTADO === 'ACEPTADA' && solicitud.ESTADO_VENTA === 'BORRADOR';
        if (!borrador && solicitud.ESTADO !== 'PENDIENTE' && !pendientePago) {
            throw errorApp(20308, 'LA SOLICITUD NO ADMITE CAMBIOS EN EL METODO DE PAGO');
        }

        // Se revisa antes de separar productos para no dejar pedidos a medias.
        const metodos = await pedidos.listarMetodosPago(usuario);
        if (!metodos.some((fila) => Number(fila.ID_METODO_PAGO) === idMetodoPago)) {
            throw errorApp(20314, 'SELECCIONE UN METODO DE PAGO ACTIVO');
        }

        if (borrador) {
            const lineas = await pedidos.listarProductos(id, usuario);
            const linea = idProducto === undefined && lineas.length === 1
                ? lineas[0]
                : lineas.find((fila) => Number(fila.ID_PRODUCTO) === idProducto);
            if (!linea) throw errorApp(20309, 'SELECCIONE UN PRODUCTO DEL PEDIDO');
            const unidades = cantidad ?? Number(linea.CANTIDAD);
            if (!Number.isFinite(unidades) || unidades <= 0) {
                throw errorApp(20010, 'INGRESE UNA CANTIDAD MAYOR A CERO');
            }
            if (lineas.length > 1) {
                solicitud = await separarProducto(solicitud, linea, unidades, usuario);
            } else if (unidades !== Number(linea.CANTIDAD)) {
                await pedidos.cambiarCantidad(id, linea.ID_PRODUCTO, unidades, usuario);
            }
        }

        await pedidos.registrarPago(solicitud.ID_SOLICITUD, idMetodoPago, usuario);
        if (borrador) await solicitudes.enviar(solicitud.ID_SOLICITUD, usuario);
    }));
}

function aceptar(id, usuario) {
    return serializar(id, () => solicitudes.resolver(id, 'ACEPTADA', usuario));
}

async function anular(id, usuario, motivo) {
    return serializar(id, async () => {
        const solicitud = await buscar(id, null, usuario);
        if (solicitud.ESTADO === 'BORRADOR') {
            await pedidos.anular(id, usuario);
        } else if (solicitud.ESTADO === 'PENDIENTE') {
            await solicitudes.rechazar(id, typeof motivo === 'string' ? motivo : null, usuario);
        } else {
            throw errorApp(20311, 'Solo se pueden anular solicitudes en borrador o pendientes.');
        }
    });
}

module.exports = { enviar, aceptar, anular, serializar };
