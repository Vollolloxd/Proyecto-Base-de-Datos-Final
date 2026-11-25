// Controlador de monitoreo: alertas pendientes, auditoria, alertas de stock e intentos de inicio de sesion
const monitoreoModelo = require('../modelos/monitoreoModelo');
const asincrono = require('../utilidades/asincrono');

const alertasPendientes = asincrono(async (req, res) => {
    res.json({ cantidad: await monitoreoModelo.alertasPendientes(req.usuario) });
});

const auditoria = asincrono(async (req, res) => {
    res.json(await monitoreoModelo.auditoria(req.query.tabla || null, req.query.dias || 7, req.usuario));
});

const alertasStock = asincrono(async (req, res) => {
    res.json(await monitoreoModelo.alertasStock(req.query.soloBajoMinimo === '1' ? 1 : 0, req.query.dias || 30, req.usuario));
});

const intentosLogin = asincrono(async (req, res) => {
    res.json(await monitoreoModelo.intentosLogin(req.query.soloFallidos === '1' ? 1 : 0, req.query.dias || 7, req.usuario));
});

module.exports = { alertasPendientes, auditoria, alertasStock, intentosLogin };
