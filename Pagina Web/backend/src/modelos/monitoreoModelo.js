// Modelo de monitoreo: alertas pendientes, auditoria, alertas de stock e intentos de login
const db = require('../config/baseDatos');

const alertasPendientes = (usuario) => db.funcion('CEMJ_FN_ALERTAS_PENDIENTES', {}, usuario);

const auditoria = (tabla, dias, usuario) =>
    db.listar('CEMJ_PA_AUDITORIA_LISTAR', { P_NOMBRE_TABLA: tabla, P_DIAS: dias }, usuario);

const alertasStock = (soloBajoMinimo, dias, usuario) =>
    db.listar('CEMJ_PA_ALERTA_STOCK_LISTAR', { P_SOLO_BAJO_MINIMO: soloBajoMinimo, P_DIAS: dias }, usuario);

const intentosLogin = (soloFallidos, dias, usuario) =>
    db.listar('CEMJ_PA_LOGIN_INTENTO_LISTAR', { P_SOLO_FALLIDOS: soloFallidos, P_DIAS: dias }, usuario);

module.exports = { alertasPendientes, auditoria, alertasStock, intentosLogin };
