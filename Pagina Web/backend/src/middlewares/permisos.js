// Permite pasar si el usuario tiene acceso a alguno de los modulos (CEMJ_FN_PUEDE_ACCEDER)
const accesoModelo = require('../modelos/accesoModelo');
const asincrono = require('../utilidades/asincrono');

function permiso(...modulos) {
    return asincrono(async (req, res, next) => {
        for (const modulo of modulos) {
            if (await accesoModelo.puedeAcceder(req.usuario, modulo)) {
                return next();
            }
        }
        res.status(403).json({ error: 'NO TIENE PERMISO PARA ESTE MODULO' });
    });
}

module.exports = permiso;
