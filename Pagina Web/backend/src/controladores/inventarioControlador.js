// Controlador de inventario: aplicar un movimiento (gestor G1)
const inventarioModelo = require('../modelos/inventarioModelo');
const asincrono = require('../utilidades/asincrono');

const aplicarMovimiento = asincrono(async (req, res) => {
    await inventarioModelo.aplicarMovimiento(req.params.id, req.usuario);
    res.json({ ok: true });
});

module.exports = { aplicarMovimiento };
