// Vistas compartidas de ventas: volver al listado, dato de la ficha y panel de accion
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Volver = () => (
    <p className="mb-3 text-sm"><Link to="/ventas" className="inline-flex min-h-[36px] items-center gap-1.5 no-underline hover:underline"><ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />Volver a ventas</Link></p>
);

export function Dato({ etiqueta, children, ancho }) {
    return (
        <div className={ancho ? 'col-span-full text-red-700' : ''}>
            <span className="block text-xs font-medium uppercase tracking-wide text-suave">{etiqueta}</span>
            <span className="text-sm">{children}</span>
        </div>
    );
}

export function PanelAccion({ titulo, ayuda, onSubmit, children }) {
    return (
        <form className="tarjeta flex flex-col gap-3" onSubmit={onSubmit}>
            <div>
                <h3>{titulo}</h3>
                <p className="mt-0.5 text-xs text-suave">{ayuda}</p>
            </div>
            {children}
        </form>
    );
}
