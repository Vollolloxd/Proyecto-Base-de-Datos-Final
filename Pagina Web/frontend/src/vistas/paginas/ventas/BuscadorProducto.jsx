import { useId, useRef } from 'react';
import { dinero, normalizar } from '../../../utilidades/formato.js';

export default function BuscadorProducto({ productos, consulta, seleccionado, alBuscar, alSeleccionar }) {
    const id = useId();
    const entrada = useRef(null);
    const terminos = normalizar(consulta.trim()).split(/\s+/).filter(Boolean);
    const resultados = terminos.length && !seleccionado ? productos.filter((producto) => {
        const texto = normalizar([producto.CODIGO, producto.NOMBRE, producto.CATEGORIA, producto.FORMATO].join(' '));
        return terminos.every((termino) => texto.includes(termino));
    }) : [];

    function seleccionar(producto) {
        alSeleccionar(producto);
        entrada.current?.focus();
    }

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-medium">Buscar producto</label>
            <input id={id} ref={entrada} type="search" autoComplete="off" className="w-full"
                placeholder="Nombre, código, categoría o formato"
                value={seleccionado ? seleccionado.NOMBRE : consulta}
                onChange={(e) => alBuscar(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
                    e.preventDefault();
                    if (resultados.length === 1) seleccionar(resultados[0]);
                }} />
            {seleccionado && (
                <p role="status" className="text-sm text-suave">
                    Seleccionado · {seleccionado.CODIGO} · {dinero(seleccionado.PRECIO_ACTUAL)} · Stock {seleccionado.STOCK_ACTUAL}
                </p>
            )}
            {!seleccionado && terminos.length > 0 && (resultados.length ? (
                <ul aria-label="Productos encontrados" className="max-h-60 divide-y divide-borde overflow-y-auto rounded-md border border-borde bg-white">
                    {resultados.map((producto) => (
                        <li key={producto.ID_PRODUCTO}>
                            <button type="button" onClick={() => seleccionar(producto)}
                                className="flex w-full flex-wrap justify-between gap-x-4 gap-y-1 px-3 py-2 text-left text-sm hover:bg-vino-claro focus-visible:bg-vino-claro">
                                <span className="min-w-0">
                                    <span className="block font-semibold">{producto.NOMBRE}</span>
                                    <span className="text-xs text-suave">
                                        {[producto.CODIGO, producto.FORMATO].filter(Boolean).join(' · ')}
                                    </span>
                                </span>
                                <span className="text-right">
                                    <span className="block font-medium">{dinero(producto.PRECIO_ACTUAL)}</span>
                                    <span className="text-xs text-suave">Stock {producto.STOCK_ACTUAL}</span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p role="status" className="text-sm text-suave">No se encontraron productos.</p>
            ))}
        </div>
    );
}
