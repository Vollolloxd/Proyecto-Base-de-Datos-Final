// Controlador de ventas: listado, detalle, venta presencial (G2), confirmar con pago (G4) y anular (G5)
const ventaModelo = require('../modelos/ventaModelo');
const pagoServicio = require('../servicios/pagoServicio');
const asincrono = require('../utilidades/asincrono');

const listar = asincrono(async (req, res) => {
    const [ventas, elegidos] = await Promise.all([
        ventaModelo.listar(req.query.estado, req.usuario),
        pagoServicio.elegidosPorVenta(req.usuario)
    ]);
    res.json(ventas.map((v) => ({ ...v, METODO_ELEGIDO: elegidos.get(String(v.ID_VENTA)) || null })));
});

const detalle = asincrono(async (req, res) => {
    res.json(await ventaModelo.detalle(req.params.id, req.usuario));
});

const crear = asincrono(async (req, res) => {
    const idVenta = await ventaModelo.crear(req.body || {}, req.usuario);
    res.status(201).json({ ID_VENTA: idVenta });
});

const agregarProducto = asincrono(async (req, res) => {
    const c = req.body || {};
    await ventaModelo.agregarProducto(req.params.id, c.ID_PRODUCTO, c.CANTIDAD, req.usuario);
    res.json({ ok: true });
});

const confirmar = asincrono(async (req, res) => {
    const c = req.body || {};
    const { idMetodo, referencia } = await pagoServicio.datosDeConfirmacion(req.params.id, c.ID_METODO_PAGO, req.usuario);
    await ventaModelo.confirmar(req.params.id, idMetodo, referencia, req.usuario);
    res.json({ ok: true, REFERENCIA: referencia });
});

const anular = asincrono(async (req, res) => {
    await ventaModelo.anular(req.params.id, (req.body || {}).MOTIVO, req.usuario);
    res.json({ ok: true });
});

module.exports = { listar, detalle, crear, agregarProducto, confirmar, anular };
