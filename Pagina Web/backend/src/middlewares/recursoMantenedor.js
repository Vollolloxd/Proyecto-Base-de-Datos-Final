// Mantenedores: carga la definicion del recurso de la URL y controla los permisos de lectura y escritura
const mantenedorModelo = require('../modelos/mantenedorModelo');
const permiso = require('./permisos');

function cargarRecurso(req, res, next, nombre) {
    req.recurso = mantenedorModelo.obtenerRecurso(nombre);
    if (!req.recurso) {
        return res.status(404).json({ error: 'MANTENEDOR NO ENCONTRADO' });
    }
    next();
}

const lectura = (req, res, next) => permiso(...req.recurso.lectura)(req, res, next);

function escritura(req, res, next) {
    if (!req.recurso.modulo) {
        return res.status(405).json({ error: 'ESTE RECURSO ES SOLO DE LECTURA' });
    }
    return permiso(req.recurso.modulo)(req, res, next);
}

module.exports = { cargarRecurso, lectura, escritura };
