// Rutas /api/mantenedores/:recurso: CRUD generico de los 10 mantenedores
const express = require('express');
const mantenedores = require('../controladores/mantenedoresControlador');
const autenticar = require('../middlewares/autenticacion');
const { cargarRecurso, lectura, escritura } = require('../middlewares/recursoMantenedor');

const router = express.Router();
router.use(autenticar);
router.param('recurso', cargarRecurso);

router.get('/:recurso', lectura, mantenedores.listar);
router.post('/:recurso', escritura, mantenedores.crear);
router.put('/:recurso/:id{/:id2}', escritura, mantenedores.modificar);
router.delete('/:recurso/:id{/:id2}', escritura, mantenedores.eliminar);
router.patch('/:recurso/:id/reactivar', escritura, mantenedores.reactivar);

module.exports = router;
