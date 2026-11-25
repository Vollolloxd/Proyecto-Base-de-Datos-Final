// Modelo de metodos de pago (lectura): activos para el cliente y todos para resolver el elegido
const db = require('../config/baseDatos');

const listar = (soloActivos, usuario) =>
    db.listar('CEMJ_PA_METODO_PAGO_LISTAR', { P_SOLO_ACTIVOS: soloActivos ? 1 : 0 }, usuario);

module.exports = { listar };
