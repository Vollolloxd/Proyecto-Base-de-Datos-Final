// Clasificacion de productos: uva por kilo y tipo de vino (tinto, blanco o rosado)
import { esPorKilo, normalizar } from './formato.js';

export const esUva = (p) => esPorKilo(p.UNIDAD_MEDIDA);

export function tipoDeVino(p) {
    const texto = normalizar(`${p.NOMBRE} ${p.COMPOSICION || ''}`);
    if (/\brose\b|rosado/.test(texto)) return 'rosado';
    if (/sauvignon blanc|chardonnay|blanco|semillon|riesling|moscatel|viognier/.test(texto)) return 'blanco';
    return 'tinto';
}
