// Modelo de acceso: login, registro, datos de la sesion y cambio de contraseña
import { api } from './http.js';

export const iniciarSesion = (correo, clave) => api('/acceso/login', { metodo: 'POST', cuerpo: { correo, clave } });

export const registrar = (datos) => api('/acceso/registro', { metodo: 'POST', cuerpo: datos });

export const obtenerSesion = () => api('/acceso/sesion');

export const cambiarClave = (claveActual, claveNueva) =>
    api('/acceso/cambiar-clave', { metodo: 'POST', cuerpo: { claveActual, claveNueva } });
