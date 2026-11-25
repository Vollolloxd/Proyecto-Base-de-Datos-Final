// Metodo de pago elegido por el cliente: va en la primera linea de OBSERVACIONES de su solicitud ("PAGO: <metodo>")
const PREFIJO = 'PAGO: ';

function extraer(observaciones) {
    const texto = observaciones || '';
    if (!texto.startsWith(PREFIJO)) return { metodo: null, nota: texto };
    const salto = texto.indexOf('\n');
    return {
        metodo: (salto < 0 ? texto.slice(PREFIJO.length) : texto.slice(PREFIJO.length, salto)).trim() || null,
        nota: salto < 0 ? '' : texto.slice(salto + 1)
    };
}

function componer(nombreMetodo, observaciones) {
    const { nota } = extraer(observaciones);
    return `${PREFIJO}${nombreMetodo}${nota ? `\n${nota}` : ''}`.slice(0, 500);
}

module.exports = { extraer, componer };
