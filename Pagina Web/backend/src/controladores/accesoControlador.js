// Controlador de acceso: login, registro de cliente web, datos de la sesion y cambio de contraseña
const accesoServicio = require('../servicios/accesoServicio');
const asincrono = require('../utilidades/asincrono');

const login = asincrono(async (req, res) => {
    const { correo, clave } = req.body || {};
    res.json(await accesoServicio.iniciarSesion(correo, clave));
});

const registro = asincrono(async (req, res) => {
    res.json(await accesoServicio.registrarCliente(req.body || {}));
});

const sesion = asincrono(async (req, res) => {
    res.json(await accesoServicio.datosSesion(req.usuario));
});

const cambiarClave = asincrono(async (req, res) => {
    const { claveActual, claveNueva } = req.body || {};
    await accesoServicio.cambiarClave(req.usuario, claveActual, claveNueva);
    res.json({ ok: true });
});

module.exports = { login, registro, sesion, cambiarClave };
