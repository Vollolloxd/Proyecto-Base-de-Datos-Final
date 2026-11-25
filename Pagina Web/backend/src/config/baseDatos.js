// Conexion a Oracle: la aplicacion solo invoca procedimientos (CEMJ_PA_*) y funciones (CEMJ_FN_*)
const oracledb = require('oracledb');
const config = require('./entorno');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let pool;

async function iniciarPool() {
    pool = await oracledb.createPool({
        ...config.db,
        poolMin: 1,
        poolMax: 10,
        poolIncrement: 1
    });
}

async function cerrarPool() {
    if (pool) {
        await pool.close(5);
    }
}

const salidaNumero = () => ({ dir: oracledb.BIND_OUT, type: oracledb.NUMBER });
const salidaTexto = (largo = 200) => ({ dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: largo });
const salidaCursor = () => ({ dir: oracledb.BIND_OUT, type: oracledb.CURSOR });

function esSalida(valor) {
    return valor !== null && typeof valor === 'object' && valor.dir !== undefined;
}

function armarLlamada(params) {
    const binds = {};
    const argumentos = [];
    for (const [nombre, valor] of Object.entries(params)) {
        argumentos.push(`${nombre} => :${nombre}`);
        if (esSalida(valor)) {
            binds[nombre] = valor;
        } else {
            binds[nombre] = { val: valor === undefined || valor === '' ? null : valor };
        }
    }
    return { binds, argumentos: argumentos.join(', ') };
}

async function conConexion(usuario, trabajo) {
    const conexion = await pool.getConnection();
    try {
        conexion.clientId = usuario ? String(usuario.id) : '';
        return await trabajo(conexion);
    } finally {
        await conexion.close();
    }
}

async function ejecutar(procedimiento, params = {}, usuario = null) {
    return conConexion(usuario, async (conexion) => {
        const { binds, argumentos } = armarLlamada(params);
        const resultado = await conexion.execute(
            `BEGIN ${procedimiento}(${argumentos}); END;`, binds);
        return resultado.outBinds || {};
    });
}

async function listar(procedimiento, params = {}, usuario = null) {
    return conConexion(usuario, async (conexion) => {
        const { binds, argumentos } = armarLlamada({ P_CURSOR: salidaCursor(), ...params });
        const resultado = await conexion.execute(
            `BEGIN ${procedimiento}(${argumentos}); END;`, binds);
        const cursor = resultado.outBinds.P_CURSOR;
        try {
            return await cursor.getRows();
        } finally {
            await cursor.close();
        }
    });
}

async function funcion(nombre, params = {}, usuario = null) {
    return conConexion(usuario, async (conexion) => {
        const { binds, argumentos } = armarLlamada(params);
        binds.RESULTADO = salidaNumero();
        const resultado = await conexion.execute(
            `BEGIN :RESULTADO := ${nombre}(${argumentos}); END;`, binds);
        return resultado.outBinds.RESULTADO;
    });
}

async function probarConexion() {
    return conConexion(null, (conexion) => conexion.ping());
}

module.exports = {
    iniciarPool, cerrarPool, ejecutar, listar, funcion, probarConexion,
    salidaNumero, salidaTexto
};
