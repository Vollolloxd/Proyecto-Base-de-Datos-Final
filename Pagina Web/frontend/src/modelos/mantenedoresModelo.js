// Modelo generico de mantenedores (CRUD): listar, crear, modificar, eliminar y reactivar
import { api, consulta } from './http.js';

const base = (recurso) => `/mantenedores/${recurso}`;

export const rutaListar = (recurso, parametros) => `${base(recurso)}${consulta(parametros)}`;
export const RUTA_PRODUCTOS = base('productos');
export const RUTA_CLIENTES = base('clientes');
export const RUTA_SOLICITUDES = base('solicitudes');
export const RUTA_CATEGORIAS = base('categorias');
export const RUTA_CEPAS = base('cepas');
export const RUTA_ROLES = base('roles');
export const RUTA_METODOS_PAGO = base('metodos-pago');

export const listar = (recurso, parametros) => api(rutaListar(recurso, parametros));
export const crear = (recurso, cuerpo) => api(base(recurso), { metodo: 'POST', cuerpo });
export const modificar = (recurso, rutaIds, cuerpo) => api(`${base(recurso)}/${rutaIds}`, { metodo: 'PUT', cuerpo });
export const eliminar = (recurso, rutaIds) => api(`${base(recurso)}/${rutaIds}`, { metodo: 'DELETE' });
export const reactivar = (recurso, rutaIds) => api(`${base(recurso)}/${rutaIds}/reactivar`, { metodo: 'PATCH' });
