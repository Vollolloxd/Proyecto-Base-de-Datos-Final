// Modelo de inventario: aplicar un movimiento actualiza el stock (gestor G1)
const db = require('../config/baseDatos');

const aplicarMovimiento = (idMovimiento, usuario) => db.ejecutar('CEMJ_PA_GES_MOV_APLICAR', {
    P_ID_MOVIMIENTO: idMovimiento,
    P_ID_USUARIO: usuario.id
}, usuario);

module.exports = { aplicarMovimiento };
