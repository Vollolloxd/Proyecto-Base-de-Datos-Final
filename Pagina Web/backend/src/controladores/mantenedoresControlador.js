// Controlador generico de los 10 mantenedores: listar, crear, modificar, eliminar (logico) y reactivar
const mantenedorModelo = require('../modelos/mantenedorModelo');
const servicio = require('../servicios/mantenedorServicio');
const asincrono = require('../utilidades/asincrono');

const listar = asincrono(async (req, res) => {
    const { params, faltante } = servicio.parametrosListar(req.recurso, req.query);
    if (faltante) {
        return res.status(400).json({ error: `FALTA EL FILTRO ${faltante}` });
    }
    res.json(await mantenedorModelo.listar(req.recurso, params, req.usuario));
});

const crear = asincrono(async (req, res) => {
    await mantenedorModelo.crear(req.recurso, servicio.parametrosCrear(req.recurso, req.body || {}, req.usuario), req.usuario);
    res.status(201).json({ ok: true });
});

const modificar = asincrono(async (req, res) => {
    const params = servicio.parametrosModificar(req.recurso, req.params.id, req.params.id2, req.body || {});
    await mantenedorModelo.modificar(req.recurso, params, req.usuario);
    res.json({ ok: true });
});

const eliminar = asincrono(async (req, res) => {
    await mantenedorModelo.eliminar(req.recurso, servicio.parametrosIds(req.recurso, req.params.id, req.params.id2), req.usuario);
    res.json({ ok: true });
});

const reactivar = asincrono(async (req, res) => {
    if (!req.recurso.reactivar) {
        return res.status(405).json({ error: 'ESTE REGISTRO NO SE PUEDE REACTIVAR' });
    }
    await mantenedorModelo.reactivar(req.recurso, servicio.parametrosIds(req.recurso, req.params.id, req.params.id2), req.usuario);
    res.json({ ok: true });
});

module.exports = { listar, crear, modificar, eliminar, reactivar };
