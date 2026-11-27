import { nombrePropio, numero } from '../../../utilidades/formato.js';

export default function CepasProductoNuevo({ cepas, composicion, alCambiar, cargando, error, unaSola }) {
    const total = composicion.reduce((suma, cepa) =>
        suma + (cepa.ID_CEPA ? Math.round((Number(cepa.PORCENTAJE) || 0) * 100) : 0), 0) / 100;

    function cambiar(indice, cambios) {
        alCambiar(composicion.map((cepa, i) => i === indice ? { ...cepa, ...cambios } : cepa));
    }

    return (
        <fieldset className="mt-5 flex flex-col gap-3 rounded-lg border border-borde p-4">
            <legend className="px-1 text-sm font-semibold">Composición de cepas</legend>
            {error && <p role="alert" className="text-sm text-peligro">{error}</p>}
            {cargando && <p className="text-sm text-suave">Cargando cepas…</p>}
            {!cargando && !error && !cepas.length && <p className="text-sm text-suave">No hay cepas activas.</p>}
            {composicion.map((fila, indice) => {
                const opciones = cepas.filter((cepa) => !composicion.some((otra, i) =>
                    i !== indice && String(cepa.ID_CEPA) === String(otra.ID_CEPA)));
                return (
                    <div key={indice} className={unaSola ? 'grid gap-2' : 'grid grid-cols-[minmax(0,1fr)_6rem_auto] items-end gap-2'}>
                        <label className="flex flex-col gap-1 text-sm">
                            Cepa
                            <select value={fila.ID_CEPA} required
                                onChange={(e) => cambiar(indice, { ID_CEPA: e.target.value })}>
                                <option value="">Selecciona una cepa</option>
                                {opciones.map((cepa) => (
                                    <option key={cepa.ID_CEPA} value={cepa.ID_CEPA}>{nombrePropio(cepa.NOMBRE)}</option>
                                ))}
                            </select>
                        </label>
                        {!unaSola && (
                            <>
                                <label className="flex flex-col gap-1 text-sm">
                                    Porcentaje
                                    <input type="number" min="0.01" max="100" step="0.01" value={fila.PORCENTAJE}
                                        required
                                        onChange={(e) => cambiar(indice, { PORCENTAJE: e.target.value })} />
                                </label>
                                <button type="button" className="btn btn-sec btn-sm" aria-label={`Quitar cepa ${indice + 1}`}
                                    disabled={composicion.length === 1}
                                    onClick={() => alCambiar(composicion.filter((_, i) => i !== indice))}>
                                    Quitar
                                </button>
                            </>
                        )}
                    </div>
                );
            })}
            <div className="flex flex-wrap items-center justify-between gap-2">
                {!unaSola && (
                    <button type="button" className="btn btn-sec btn-sm" disabled={composicion.length >= cepas.length}
                        onClick={() => alCambiar([...composicion, { ID_CEPA: '', PORCENTAJE: Math.max(0, 100 - total) || '' }])}>
                        Agregar cepa
                    </button>
                )}
                <p className="text-sm" aria-live="polite">Total {numero(total)}%</p>
            </div>
        </fieldset>
    );
}
