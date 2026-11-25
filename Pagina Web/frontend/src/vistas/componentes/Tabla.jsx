// Tabla con paginacion
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const ALINEAR = { derecha: 'text-right tabular-nums', centro: 'text-center' };

export default function Tabla({
    columnas, filas, acciones, vacio = 'No hay registros', claveFila, alClickFila, porPagina = 15
}) {
    const [pagina, setPagina] = useState(0);
    const totalPaginas = Math.max(1, Math.ceil(filas.length / porPagina));

    useEffect(() => {
        if (pagina > totalPaginas - 1) setPagina(0);
    }, [filas.length, pagina, totalPaginas]);

    const visibles = filas.slice(pagina * porPagina, (pagina + 1) * porPagina);
    const alinear = (c) => ALINEAR[c.alinear] || '';

    return (
        <div className="overflow-hidden rounded-lg border border-borde bg-white">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-borde bg-stone-50">
                            {columnas.map((c) => (
                                <th key={c.campo || c.titulo} scope="col"
                                    className={`whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-suave ${alinear(c)}`}>
                                    {c.titulo}
                                </th>
                            ))}
                            {acciones && (
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-suave">
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody key={pagina} className="animate-difuminar divide-y divide-stone-100">
                        {visibles.length === 0 ? (
                            <tr>
                                <td colSpan={columnas.length + (acciones ? 1 : 0)} className="px-4 py-10 text-center text-suave">
                                    {vacio}
                                </td>
                            </tr>
                        ) : visibles.map((fila, i) => (
                            <tr
                                key={claveFila ? claveFila(fila) : i}
                                onClick={alClickFila ? () => alClickFila(fila) : undefined}
                                className={`transition-colors duration-150 ${alClickFila ? 'cursor-pointer hover:bg-vino-claro' : 'hover:bg-stone-50'}`}
                            >
                                {columnas.map((c) => (
                                    <td key={c.campo || c.titulo} className={`h-12 px-4 py-2.5 align-middle ${alinear(c)}`}>
                                        {c.render ? c.render(fila) : fila[c.campo]}
                                    </td>
                                ))}
                                {acciones && (
                                    <td className="whitespace-nowrap px-4 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                                        {acciones(fila)}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filas.length > porPagina && (
                <div className="flex items-center justify-between gap-3 border-t border-borde px-4 py-2.5 text-xs text-suave">
                    <button type="button" className="btn btn-sec btn-sm"
                        disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>
                        <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" /> Anterior
                    </button>
                    <span className="tabular-nums">Página {pagina + 1} de {totalPaginas} · {filas.length} registros</span>
                    <button type="button" className="btn btn-sec btn-sm"
                        disabled={pagina >= totalPaginas - 1} onClick={() => setPagina(pagina + 1)}>
                        Siguiente <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    );
}
