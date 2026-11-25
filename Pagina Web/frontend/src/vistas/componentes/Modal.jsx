// Ventana modal con foco gestionado
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ANCHOS = { chico: 'max-w-md', normal: 'max-w-2xl', grande: 'max-w-4xl' };
const DURACION_SALIDA = 160;

export default function Modal({ titulo, abierto, alCerrar, children, ancho = 'normal' }) {
    const [montado, setMontado] = useState(abierto);
    const ultimo = useRef({ titulo, children });
    const caja = useRef(null);
    const cerrar = useRef(alCerrar);
    cerrar.current = alCerrar;
    if (abierto) ultimo.current = { titulo, children };

    useEffect(() => {
        if (abierto) {
            setMontado(true);
            return undefined;
        }
        const t = setTimeout(() => setMontado(false), DURACION_SALIDA);
        return () => clearTimeout(t);
    }, [abierto]);

    useEffect(() => {
        if (!abierto) return undefined;
        const anterior = document.activeElement;
        const tecla = (e) => e.key === 'Escape' && cerrar.current();
        window.addEventListener('keydown', tecla);
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            if (caja.current && !caja.current.contains(document.activeElement)) caja.current.focus();
        });
        return () => {
            window.removeEventListener('keydown', tecla);
            document.body.style.overflow = '';
            if (anterior && typeof anterior.focus === 'function') anterior.focus();
        };
    }, [abierto]);

    if (!montado && !abierto) return null;
    const saliendo = !abierto;
    return createPortal(
        <div className={`fixed inset-0 z-50 overflow-y-auto bg-carbon/50 transition-opacity duration-150 ${saliendo ? 'opacity-0' : 'animate-difuminar'}`}
            onMouseDown={saliendo ? undefined : alCerrar}>
            <div className="flex min-h-full items-center justify-center px-4 py-8">
                <div ref={caja} tabIndex={-1}
                    className={`w-full rounded-lg bg-white shadow-[0_24px_48px_-12px_rgba(20,18,16,0.35)] outline-none transition-[opacity,transform] duration-150 ${ANCHOS[ancho]}
                        ${saliendo ? 'translate-y-1 scale-[.98] opacity-0' : 'animate-escalar'}`}
                    role="dialog" aria-modal="true" aria-label={ultimo.current.titulo} onMouseDown={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between gap-4 border-b border-borde py-3 pl-6 pr-3">
                        <h2>{ultimo.current.titulo}</h2>
                        <button type="button" onClick={alCerrar} aria-label="Cerrar"
                            className="grid h-10 w-10 place-items-center rounded-md text-suave transition-colors hover:bg-stone-100 hover:text-tinta">
                            <X size={20} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                    </div>
                    <div className="p-6">{ultimo.current.children}</div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export function Pie({ children }) {
    return <div className="mt-6 flex flex-wrap justify-end gap-2">{children}</div>;
}
