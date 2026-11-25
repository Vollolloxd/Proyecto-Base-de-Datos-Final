// Logica de acceso: inicio de sesion, registro de cliente web y cambio de contraseña
const accesoModelo = require('../modelos/accesoModelo');
const { errorApp } = require('../utilidades/errores');
const { validarClave, hashClave, verificarClave } = require('./claves');
const { crearToken } = require('./tokens');

const normalizarCorreo = (correo) => String(correo || '').trim().toUpperCase();

async function iniciarSesion(correoIngresado, clave) {
    const correo = normalizarCorreo(correoIngresado);
    if (!correo || !clave) {
        throw errorApp(20500, 'DEBE INGRESAR CORREO Y CONTRASENA');
    }

    const datos = await accesoModelo.datosLogin(correo);

    if (!datos.P_ID_USUARIO || !verificarClave(clave, datos.P_PASSWORD_HASH)) {
        await accesoModelo.registrarResultado(correo, datos.P_ID_USUARIO, false);
        throw errorApp(20502, 'CORREO O CONTRASENA INCORRECTOS');
    }

    if (datos.P_ACTIVO !== 1 || datos.P_ROL_ACTIVO !== 1) {
        await accesoModelo.registrarIntento(correo, datos.P_ID_USUARIO, false, 'USUARIO INACTIVO');
        throw errorApp(20503, 'USUARIO INACTIVO, CONTACTE AL ADMINISTRADOR');
    }

    await accesoModelo.registrarResultado(correo, datos.P_ID_USUARIO, true);

    const usuario = {
        id: datos.P_ID_USUARIO,
        correo,
        rol: datos.P_ROL,
        idCliente: datos.P_ID_CLIENTE
    };
    const modulos = await accesoModelo.modulosDe(usuario);
    return { token: crearToken(usuario), usuario, modulos };
}

async function registrarCliente(d) {
    validarClave(d.clave);
    const esEmpresa = String(d.tipoCliente).toUpperCase() === 'EMPRESA';
    await accesoModelo.registrarCliente({
        tipoCliente: esEmpresa ? 'EMPRESA' : 'NATURAL',
        rut: d.rut,
        nombre: esEmpresa ? null : d.nombre,
        apellido1: esEmpresa ? null : d.apellido1,
        apellido2: esEmpresa ? null : d.apellido2,
        razonSocial: esEmpresa ? d.razonSocial : null,
        telefono: d.telefono,
        correo: d.correo
    }, hashClave(d.clave));
    return iniciarSesion(d.correo, d.clave);
}

async function datosSesion(usuario) {
    return { usuario, modulos: await accesoModelo.modulosDe(usuario) };
}

async function cambiarClave(usuario, claveActual, claveNueva) {
    validarClave(claveNueva, 20504);
    const datos = await accesoModelo.datosLogin(usuario.correo);
    if (datos.P_ID_USUARIO !== usuario.id || !verificarClave(claveActual, datos.P_PASSWORD_HASH)) {
        throw errorApp(20505, 'LA CONTRASENA ACTUAL NO ES CORRECTA');
    }
    await accesoModelo.cambiarClave(usuario, hashClave(claveNueva));
}

module.exports = { iniciarSesion, registrarCliente, datosSesion, cambiarClave };
