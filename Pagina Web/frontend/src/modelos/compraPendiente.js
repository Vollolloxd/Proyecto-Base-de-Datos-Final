// Producto que el visitante quiso comprar antes de iniciar sesion (sessionStorage)
const CLAVE_PENDIENTE = 'vina-alborada-compra-pendiente';

export function leerPendiente() {
    try {
        return JSON.parse(sessionStorage.getItem(CLAVE_PENDIENTE));
    } catch {
        return null;
    }
}

export function guardarPendiente(valor) {
    try {
        if (valor) sessionStorage.setItem(CLAVE_PENDIENTE, JSON.stringify(valor));
        else sessionStorage.removeItem(CLAVE_PENDIENTE);
    } catch { }
}
