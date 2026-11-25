// Modelo de monitoreo (rutas de lectura con sus filtros)
import { consulta } from './http.js';

export const RUTA_ALERTAS_PENDIENTES = '/monitoreo/alertas-pendientes';
export const rutaAuditoria = (tabla, dias) => `/monitoreo/auditoria${consulta({ tabla, dias })}`;
export const rutaAlertasStock = (soloBajoMinimo, dias) =>
    `/monitoreo/alertas-stock${consulta({ soloBajoMinimo: soloBajoMinimo ? 1 : 0, dias })}`;
export const rutaLogins = (soloFallidos, dias) =>
    `/monitoreo/logins${consulta({ soloFallidos: soloFallidos ? 1 : 0, dias })}`;
