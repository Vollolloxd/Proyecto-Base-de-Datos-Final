// Modelo de los 3 reportes (rutas de lectura con sus filtros)
import { consulta } from './http.js';

export const rutaRanking = (anio, mes) => `/reportes/ranking-productos${consulta({ anio, mes })}`;
export const rutaVentasCanal = (anio) => `/reportes/ventas-canal${consulta({ anio })}`;
export const rutaStockCritico = (dias, soloAlertas) =>
    `/reportes/stock-critico${consulta({ dias, soloAlertas: soloAlertas ? 1 : 0 })}`;
