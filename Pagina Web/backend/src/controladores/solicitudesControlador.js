// Controlador del gestor de solicitudes web (G3): enviar y resolver
const solicitudModelo = require('../modelos/solicitudModelo');
const asincrono = require('../utilidades/asincrono');

const enviar = asincrono(async (req, res) => {
    await solicitudModelo.enviar(req.params.id, req.usuario);
    res.json({ ok: true });
});

const resolver = asincrono(async (req, res) => {
    const idVenta = await solicitudModelo.resolver(req.params.id, (req.body || {}).DECISION, req.usuario);
    res.json({ ID_VENTA: idVenta });
});

module.exports = { enviar, resolver };
