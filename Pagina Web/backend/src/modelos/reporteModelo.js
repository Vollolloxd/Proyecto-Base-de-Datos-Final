// Modelo de los 3 reportes (CEMJ_PA_REP_*)
const db = require('../config/baseDatos');

const rankingProductos = (anio, mes, usuario) =>
    db.listar('CEMJ_PA_REP_RANKING_PRODUCTOS', { P_ANIO: anio, P_MES: mes }, usuario);

const ventasPorCanal = (anio, usuario) =>
    db.listar('CEMJ_PA_REP_VENTAS_CANAL', { P_ANIO: anio }, usuario);

const stockCritico = (dias, soloAlertas, usuario) =>
    db.listar('CEMJ_PA_REP_STOCK_CRITICO', { P_DIAS: dias, P_SOLO_ALERTAS: soloAlertas }, usuario);

module.exports = { rankingProductos, ventasPorCanal, stockCritico };
