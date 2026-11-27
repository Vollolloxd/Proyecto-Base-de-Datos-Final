// Controlador generico de los 10 mantenedores: listar, crear, modificar, eliminar (logico) y reactivar
const mantenedorModelo = require('../modelos/mantenedorModelo');
const servicio = require('../servicios/mantenedorServicio');
const crearProducto = require('../servicios/creacionProducto');
const validarFormatoProducto = require('../servicios/formatoProducto');
const productos = require('../modelos/mantenedores/productos');
const asincrono = require('../utilidades/asincrono');

const listar = asincrono(async (req, res) => {
    const { params, faltante } = servicio.parametrosListar(req.recurso, req.query);
    if (faltante) {
        return res.status(400).json({ error: `FALTA EL FILTRO ${faltante}` });
    }
    res.json(await mantenedorModelo.listar(req.recurso, params, req.usuario));
});

const crear = asincrono(async (req, res) => {
    const recibido = req.body || {};
    const cuerpo = req.recurso === productos ? await validarFormatoProducto(recibido, req.usuario) : recibido;
    if (req.recurso === productos && (Object.hasOwn(cuerpo, 'CEPAS') || Number(cuerpo.ACTIVO) === 1)) {
        return res.status(201).json(await crearProducto(cuerpo, req.usuario));
    }
    await mantenedorModelo.crear(req.recurso, servicio.parametrosCrear(req.recurso, cuerpo, req.usuario), req.usuario);
    res.status(201).json({ ok: true });
});

const modificar = asincrono(async (req, res) => {
    const recibido = req.body || {};
    const cuerpo = req.recurso === productos
        ? await validarFormatoProducto(recibido, req.usuario, req.params.id)
        : recibido;
    const params = servicio.parametrosModificar(req.recurso, req.params.id, req.params.id2, cuerpo);
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
