// Modelo de acceso: datos de login, bitacora de intentos, modulos, registro de clientes y contraseñas
const db = require('../config/baseDatos');

const MODULOS = ['USUARIOS', 'CLIENTES', 'PRODUCTOS', 'METODOS_PAGO', 'INVENTARIO', 'VENTAS',
    'SOLICITUDES', 'REPORTES', 'MONITOREO', 'CATALOGO', 'MIS_SOLICITUDES'];

function datosLogin(correo) {
    return db.ejecutar('CEMJ_PA_LOGIN_DATOS', {
        P_CORREO: correo,
        P_ID_USUARIO: db.salidaNumero(),
        P_PASSWORD_HASH: db.salidaTexto(255),
        P_ACTIVO: db.salidaNumero(),
        P_ID_CLIENTE: db.salidaNumero(),
        P_ROL: db.salidaTexto(30),
        P_ROL_ACTIVO: db.salidaNumero()
    });
}

function registrarResultado(correo, idUsuario, exitoso) {
    return db.ejecutar('CEMJ_PA_LOGIN_RESULTADO',
        { P_CORREO: correo, P_ID_USUARIO: idUsuario, P_EXITOSO: exitoso ? 1 : 0 });
}

function registrarIntento(correo, idUsuario, exitoso, motivo) {
    return db.ejecutar('CEMJ_PA_LOGIN_REGISTRAR', {
        P_CORREO: correo, P_ID_USUARIO: idUsuario,
        P_EXITOSO: exitoso ? 1 : 0, P_MOTIVO: motivo
    });
}

async function modulosDe(usuario) {
    const salidas = {};
    for (const modulo of MODULOS) {
        salidas[`P_${modulo}`] = db.salidaNumero();
    }
    const salida = await db.ejecutar('CEMJ_PA_LOGIN_MODULOS',
        { P_ID_USUARIO: usuario.id, ...salidas }, usuario);
    return MODULOS.filter((modulo) => salida[`P_${modulo}`] === 1);
}

async function puedeAcceder(usuario, modulo) {
    const puede = await db.funcion('CEMJ_FN_PUEDE_ACCEDER',
        { P_ID_USUARIO: usuario.id, P_MODULO: modulo }, usuario);
    return puede === 1;
}

function registrarCliente(cliente, passwordHash) {
    return db.ejecutar('CEMJ_PA_REGISTRAR_CLIENTE', {
        P_TIPO_CLIENTE: cliente.tipoCliente,
        P_RUT: cliente.rut,
        P_NOMBRE: cliente.nombre,
        P_APELLIDO1: cliente.apellido1,
        P_APELLIDO2: cliente.apellido2,
        P_RAZON_SOCIAL: cliente.razonSocial,
        P_TELEFONO: cliente.telefono,
        P_CORREO: cliente.correo,
        P_PASSWORD_HASH: passwordHash,
        P_ID_USUARIO: db.salidaNumero(),
        P_ID_CLIENTE: db.salidaNumero()
    });
}

function cambiarClave(usuario, passwordHashNuevo) {
    return db.ejecutar('CEMJ_PA_USUARIO_CAMBIAR_CLAVE', {
        P_ID_USUARIO: usuario.id,
        P_PASSWORD_HASH_NUEVO: passwordHashNuevo
    }, usuario);
}

module.exports = {
    datosLogin, registrarResultado, registrarIntento, modulosDe, puedeAcceder, registrarCliente, cambiarClave
};
