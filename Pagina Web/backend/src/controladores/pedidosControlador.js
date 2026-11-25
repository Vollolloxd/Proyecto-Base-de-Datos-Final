// Controlador de los pedidos del cliente web (sus solicitudes de compra)
const pedidoModelo = require('../modelos/pedidoModelo');
const metodoPagoModelo = require('../modelos/metodoPagoModelo');
const pagoServicio = require('../servicios/pagoServicio');
const asincrono = require('../utilidades/asincrono');

const listar = asincrono(async (req, res) => {
    res.json(await pedidoModelo.listar(req.usuario.idCliente, req.usuario));
});

const crear = asincrono(async (req, res) => {
    await pedidoModelo.crear(req.usuario.idCliente, (req.body || {}).OBSERVACIONES, req.usuario);
    res.status(201).json({ ok: true });
});

const modificar = asincrono(async (req, res) => {
    await pedidoModelo.modificar(req.params.id, req.usuario.idCliente, (req.body || {}).OBSERVACIONES, req.usuario);
    res.json({ ok: true });
});

const anular = asincrono(async (req, res) => {
    await pedidoModelo.anular(req.params.id, req.usuario);
    res.json({ ok: true });
});

const listarProductos = asincrono(async (req, res) => {
    res.json(await pedidoModelo.listarProductos(req.params.id, req.usuario));
});

const agregarProducto = asincrono(async (req, res) => {
    const c = req.body || {};
    await pedidoModelo.agregarProducto(req.params.id, c.ID_PRODUCTO, c.CANTIDAD, req.usuario);
    res.status(201).json({ ok: true });
});

const cambiarCantidad = asincrono(async (req, res) => {
    await pedidoModelo.cambiarCantidad(req.params.id, req.params.idProducto, (req.body || {}).CANTIDAD, req.usuario);
    res.json({ ok: true });
});

const quitarProducto = asincrono(async (req, res) => {
    await pedidoModelo.quitarProducto(req.params.id, req.params.idProducto, req.usuario);
    res.json({ ok: true });
});

const enviar = asincrono(async (req, res) => {
    await pagoServicio.enviarConPago(req.params.id, (req.body || {}).ID_METODO_PAGO, req.usuario);
    res.json({ ok: true });
});

const metodosPago = asincrono(async (req, res) => {
    const metodos = await metodoPagoModelo.listar(true, req.usuario);
    res.json(metodos.map(({ ID_METODO_PAGO, NOMBRE, DESCRIPCION }) => ({ ID_METODO_PAGO, NOMBRE, DESCRIPCION })));
});

module.exports = {
    listar, crear, modificar, anular, listarProductos, agregarProducto, cambiarCantidad, quitarProducto, enviar, metodosPago
};
