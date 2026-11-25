// Vista: mensaje de error del formulario (icono + texto, no solo color)
import { CircleAlert } from 'lucide-react';

export default function AlertaError({ texto }) {
    if (!texto) return null;
    return (
        <div className="flex animate-aparecer items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-peligro" role="alert">
            <CircleAlert size={18} strokeWidth={1.75} className="mt-px shrink-0" aria-hidden="true" />
            <span>{texto}</span>
        </div>
    );
}
