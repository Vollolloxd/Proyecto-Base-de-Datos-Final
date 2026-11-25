// Separa el metodo de pago elegido por el cliente ("PAGO: <metodo>" en la primera linea) del resto de las observaciones
const PREFIJO = 'PAGO: ';

export function separarPago(observaciones) {
    const texto = observaciones || '';
    if (!texto.startsWith(PREFIJO)) return { metodo: null, nota: texto };
    const salto = texto.indexOf('\n');
    return {
        metodo: (salto < 0 ? texto.slice(PREFIJO.length) : texto.slice(PREFIJO.length, salto)).trim() || null,
        nota: salto < 0 ? '' : texto.slice(salto + 1)
    };
}
