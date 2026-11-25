// Exige un token de sesion valido y deja los datos del usuario en req.usuario
const { verificarToken } = require('../servicios/tokens');

function autenticar(req, res, next) {
    const cabecera = req.headers.authorization || '';
    const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null;
    if (!token) {
        return res.status(401).json({ error: 'DEBE INICIAR SESION' });
    }
    try {
        req.usuario = verificarToken(token);
        next();
    } catch {
        res.status(401).json({ error: 'LA SESION EXPIRO, INICIE SESION NUEVAMENTE' });
    }
}

module.exports = autenticar;
