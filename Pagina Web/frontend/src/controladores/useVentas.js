// Controlador del listado de ventas: filtro por estado y busqueda (las mas nuevas primero)
import { useMemo, useState } from 'react';
import { rutaListar } from '../modelos/ventasModelo.js';
import { normalizar } from '../utilidades/formato.js';
import { useDatos } from './useDatos.js';

export function useVentas() {
    const [estado, setEstado] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const { datos: ventas, cargando } = useDatos(rutaListar(estado));

    const filas = useMemo(() => {
        const q = normalizar(busqueda.trim());
        const lista = [...ventas].reverse();
        return q ? lista.filter((v) => Object.values(v).some((x) => normalizar(x).includes(q))) : lista;
    }, [ventas, busqueda]);

    return { ventas, filas, cargando, estado, setEstado, busqueda, setBusqueda };
}
