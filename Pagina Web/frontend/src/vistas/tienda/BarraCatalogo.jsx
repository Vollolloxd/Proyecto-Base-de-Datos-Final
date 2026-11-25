// Vista: barra del catalogo con resumen, buscador y orden
import { Search } from 'lucide-react';

const ORDENES = {
    vendidos: 'Más vendidos primero',
    menorPrecio: 'Precio: menor a mayor',
    mayorPrecio: 'Precio: mayor a menor',
    nombre: 'Nombre (A-Z)'
};

export default function BarraCatalogo({ busqueda, alBuscar, orden, alOrdenar, resultados, hayUva }) {
    return (
        <div className="mb-10 flex flex-col gap-4 border-y border-borde py-4 lg:flex-row lg:items-center">
            <p className="text-sm text-suave">
                {busqueda.trim()
                    ? `${resultados} resultado${resultados === 1 ? '' : 's'} para «${busqueda.trim()}»`
                    : hayUva ? 'Vinos embotellados y uva a granel por kilo.' : 'Vinos embotellados.'}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row lg:ml-auto">
                <label className="relative sm:w-72">
                    <span className="sr-only">Buscar por nombre o cepa</span>
                    <Search size={18} strokeWidth={1.75} aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-suave" />
                    <input type="search" placeholder={hayUva ? 'Buscar vino, uva o cepa' : 'Buscar vino o cepa'} value={busqueda}
                        onChange={(e) => alBuscar(e.target.value)} className="w-full !pl-10" />
                </label>
                <label className="flex items-center gap-2 text-sm text-suave">
                    <span className="shrink-0">Ordenar</span>
                    <select value={orden} onChange={(e) => alOrdenar(e.target.value)} className="flex-1 sm:flex-none">
                        {Object.entries(ORDENES).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
                    </select>
                </label>
            </div>
        </div>
    );
}
