const pagosWeb = require('../servicios/pagosWeb');
const asincrono = require('../utilidades/asincrono');

const aceptar = asincrono(async (req, res) => {
    const idVenta = await pagosWeb.aceptar(req.params.id, req.usuario);
    res.json({ ok: true, idVenta });
});

const anular = asincrono(async (req, res) => {
    await pagosWeb.anular(req.params.id, req.usuario, req.body?.MOTIVO);
    res.json({ ok: true });
});

module.exports = { aceptar, anular };
