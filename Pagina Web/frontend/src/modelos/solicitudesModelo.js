// Modelo del gestor de solicitudes web: enviar y resolver (aceptar o rechazar)
import { api } from './http.js';

export const enviar = (idSolicitud) =>
    api(`/gestores/solicitudes/${idSolicitud}/enviar`, { metodo: 'POST', cuerpo: undefined });

export const resolver = (idSolicitud, decision) =>
    api(`/gestores/solicitudes/${idSolicitud}/resolver`, { metodo: 'POST', cuerpo: { DECISION: decision } });
