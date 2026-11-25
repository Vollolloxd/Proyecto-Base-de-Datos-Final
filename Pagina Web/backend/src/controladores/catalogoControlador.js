// Controlador del catalogo publico de la tienda
const catalogoModelo = require('../modelos/catalogoModelo');
const asincrono = require('../utilidades/asincrono');

const listar = asincrono(async (req, res) => {
    res.json(await catalogoModelo.listar());
});

const masVendidos = asincrono(async (req, res) => {
    res.json(await catalogoModelo.masVendidos(30, 3));
});

module.exports = { listar, masVendidos };
