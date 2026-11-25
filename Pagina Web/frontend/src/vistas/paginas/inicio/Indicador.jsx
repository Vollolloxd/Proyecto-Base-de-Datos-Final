// Vista: indicador del resumen (etiqueta, valor y detalle) que enlaza a su modulo
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Indicador({ a, etiqueta, valor, detalle, alerta }) {
    return (
        <Link to={a} className="group flex flex-col gap-1 px-6 py-5 text-tinta no-underline transition-colors duration-150 hover:bg-stone-50">
            <span className="text-sm text-suave">{etiqueta}</span>
            <strong className={`text-[2rem] font-semibold leading-tight tracking-[-0.02em] tabular-nums ${alerta ? 'text-peligro' : ''}`}>
                {valor}
            </strong>
            <span className="flex items-center gap-1.5 text-sm text-suave">
                {detalle}
                <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true"
                    className="opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </span>
        </Link>
    );
}
