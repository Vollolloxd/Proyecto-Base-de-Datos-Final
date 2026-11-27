const db = require('../config/baseDatos');
const modelo = require('../modelos/mantenedorModelo');
const productos = require('../modelos/mantenedores/productos');
const productosCepas = require('../modelos/mantenedores/productosCepas');
const cepas = require('../modelos/mantenedores/cepas');
const { parametrosCrear, parametrosModificar } = require('./mantenedorServicio');
const { errorApp, traducirError } = require('../utilidades/errores');

async function crearProducto(cuerpo, usuario) {
    const activar = cuerpo.ACTIVAR_AL_GUARDAR === true || Number(cuerpo.ACTIVO ?? 1) === 1;
    if (!Array.isArray(cuerpo.CEPAS)) throw errorApp(20105, 'INGRESE LA COMPOSICION DEL PRODUCTO');

    const composicion = cuerpo.CEPAS.map((cepa) => ({
        ID_CEPA: Number(cepa?.ID_CEPA),
        PORCENTAJE: Number(cepa?.PORCENTAJE)
    }));
    const ids = new Set(composicion.map((cepa) => cepa.ID_CEPA));
    if (ids.size !== composicion.length || composicion.some(({ ID_CEPA, PORCENTAJE }) =>
        !Number.isSafeInteger(ID_CEPA) || ID_CEPA <= 0 || !Number.isFinite(PORCENTAJE) ||
        PORCENTAJE <= 0 || PORCENTAJE > 100 || Number(PORCENTAJE.toFixed(2)) !== PORCENTAJE
    )) {
        throw errorApp(20105, 'INGRESE CEPAS DISTINTAS Y PORCENTAJES VALIDOS DE HASTA DOS DECIMALES');
    }
    const total = composicion.reduce((suma, cepa) => suma + Math.round(cepa.PORCENTAJE * 100), 0);
    if (total > 10000 || (activar && total !== 10000)) {
        throw errorApp(20105, activar ? 'LAS CEPAS DEBEN SUMAR 100 PARA ACTIVAR EL PRODUCTO' : 'LAS CEPAS NO PUEDEN SUMAR MAS DE 100');
    }
    if (ids.size) {
        const activas = new Set((await modelo.listar(cepas, { P_SOLO_ACTIVOS: 1 }, usuario))
            .map((cepa) => Number(cepa.ID_CEPA)));
        if ([...ids].some((id) => !activas.has(id))) throw errorApp(20121, 'SELECCIONE CEPAS ACTIVAS');
    }

    await modelo.crear(productos, parametrosCrear(productos, { ...cuerpo, ACTIVO: 0 }, usuario), usuario);

    // Los procedimientos existentes confirman cada paso por separado.
    let idProducto;
    try {
        idProducto = await db.funcion('CEMJ_FN_PRODUCTO_OBTENER_ID', { P_CODIGO: cuerpo.CODIGO }, usuario);
        for (const cepa of composicion) {
            const datos = { ...cepa, ID_PRODUCTO: idProducto };
            await modelo.crear(productosCepas, parametrosCrear(productosCepas, datos, usuario), usuario);
        }
        if (activar) {
            const guardado = (await modelo.listar(productos, {}, usuario))
                .find((fila) => Number(fila.ID_PRODUCTO) === Number(idProducto));
            if (!guardado) throw errorApp(20100, 'NO SE PUDO CONSULTAR EL PRODUCTO CREADO');
            await modelo.modificar(productos, parametrosModificar(productos, idProducto, undefined,
                { ...guardado, ACTIVO: 1 }), usuario);
            const estado = await db.funcion('CEMJ_FN_PRODUCTO_ESTADO', { P_ID_PRODUCTO: idProducto }, usuario);
            if (Number(estado) !== 1) throw errorApp(20105, 'NO SE PUDO CONFIRMAR LA ACTIVACION');
        }
        return { ok: true, ID_PRODUCTO: idProducto, ACTIVO: Number(activar) };
    } catch (error) {
        return {
            ok: true,
            ID_PRODUCTO: idProducto,
            AVISO: `Se creó el producto, pero no se pudo completar la configuración. Revisa el producto y sus cepas. ${traducirError(error).mensaje}`
        };
    }
}

module.exports = crearProducto;
