// Respuestas de error: ruta de la API inexistente y errores lanzados por los controladores
const { traducirError } = require('../utilidades/errores');

function rutaNoEncontrada(req, res) {
    res.status(404).json({ error: 'RUTA NO ENCONTRADA' });
}

function manejarError(err, req, res, next) {
    const { estado, mensaje } = traducirError(err);
    if (estado >= 500) {
        console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
    }
    res.status(estado).json({ error: mensaje });
}

module.exports = { rutaNoEncontrada, manejarError };
