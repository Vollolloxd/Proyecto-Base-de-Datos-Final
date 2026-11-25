// A donde llevar al usuario despues de iniciar sesion (respeta ?volver= si es una ruta interna)
export function destinoTrasEntrar(usuario, volver) {
    const valido = volver && volver.startsWith('/') && !volver.startsWith('//') ? volver : null;
    if (usuario?.rol === 'CLIENTE') return valido || '/';
    return valido && valido !== '/' ? valido : '/inicio';
}
