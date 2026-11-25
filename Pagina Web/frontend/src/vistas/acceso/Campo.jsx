// Vista: campo de formulario con etiqueta visible, marca de obligatorio y ayuda
export default function Campo({ id, etiqueta, requerido, ayuda, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium">
                {etiqueta}{requerido && <span className="text-peligro" aria-hidden="true"> *</span>}
            </label>
            {children}
            {ayuda && <small className="text-xs text-suave">{ayuda}</small>}
        </div>
    );
}
