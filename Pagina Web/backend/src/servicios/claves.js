// Contraseñas: hash con sal (scrypt) y verificacion; la BD solo guarda PASSWORD_HASH
const crypto = require('crypto');
const { errorApp } = require('../utilidades/errores');

const LARGO_MINIMO = 6;

function validarClave(clave, numero = 20508) {
    if (typeof clave !== 'string' || clave.length < LARGO_MINIMO) {
        throw errorApp(numero, `LA CONTRASENA DEBE TENER AL MENOS ${LARGO_MINIMO} CARACTERES`);
    }
}

function hashClave(clave) {
    const sal = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(clave, sal, 64).toString('hex');
    return `scrypt$${sal}$${hash}`;
}

function verificarClave(clave, guardado) {
    if (typeof clave !== 'string' || typeof guardado !== 'string') {
        return false;
    }
    const [tipo, sal, hash] = guardado.split('$');
    if (tipo !== 'scrypt' || !sal || !hash) {
        return false;
    }
    const esperado = Buffer.from(hash, 'hex');
    const calculado = crypto.scryptSync(clave, sal, esperado.length);
    return crypto.timingSafeEqual(esperado, calculado);
}

module.exports = { validarClave, hashClave, verificarClave };
