// Logica de los mantenedores: arma los parametros P_* de cada procedimiento segun la definicion del recurso
const { validarClave, hashClave } = require('./claves');

function prepararCuerpo(recurso, cuerpo, creando) {
    if (!recurso.claveAHash) {
        return cuerpo;
    }
    const { CLAVE, ...resto } = cuerpo;
    if (creando || CLAVE) {
        validarClave(CLAVE);
    }
    return { ...resto, PASSWORD_HASH: CLAVE ? hashClave(CLAVE) : null };
}

function parametrosDesde(cuerpo, campos) {
    const params = {};
    for (const campo of campos) {
        params[`P_${campo}`] = cuerpo[campo];
    }
    return params;
}

function parametrosIds(recurso, id, id2) {
    const valores = [id, id2];
    const params = {};
    recurso.ids.forEach((campo, i) => {
        params[`P_${campo}`] = valores[i];
    });
    return params;
}

// Devuelve { params } o { faltante } si falta un filtro obligatorio en la consulta
function parametrosListar(recurso, consulta) {
    const params = {};
    if (recurso.conInactivos) {
        params.P_SOLO_ACTIVOS = consulta.todos === '1' ? 0 : 1;
    }
    for (const [param, nombre] of Object.entries(recurso.filtros || {})) {
        if (consulta[nombre] === undefined) {
            return { faltante: nombre };
        }
        params[param] = consulta[nombre];
    }
    return { params };
}

function parametrosCrear(recurso, cuerpoRecibido, usuario) {
    const cuerpo = prepararCuerpo(recurso, cuerpoRecibido, true);
    const params = {
        ...(recurso.ids.length > 1 ? parametrosDesde(cuerpo, recurso.ids) : {}),
        ...parametrosDesde(cuerpo, recurso.campos),
        ...parametrosDesde(cuerpo, recurso.soloAlCrear || [])
    };
    if (recurso.usuarioAlCrear) {
        params[recurso.usuarioAlCrear] = usuario.id;
    }
    return params;
}

function parametrosModificar(recurso, id, id2, cuerpoRecibido) {
    return {
        ...parametrosIds(recurso, id, id2),
        ...parametrosDesde(prepararCuerpo(recurso, cuerpoRecibido, false), recurso.campos)
    };
}

module.exports = { parametrosListar, parametrosCrear, parametrosModificar, parametrosIds };
