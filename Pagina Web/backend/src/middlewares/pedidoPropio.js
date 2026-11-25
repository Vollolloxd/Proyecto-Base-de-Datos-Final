// Cliente web: solo deja operar sobre solicitudes que pertenecen al cliente de la sesion
const pedidoModelo = require('../modelos/pedidoModelo');
const asincrono = require('../utilidades/asincrono');

const pedidoPropio = asincrono(async (req, res, next) => {
    if (!(await pedidoModelo.esDelCliente(req.params.id, req.usuario.idCliente, req.usuario))) {
        return res.status(404).json({ error: 'SOLICITUD NO ENCONTRADA' });
    }
    next();
});

module.exports = pedidoPropio;
