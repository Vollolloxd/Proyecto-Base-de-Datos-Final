// Controlador de la cabecera de la tienda: fondo solido al desplazarse y menu movil (Escape lo cierra)
import { useEffect, useState } from 'react';

export function useEncabezadoTienda() {
    const [solido, setSolido] = useState(false);
    const [abierto, setAbierto] = useState(false);

    useEffect(() => {
        const alDesplazar = () => setSolido(window.scrollY > 24);
        alDesplazar();
        window.addEventListener('scroll', alDesplazar, { passive: true });
        return () => window.removeEventListener('scroll', alDesplazar);
    }, []);

    useEffect(() => {
        if (!abierto) return undefined;
        const tecla = (e) => e.key === 'Escape' && setAbierto(false);
        window.addEventListener('keydown', tecla);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', tecla);
            document.body.style.overflow = '';
        };
    }, [abierto]);

    return { solido, abierto, setAbierto };
}
