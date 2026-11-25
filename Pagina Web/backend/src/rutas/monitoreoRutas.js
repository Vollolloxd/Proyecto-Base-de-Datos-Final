// Rutas /api/monitoreo: alertas, auditoria e intentos de inicio de sesion
const express = require('express');
const monitoreo = require('../controladores/monitoreoControlador');
const autenticar = require('../middlewares/autenticacion');
const permiso = require('../middlewares/permisos');

const router = express.Router();
router.use(autenticar);

router.get('/alertas-pendientes', permiso('MONITOREO', 'INVENTARIO', 'REPORTES', 'VENTAS'), monitoreo.alertasPendientes);
router.get('/auditoria', permiso('MONITOREO'), monitoreo.auditoria);
router.get('/alertas-stock', permiso('MONITOREO'), monitoreo.alertasStock);
router.get('/logins', permiso('MONITOREO'), monitoreo.intentosLogin);

module.exports = router;
