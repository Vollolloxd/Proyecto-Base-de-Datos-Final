// Controlador de los 3 reportes: lee los filtros de la consulta y aplica sus valores por defecto
const reporteModelo = require('../modelos/reporteModelo');
const asincrono = require('../utilidades/asincrono');

const rankingProductos = asincrono(async (req, res) => {
    res.json(await reporteModelo.rankingProductos(req.query.anio || null, req.query.mes || null, req.usuario));
});

const ventasPorCanal = asincrono(async (req, res) => {
    res.json(await reporteModelo.ventasPorCanal(req.query.anio || null, req.usuario));
});

const stockCritico = asincrono(async (req, res) => {
    res.json(await reporteModelo.stockCritico(req.query.dias || 30, req.query.soloAlertas === '1' ? 1 : 0, req.usuario));
});

module.exports = { rankingProductos, ventasPorCanal, stockCritico };
