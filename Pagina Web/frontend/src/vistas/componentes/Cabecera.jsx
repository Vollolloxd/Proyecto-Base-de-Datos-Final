// Titulo de pagina con descripcion y acciones
export default function Cabecera({ titulo, descripcion, children }) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
                <h1>{titulo}</h1>
                {descripcion && <p className="mt-1.5 max-w-3xl text-sm text-suave">{descripcion}</p>}
            </div>
            {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
        </div>
    );
}
