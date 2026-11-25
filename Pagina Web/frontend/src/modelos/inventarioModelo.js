// Modelo de inventario: aplicar un movimiento actualiza el stock
import { api } from './http.js';

export const aplicarMovimiento = (idMovimiento) =>
    api(`/gestores/movimientos/${idMovimiento}/aplicar`, { metodo: 'POST' });
