// Tokens de sesion (JWT): creacion y verificacion
const jwt = require('jsonwebtoken');
const config = require('../config/entorno');

function crearToken(usuario) {
    return jwt.sign(usuario, config.jwtSecreto, { expiresIn: config.jwtDuracion });
}

function verificarToken(token) {
    const datos = jwt.verify(token, config.jwtSecreto);
    return { id: datos.id, correo: datos.correo, rol: datos.rol, idCliente: datos.idCliente };
}

module.exports = { crearToken, verificarToken };
