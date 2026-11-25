// Vista: selector de cantidad (− n +) en botellas o kilos
import { Minus, Plus } from 'lucide-react';

export default function Cantidad({ valor, alCambiar, porKilo, deshabilitado, nombre }) {
    const n = Math.max(1, Number(valor) || 1);
    const claseBoton = 'grid h-11 w-10 place-items-center text-suave transition-colors hover:text-vino disabled:opacity-40';
    return (
        <div className="flex h-11 items-center rounded-md border border-control/50 bg-white">
            <button type="button" className={claseBoton} onClick={() => alCambiar(n - 1)} disabled={deshabilitado || n <= 1}
                aria-label={`Quitar 1 ${porKilo ? 'kilo' : 'botella'} de ${nombre}`}>
                <Minus size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <input type="number" min="1" value={valor} disabled={deshabilitado}
                onChange={(e) => alCambiar(e.target.value)}
                aria-label={`Cantidad de ${nombre} en ${porKilo ? 'kilos' : 'botellas'}`}
                className="!min-h-0 h-9 w-10 !border-0 !p-0 text-center tabular-nums [appearance:textfield] focus:!ring-0
                    [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            <button type="button" className={claseBoton} onClick={() => alCambiar(n + 1)} disabled={deshabilitado}
                aria-label={`Agregar 1 ${porKilo ? 'kilo' : 'botella'} de ${nombre}`}>
                <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
        </div>
    );
}
