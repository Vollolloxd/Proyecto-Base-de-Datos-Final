// Sesion guardada en el navegador (localStorage): token, usuario y modulos
const CLAVE_SESION = 'vina-alborada-sesion';

export function leerSesion() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_SESION));
    } catch {
        return null;
    }
}

export function guardarSesion(sesion) {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

export function borrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
}
