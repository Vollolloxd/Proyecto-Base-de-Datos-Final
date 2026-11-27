import { esPorKilo } from '../../../utilidades/formato.js';

export function formatoProducto(valores, categoria) {
    const porPeso = esPorKilo(categoria?.UNIDAD_MEDIDA);
    const unidades = categoria ? (porPeso ? ['g', 'kg', 'T'] : ['ml', 'l']) : [];
    const formato = /^(\d+(?:[.,]\d+)?)\s*(ml|l|g|kg|t)$/i.exec(String(valores.FORMATO ?? '').trim());
    const anterior = unidades.find((unidad) => unidad.toLowerCase() === formato?.[2].toLowerCase());
    const medida = categoria?.UNIDAD_MEDIDA;
    const borrador = valores.FORMATO_EDICION?.medida === medida ? valores.FORMATO_EDICION : null;
    const seleccion = borrador?.unidad ?? anterior;
    return {
        porPeso,
        unidades,
        cantidad: borrador?.cantidad ?? (anterior ? formato[1].replace(',', '.') : ''),
        unidad: unidades.includes(seleccion) ? seleccion : ''
    };
}

export default function FormatoProducto({ valores, categoria, alCambiar }) {
    const { porPeso, unidades, cantidad, unidad } = formatoProducto(valores, categoria);
    const cambiar = (cambios) => alCambiar({
        ...valores,
        FORMATO_EDICION: { medida: categoria.UNIDAD_MEDIDA, cantidad, unidad, ...cambios }
    });

    return (
        <fieldset className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3" disabled={!categoria}>
            <legend className="mb-2 text-sm font-semibold">Formato del producto</legend>
            <label className="flex flex-col gap-1 text-sm font-medium">
                {categoria ? (porPeso ? 'Peso' : 'Volumen por botella') : 'Cantidad'}
                <input type="number" min="0" step="any" required value={cantidad}
                    placeholder={categoria ? (porPeso ? '1' : '750') : undefined}
                    onChange={(e) => cambiar({ cantidad: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
                Unidad
                <select required value={unidad}
                    onChange={(e) => cambiar({ unidad: e.target.value })}>
                    <option value="">Selecciona una unidad</option>
                    {unidades.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
                </select>
            </label>
        </fieldset>
    );
}
