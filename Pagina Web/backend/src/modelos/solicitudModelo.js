// Modelo del gestor de solicitudes web (G3): envio y resolucion (aceptar genera una venta digital)
const db = require('../config/baseDatos');

const enviar = (idSolicitud, usuario) =>
    db.ejecutar('CEMJ_PA_GES_SOLIC_ENVIAR', { P_ID_SOLICITUD: idSolicitud }, usuario);

async function resolver(idSolicitud, decision, usuario) {
    const salida = await db.ejecutar('CEMJ_PA_GES_SOLIC_RESOLVER', {
        P_ID_SOLICITUD: idSolicitud,
        P_ID_USUARIO: usuario.id,
        P_DECISION: decision,
        P_ID_VENTA: db.salidaNumero()
    }, usuario);
    return salida.P_ID_VENTA;
}

const rechazar = (idSolicitud, motivo, usuario) => db.ejecutar('CEMJ_PA_SOLICITUD_RECHAZAR', {
    P_ID_SOLICITUD: idSolicitud,
    P_ID_USUARIO: usuario.id,
    P_MOTIVO_RECHAZO: motivo
}, usuario);

module.exports = { enviar, resolver, rechazar };
