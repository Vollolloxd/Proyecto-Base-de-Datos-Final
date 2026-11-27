// Controlador de ventas: listado, detalle, venta presencial (G2), confirmar con pago (G4) y anular (G5)
const { randomUUID } = require('node:crypto');
const ventaModelo = require('../modelos/ventaModelo');
const { errorApp } = require('../utilidades/errores');
const asincrono = require('../utilidades/asincrono');

const listar = asincrono(async (req, res) => {
    res.json(await ventaModelo.listar(req.query.estado, req.usuario));
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
    const ventas = await ventaModelo.listar(null, req.usuario);
    const venta = ventas.find((fila) => String(fila.ID_VENTA) === String(req.params.id));
    if (!venta) throw errorApp(20100, 'VENTA NO ENCONTRADA');
    if (venta.CANAL_VENTA === 'DIGITAL') {
        throw errorApp(20314, 'ESTA OPERACION SOLO CONFIRMA VENTAS PRESENCIALES');
    }
    const referencia = `VP-${randomUUID().toUpperCase()}`;
    await ventaModelo.confirmar(req.params.id, c.ID_METODO_PAGO, referencia, req.usuario);
    res.json({ ok: true, REFERENCIA: referencia });
});

const anular = asincrono(async (req, res) => {
    await ventaModelo.anular(req.params.id, (req.body || {}).MOTIVO, req.usuario);
    res.json({ ok: true });
});

module.exports = { listar, detalle, crear, agregarProducto, confirmar, anular };
