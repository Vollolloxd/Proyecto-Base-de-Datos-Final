// Rutas /api/reportes: los 3 reportes (requieren el modulo REPORTES)
const express = require('express');
const reportes = require('../controladores/reportesControlador');
const autenticar = require('../middlewares/autenticacion');
const permiso = require('../middlewares/permisos');

const router = express.Router();
router.use(autenticar, permiso('REPORTES'));

router.get('/ranking-productos', reportes.rankingProductos);
router.get('/ventas-canal', reportes.ventasPorCanal);
router.get('/stock-critico', reportes.stockCritico);

module.exports = router;
