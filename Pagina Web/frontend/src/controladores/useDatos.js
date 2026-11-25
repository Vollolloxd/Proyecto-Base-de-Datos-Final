// Controlador de lectura: carga datos de una ruta del modelo y expone cargando, error y recargar
import { useCallback, useEffect, useState } from 'react';
import { api } from '../modelos/http.js';

export function useDatos(ruta, { activo = true } = {}) {
    const [datos, setDatos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const recargar = useCallback(async () => {
        if (!activo || !ruta) {
            setCargando(false);
            return;
        }
        setCargando(true);
        try {
            setDatos(await api(ruta));
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }, [ruta, activo]);

    useEffect(() => { recargar(); }, [recargar]);

    return { datos, cargando, error, recargar };
}
