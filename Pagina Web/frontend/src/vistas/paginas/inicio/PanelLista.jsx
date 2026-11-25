// Vista: panel con titulo, enlace al modulo y una lista (o un mensaje si esta vacia)
import { Link } from 'react-router-dom';

export function PanelLista({ titulo, enlace, textoEnlace, children }) {
    return (
        <section className="flex min-w-0 flex-col rounded-lg border border-borde bg-white">
            <div className="flex min-h-[56px] items-center justify-between gap-3 border-b border-borde px-5">
                <h2 className="text-base">{titulo}</h2>
                {enlace && <Link to={enlace} className="text-sm font-medium no-underline hover:underline">{textoEnlace}</Link>}
            </div>
            {children}
        </section>
    );
}

export const ListaVacia = ({ texto }) => <p className="px-5 py-8 text-center text-sm text-suave">{texto}</p>;
