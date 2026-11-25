// Vistas compartidas del monitoreo: barra de filtros y selector de periodo
export function Barra({ children }) {
    return <div className="mb-3 flex flex-wrap items-center gap-4">{children}</div>;
}

export function SelectorDias({ valor, alCambiar }) {
    return (
        <label className="filtro">Período <select value={valor} onChange={(e) => alCambiar(e.target.value)}>
            <option value={1}>Hoy</option><option value={7}>7 días</option>
            <option value={30}>30 días</option><option value={365}>1 año</option>
        </select></label>
    );
}
