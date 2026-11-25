// Enrutador principal de la API (/api): une las rutas de cada modulo
const express = require('express');
const salud = require('../controladores/saludControlador');
const { rutaNoEncontrada } = require('../middlewares/manejoErrores');

const api = express.Router();

api.get('/salud', salud.estado);
api.use('/acceso', require('./accesoRutas'));
api.use('/mantenedores', require('./mantenedoresRutas'));
api.use('/gestores', require('./gestoresRutas'));
api.use('/reportes', require('./reportesRutas'));
api.use('/monitoreo', require('./monitoreoRutas'));
api.use('/cliente', require('./clienteRutas'));
api.use(rutaNoEncontrada);

module.exports = api;
