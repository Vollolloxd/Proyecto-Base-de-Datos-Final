const numeros = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 12 });

export function mensajeValidacion({ validity: estado, type, min, max, step, minLength, maxLength }) {
    if (estado.badInput) return 'Ingresa un número válido.';
    if (estado.valueMissing) {
        return type === 'select-one' || type === 'radio' ? 'Selecciona una opción.' : 'Completa este campo.';
    }
    if (estado.rangeUnderflow) return `Ingresa un valor mayor o igual a ${numeros.format(Number(min))}.`;
    if (estado.rangeOverflow) return `Ingresa un valor menor o igual a ${numeros.format(Number(max))}.`;
    if (estado.stepMismatch) {
        return step === '1' || (!step && type === 'number')
            ? 'Ingresa un número entero.' : 'Ingresa un valor con el incremento indicado.';
    }
    if (estado.typeMismatch) {
        return type === 'email' ? 'Ingresa un correo electrónico válido.' : 'Ingresa una dirección web válida.';
    }
    if (estado.tooShort) return `Ingresa al menos ${minLength} caracteres.`;
    if (estado.tooLong) return `Ingresa como máximo ${maxLength} caracteres.`;
    if (estado.patternMismatch) return 'Usa el formato indicado para este campo.';
    return 'Revisa el valor de este campo.';
}

export function etiquetaValidacion(campo) {
    const etiqueta = campo.labels?.[0];
    const texto = etiqueta && Array.from(etiqueta.childNodes)
        .filter((nodo) => nodo.nodeType === 3)
        .map((nodo) => nodo.textContent).join(' ');
    return (campo.getAttribute('aria-label') || texto || campo.getAttribute('placeholder') || '').trim();
}
