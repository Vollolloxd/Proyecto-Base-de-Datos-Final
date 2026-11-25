// Controlador de avisos: cola de mensajes de exito y error con cierre automatico
import { createContext, useCallback, useContext, useState } from 'react';
import Avisos from '../vistas/componentes/Avisos.jsx';

const ContextoMensajes = createContext({ avisar: () => {} });
const SALIDA = 180;

export function ProveedorMensajes({ children }) {
    const [mensajes, setMensajes] = useState([]);

    const quitar = useCallback((id) => {
        setMensajes((m) => m.map((x) => (x.id === id ? { ...x, saliendo: true } : x)));
        setTimeout(() => setMensajes((m) => m.filter((x) => x.id !== id)), SALIDA);
    }, []);

    const avisar = useCallback((texto, tipo = 'exito') => {
        const id = Date.now() + Math.random();
        const duracion = tipo === 'error' ? 7000 : 3500;
        setMensajes((m) => [...m, { id, texto, tipo }]);
        setTimeout(() => quitar(id), duracion);
    }, [quitar]);

    return (
        <ContextoMensajes.Provider value={{ avisar }}>
            {children}
            <Avisos mensajes={mensajes} alQuitar={quitar} />
        </ContextoMensajes.Provider>
    );
}

export const useMensajes = () => useContext(ContextoMensajes);
