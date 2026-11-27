const modelo = require('../modelos/mantenedorModelo');
const categorias = require('../modelos/mantenedores/categorias');
const productos = require('../modelos/mantenedores/productos');
const { errorApp } = require('../utilidades/errores');

async function validarFormatoProducto(cuerpo, usuario, idProducto) {
    const maximo = Number(new Intl.DateTimeFormat('es-CL', { year: 'numeric', timeZone: 'America/Santiago' }).format(new Date()));
    const anada = cuerpo.ANADA;
    if (anada != null && anada !== '' &&
        (!['string', 'number'].includes(typeof anada) || !Number.isInteger(Number(anada)) ||
            Number(anada) < 1900 || Number(anada) > maximo)) {
        throw errorApp(20207, `La añada debe ser un año entero entre 1900 y ${maximo}.`);
    }

    const categoria = (await modelo.listar(categorias, { P_SOLO_ACTIVOS: 0 }, usuario))
        .find((fila) => String(fila.ID_CATEGORIA) === String(cuerpo.ID_CATEGORIA));
    if (!categoria) throw errorApp(20100, 'CATEGORIA NO ENCONTRADA');

    const porPeso = String(categoria.UNIDAD_MEDIDA).toUpperCase() === 'KG';
    if (porPeso && Array.isArray(cuerpo.CEPAS) &&
        (cuerpo.CEPAS.length !== 1 || Number(cuerpo.CEPAS[0]?.PORCENTAJE) !== 100)) {
        throw errorApp(20105, 'La uva a granel debe tener una sola cepa al 100 %.');
    }

    const unidades = porPeso ? ['g', 'kg', 't'] : ['ml', 'l'];
    const formato = String(cuerpo.FORMATO ?? '').trim();
    const partes = /^(\d+(?:[.,]\d+)?)\s*(ml|l|g|kg|t)$/i.exec(formato);
    if (partes && formato.length <= 50 && unidades.includes(partes[2].toLowerCase()) &&
        Number(partes[1].replace(',', '.')) > 0) {
        const unidad = partes[2].toLowerCase();
        return { ...cuerpo, FORMATO: `${partes[1].replace(',', '.')} ${unidad === 't' ? 'T' : unidad}` };
    }

    if (idProducto !== undefined) {
        const existente = (await modelo.listar(productos, {}, usuario))
            .find((fila) => String(fila.ID_PRODUCTO) === String(idProducto));
        if (existente && existente.FORMATO === cuerpo.FORMATO &&
            String(existente.ID_CATEGORIA) === String(cuerpo.ID_CATEGORIA)) return cuerpo;
    }

    throw errorApp(20238, porPeso
        ? 'INGRESE UN PESO MAYOR A CERO EN G, KG O T'
        : 'INGRESE UN VOLUMEN MAYOR A CERO EN ML O L');
}

module.exports = validarFormatoProducto;
