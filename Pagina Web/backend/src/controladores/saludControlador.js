// Controlador de salud: confirma que la API responde y que hay conexion con Oracle
const db = require('../config/baseDatos');
const asincrono = require('../utilidades/asincrono');

const estado = asincrono(async (req, res) => {
    await db.probarConexion();
    res.json({ ok: true, baseDeDatos: 'conectada' });
});

module.exports = { estado };
