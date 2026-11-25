// RUT chileno: validacion del digito verificador y formato 12.345.678-9
export function rutValido(rut) {
    const limpio = rut.replace(/[.\s-]/g, '').toUpperCase();
    if (!/^\d{7,8}[\dK]$/.test(limpio)) return false;
    const cuerpo = limpio.slice(0, -1);
    let suma = 0;
    let factor = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * factor;
        factor = factor === 7 ? 2 : factor + 1;
    }
    const resto = 11 - (suma % 11);
    const dv = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
    return dv === limpio.slice(-1);
}

export function formatearRut(rut) {
    const limpio = rut.replace(/[^\dkK]/g, '').toUpperCase();
    if (limpio.length < 2) return limpio;
    const cuerpo = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${cuerpo}-${limpio.slice(-1)}`;
}
