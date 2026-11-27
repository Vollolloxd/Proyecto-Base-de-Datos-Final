// Controlador de los pedidos del cliente web (sus solicitudes de compra)
const pedidoModelo = require('../modelos/pedidoModelo');
const pagosWeb = require('../servicios/pagosWeb');
const asincrono = require('../utilidades/asincrono');
const { errorApp } = require('../utilidades/errores');

const listar = asincrono(async (req, res) => {
    const filas = await pedidoModelo.listar(req.usuario.idCliente, req.usuario);
    res.json(filas);
});

const listarMetodosPago = asincrono(async (req, res) => {
    res.json(await pedidoModelo.listarMetodosPago(req.usuario));
});

const crear = asincrono(async (req, res) => {
    await pagosWeb.serializar('cliente:' + req.usuario.idCliente, () =>
        pedidoModelo.crear(req.usuario.idCliente, req.body?.OBSERVACIONES, req.usuario));
    res.status(201).json({ ok: true });
});

const modificar = asincrono(async (req, res) => {
    await pedidoModelo.modificar(req.params.id, req.usuario.idCliente, (req.body || {}).OBSERVACIONES, req.usuario);
    res.json({ ok: true });
});

const anular = asincrono(async (req, res) => {
    await pagosWeb.serializar(req.params.id, () => pedidoModelo.anular(req.params.id, req.usuario));
    res.json({ ok: true });
});

const listarProductos = asincrono(async (req, res) => {
    res.json(await pedidoModelo.listarProductos(req.params.id, req.usuario));
});

const agregarProducto = asincrono(async (req, res) => {
    const c = req.body || {};
    await pagosWeb.serializar(req.params.id, () =>
        pedidoModelo.agregarProducto(req.params.id, c.ID_PRODUCTO, c.CANTIDAD, req.usuario));
    res.status(201).json({ ok: true });
});

const cambiarCantidad = asincrono(async (req, res) => {
    const cantidad = req.body?.CANTIDAD;
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
        throw errorApp(20010, 'INGRESE UNA CANTIDAD MAYOR A CERO');
    }
    await pagosWeb.serializar(req.params.id, () =>
        pedidoModelo.cambiarCantidad(req.params.id, req.params.idProducto, cantidad, req.usuario));
    res.json({ ok: true });
});

const quitarProducto = asincrono(async (req, res) => {
    await pagosWeb.serializar(req.params.id, () => pedidoModelo.quitarProducto(req.params.id, req.params.idProducto, req.usuario));
    res.json({ ok: true });
});

const enviar = asincrono(async (req, res) => {
    const idMetodoPago = req.body?.ID_METODO_PAGO;
    if (!Number.isSafeInteger(idMetodoPago) || idMetodoPago <= 0) {
        throw errorApp(20314, 'SELECCIONE UN METODO DE PAGO ACTIVO');
    }
    await pagosWeb.enviar(req.params.id, {
        idMetodoPago,
        idProducto: req.body.ID_PRODUCTO,
        cantidad: req.body.CANTIDAD
    }, req.usuario);
    res.json({ ok: true });
});

module.exports = { listar, listarMetodosPago, crear, modificar, anular, listarProductos, agregarProducto, cambiarCantidad, quitarProducto, enviar };
