// Modelo del catalogo publico: productos a la venta y los mas vendidos
const db = require('../config/baseDatos');

const listar = () => db.listar('CEMJ_PA_CATALOGO_LISTAR', {});

const masVendidos = (dias = 30, top = 3) => db.listar('CEMJ_PA_REP_MAS_VENDIDOS', { P_DIAS: dias, P_TOP: top });

module.exports = { listar, masVendidos };
