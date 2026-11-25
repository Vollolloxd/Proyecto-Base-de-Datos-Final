// Rutas /api/gestores: los 5 gestores de informacion (CEMJ_PA_GES_*)
const express = require('express');
const inventario = require('../controladores/inventarioControlador');
const ventas = require('../controladores/ventasControlador');
const solicitudes = require('../controladores/solicitudesControlador');
const autenticar = require('../middlewares/autenticacion');
const permiso = require('../middlewares/permisos');

const router = express.Router();
router.use(autenticar);

router.post('/movimientos/:id/aplicar', permiso('INVENTARIO'), inventario.aplicarMovimiento);

router.get('/ventas', permiso('VENTAS'), ventas.listar);
router.get('/ventas/:id/detalle', permiso('VENTAS'), ventas.detalle);
router.post('/ventas', permiso('VENTAS'), ventas.crear);
router.post('/ventas/:id/productos', permiso('VENTAS'), ventas.agregarProducto);
router.post('/ventas/:id/confirmar', permiso('VENTAS'), ventas.confirmar);
router.post('/ventas/:id/anular', permiso('VENTAS'), ventas.anular);

router.post('/solicitudes/:id/enviar', permiso('SOLICITUDES'), solicitudes.enviar);
router.post('/solicitudes/:id/resolver', permiso('SOLICITUDES'), solicitudes.resolver);

module.exports = router;
