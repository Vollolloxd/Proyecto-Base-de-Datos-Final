// Cliente HTTP de la API: agrega el token, interpreta errores y cierra la sesion si expiro
import { borrarSesion, leerSesion } from './almacenSesion.js';

export function consulta(parametros = {}) {
    const p = new URLSearchParams();
    Object.entries(parametros).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== '') {
            p.append(clave, valor);
        }
    });
    const texto = p.toString();
    return texto ? `?${texto}` : '';
}

export async function api(ruta, { metodo = 'GET', cuerpo } = {}) {
    const sesion = leerSesion();
    const respuesta = await fetch(`/api${ruta}`, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
            ...(sesion?.token ? { Authorization: `Bearer ${sesion.token}` } : {})
        },
        body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined
    });

    const texto = await respuesta.text();
    let datos = null;
    if (texto) {
        try {
            datos = JSON.parse(texto);
        } catch {
            datos = null;
        }
    }

    if (respuesta.status === 401 && sesion && !ruta.startsWith('/acceso/login')) {
        borrarSesion();
        window.location.assign('/login');
    }
    if (!respuesta.ok) {
        throw new Error(datos?.error || `ERROR ${respuesta.status}`);
    }
    return datos;
}
