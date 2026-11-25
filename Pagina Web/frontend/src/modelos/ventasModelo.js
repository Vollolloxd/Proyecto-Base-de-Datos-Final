// Modelo de ventas: listado, detalle, venta presencial, agregar productos, confirmar y anular
import { api, consulta } from './http.js';

export const rutaListar = (estado) => `/gestores/ventas${consulta({ estado })}`;
export const RUTA_TODAS = '/gestores/ventas';
export const rutaDetalle = (idVenta) => `/gestores/ventas/${idVenta}/detalle`;

export const crear = (datos) => api('/gestores/ventas', { metodo: 'POST', cuerpo: datos });

const accion = (idVenta, nombre, cuerpo) => api(`/gestores/ventas/${idVenta}/${nombre}`, { metodo: 'POST', cuerpo });
export const agregarProducto = (idVenta, cuerpo) => accion(idVenta, 'productos', cuerpo);
export const confirmar = (idVenta, cuerpo) => accion(idVenta, 'confirmar', cuerpo);
export const anular = (idVenta, cuerpo) => accion(idVenta, 'anular', cuerpo);
