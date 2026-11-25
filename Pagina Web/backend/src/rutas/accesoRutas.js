// Rutas /api/acceso: login, registro, sesion y cambio de contraseña
const express = require('express');
const acceso = require('../controladores/accesoControlador');
const autenticar = require('../middlewares/autenticacion');

const router = express.Router();

router.post('/login', acceso.login);
router.post('/registro', acceso.registro);
router.get('/sesion', autenticar, acceso.sesion);
router.post('/cambiar-clave', autenticar, acceso.cambiarClave);

module.exports = router;
