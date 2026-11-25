// Modelo de los pedidos del cliente web (solicitudes de compra y sus productos)
const db = require('../config/baseDatos');

async function esDelCliente(idSolicitud, idCliente, usuario) {
    const es = await db.funcion('CEMJ_FN_SOLICITUD_DEL_CLIENTE', {
        P_ID_SOLICITUD: idSolicitud,
        P_ID_CLIENTE: idCliente
    }, usuario);
    return es === 1;
}

const listar = (idCliente, usuario) =>
    db.listar('CEMJ_PA_SOLICITUD_LISTAR', { P_ID_CLIENTE: idCliente }, usuario);

const crear = (idCliente, observaciones, usuario) =>
    db.ejecutar('CEMJ_PA_SOLICITUD_CREAR', { P_ID_CLIENTE: idCliente, P_OBSERVACIONES: observaciones }, usuario);

const modificar = (idSolicitud, idCliente, observaciones, usuario) => db.ejecutar('CEMJ_PA_SOLICITUD_MODIFICAR', {
    P_ID_SOLICITUD: idSolicitud,
    P_ID_CLIENTE: idCliente,
    P_OBSERVACIONES: observaciones
}, usuario);

const anular = (idSolicitud, usuario) =>
    db.ejecutar('CEMJ_PA_SOLICITUD_ELIMINAR', { P_ID_SOLICITUD: idSolicitud }, usuario);

const listarProductos = (idSolicitud, usuario) =>
    db.listar('CEMJ_PA_DET_SOLIC_LISTAR', { P_ID_SOLICITUD: idSolicitud }, usuario);

const agregarProducto = (idSolicitud, idProducto, cantidad, usuario) => db.ejecutar('CEMJ_PA_DET_SOLIC_CREAR', {
    P_ID_SOLICITUD: idSolicitud,
    P_ID_PRODUCTO: idProducto,
    P_CANTIDAD: cantidad
}, usuario);

const cambiarCantidad = (idSolicitud, idProducto, cantidad, usuario) => db.ejecutar('CEMJ_PA_DET_SOLIC_MODIFICAR', {
    P_ID_SOLICITUD: idSolicitud,
    P_ID_PRODUCTO: idProducto,
    P_CANTIDAD: cantidad
}, usuario);

const quitarProducto = (idSolicitud, idProducto, usuario) => db.ejecutar('CEMJ_PA_DET_SOLIC_ELIMINAR', {
    P_ID_SOLICITUD: idSolicitud,
    P_ID_PRODUCTO: idProducto
}, usuario);

module.exports = {
    esDelCliente, listar, crear, modificar, anular, listarProductos, agregarProducto, cambiarCantidad, quitarProducto
};
