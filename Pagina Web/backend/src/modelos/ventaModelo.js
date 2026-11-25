// Modelo de ventas: venta presencial (G2), confirmacion con pago (G4) y anulacion (G5)
const db = require('../config/baseDatos');

const listar = (estado, usuario) => db.listar('CEMJ_PA_GES_VENTA_LISTAR', { P_ESTADO: estado || null }, usuario);

const detalle = (idVenta, usuario) => db.listar('CEMJ_PA_GES_VENTA_DETALLE', { P_ID_VENTA: idVenta }, usuario);

async function crear(datos, usuario) {
    const salida = await db.ejecutar('CEMJ_PA_GES_VENTA_CREAR', {
        P_ID_USUARIO: usuario.id,
        P_ID_CLIENTE: datos.ID_CLIENTE,
        P_NOMBRE_COMPRADOR: datos.NOMBRE_COMPRADOR,
        P_LUGAR_VENTA: datos.LUGAR_VENTA,
        P_OBSERVACIONES: datos.OBSERVACIONES,
        P_ID_VENTA: db.salidaNumero()
    }, usuario);
    return salida.P_ID_VENTA;
}

const agregarProducto = (idVenta, idProducto, cantidad, usuario) => db.ejecutar('CEMJ_PA_GES_VENTA_AGREGAR', {
    P_ID_VENTA: idVenta,
    P_ID_PRODUCTO: idProducto,
    P_CANTIDAD: cantidad
}, usuario);

const confirmar = (idVenta, idMetodoPago, referencia, usuario) => db.ejecutar('CEMJ_PA_GES_VENTA_CONFIRMAR', {
    P_ID_VENTA: idVenta,
    P_ID_USUARIO: usuario.id,
    P_ID_METODO_PAGO: idMetodoPago,
    P_REFERENCIA: referencia
}, usuario);

const anular = (idVenta, motivo, usuario) => db.ejecutar('CEMJ_PA_GES_VENTA_ANULAR', {
    P_ID_VENTA: idVenta,
    P_ID_USUARIO: usuario.id,
    P_MOTIVO: motivo
}, usuario);

module.exports = { listar, detalle, crear, agregarProducto, confirmar, anular };
