// Modelo generico de los mantenedores (CRUD): ejecuta el procedimiento que define cada recurso
const db = require('../config/baseDatos');
const RECURSOS = require('./mantenedores');

const obtenerRecurso = (nombre) => (Object.prototype.hasOwnProperty.call(RECURSOS, nombre) ? RECURSOS[nombre] : null);

const listar = (recurso, params, usuario) => db.listar(recurso.listar, params, usuario);
const crear = (recurso, params, usuario) => db.ejecutar(recurso.crear, params, usuario);
const modificar = (recurso, params, usuario) => db.ejecutar(recurso.modificar, params, usuario);
const eliminar = (recurso, params, usuario) => db.ejecutar(recurso.eliminar, params, usuario);
const reactivar = (recurso, params, usuario) => db.ejecutar(recurso.reactivar, params, usuario);

module.exports = { obtenerRecurso, listar, crear, modificar, eliminar, reactivar };
