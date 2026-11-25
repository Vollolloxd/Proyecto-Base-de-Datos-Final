// Vista de los avisos (toasts) de exito y error
import { CircleAlert, CircleCheck, X } from 'lucide-react';

const ESTILOS = {
    exito: { color: 'text-exito', Icono: CircleCheck },
    error: { color: 'text-peligro', Icono: CircleAlert }
};

export default function Avisos({ mensajes, alQuitar }) {
    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2"
            role="status" aria-live="polite">
            {mensajes.map((m) => {
                const { color, Icono } = ESTILOS[m.tipo];
                return (
                    <div key={m.id}
                        className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-borde bg-white py-3 pl-3.5 pr-2
                            text-sm text-tinta shadow-[0_8px_24px_-8px_rgba(38,34,31,0.25)]
                            ${m.saliendo ? 'animate-salir-derecha' : 'animate-entrar-derecha'}`}>
                        <Icono size={18} strokeWidth={1.75} className={`mt-0.5 shrink-0 ${color}`} aria-hidden="true" />
                        <span className="flex-1 leading-snug">
                            {m.tipo === 'error' && <span className="sr-only">Error: </span>}{m.texto}
                        </span>
                        <button type="button" onClick={() => alQuitar(m.id)} aria-label="Cerrar aviso"
                            className="-my-1 grid h-8 w-8 shrink-0 place-items-center rounded text-suave transition-colors hover:bg-stone-100 hover:text-tinta">
                            <X size={16} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
