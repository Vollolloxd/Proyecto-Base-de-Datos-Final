// Controlador de inventario: stock de productos activos y aplicacion de movimientos (G1)
import { useState } from 'react';
import * as inventarioModelo from '../modelos/inventarioModelo.js';
import { rutaListar } from '../modelos/mantenedoresModelo.js';
import { useDatos } from './useDatos.js';
import { useMensajes } from './MensajesContexto.jsx';

export function useInventario() {
    const { avisar } = useMensajes();
    const [recargar, setRecargar] = useState(0);
    const { datos: productos, recargar: recargarStock } = useDatos(rutaListar('productos', { r: recargar }));
    const activos = productos.filter((p) => Number(p.ACTIVO) === 1);

    async function aplicar(fila, recargarMovs) {
        if (!window.confirm(`¿Aplicar el movimiento folio ${fila.NUMERO_FOLIO}? El stock se actualizará.`)) return;
        try {
            await inventarioModelo.aplicarMovimiento(fila.ID_MOVIMIENTO);
            avisar('Movimiento aplicado: stock actualizado');
            recargarMovs();
            recargarStock();
            setRecargar((n) => n + 1);
        } catch (err) {
            avisar(err.message, 'error');
        }
    }

    return { productos, activos, recargar, aplicar };
}
