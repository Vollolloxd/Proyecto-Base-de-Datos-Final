// Vista: cabecera del panel (abrir menu, ruta actual, alerta de stock, perfil y ver tienda)
import { ArrowUpRight, Menu, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import Insignia from '../componentes/Insignia.jsx';

export default function CabeceraPanel({ panel }) {
    const { usuario, tiene, migas, veAlertas, alertas, menuAbierto, setMenuAbierto } = panel;
    return (
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-borde bg-white px-4 md:px-8">
            <button type="button" className="-ml-2 grid h-11 w-11 place-items-center rounded-md text-tinta hover:bg-stone-100 lg:hidden"
                onClick={() => setMenuAbierto(true)} aria-label="Abrir menú" aria-expanded={menuAbierto}>
                <Menu size={22} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1 truncate text-sm text-suave">
                {migas && (
                    <>
                        <span className="hidden sm:inline">{migas.grupo} <span aria-hidden="true" className="mx-1.5 text-borde">/</span></span>
                        <span className="font-medium text-tinta">{migas.texto}</span>
                    </>
                )}
            </div>
            {veAlertas && alertas?.cantidad > 0 && (
                <Link to={tiene('REPORTES') ? '/reportes' : '/inventario'}
                    className="inline-flex min-h-[36px] shrink-0 items-center gap-2 rounded-md bg-amber-50 px-3 text-xs font-medium text-aviso no-underline transition-colors hover:bg-amber-200/60">
                    <TriangleAlert size={16} strokeWidth={1.75} aria-hidden="true" />
                    <span className="tabular-nums">{alertas.cantidad}</span>
                    <span className="hidden sm:inline">bajo el stock mínimo</span>
                    <span className="sr-only sm:hidden">productos bajo el stock mínimo</span>
                </Link>
            )}
            <Insignia valor={usuario?.rol} />
            <Link to="/" className="btn btn-sec btn-sm hidden sm:inline-flex">
                Ver tienda <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </Link>
        </header>
    );
}
