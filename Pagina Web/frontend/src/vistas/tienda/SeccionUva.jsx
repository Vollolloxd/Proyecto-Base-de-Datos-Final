// Vista: seccion "Uva a granel" (solo si hay al menos una variedad activa)
import GrillaProductos from './GrillaProductos.jsx';

export default function SeccionUva({ hayUva, uvas, orden, propsGrilla }) {
    if (!hayUva) return null;
    return (
        <section id="uva" aria-labelledby="titulo-uva" className="scroll-mt-16 border-t border-borde bg-[#efe9df]">
            <div className="mx-auto max-w-tienda px-4 py-20 sm:px-8 lg:px-14 lg:py-24">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <h2 id="titulo-uva" className="font-marca text-4xl font-medium tracking-[-0.005em] lg:text-5xl">Uva a granel</h2>
                    <p className="max-w-sm text-sm text-suave">Venta por kilo. Indica los kilos que necesitas antes de agregar.</p>
                </div>
                {uvas.length === 0
                    ? <p className="py-8 text-center text-suave">No hay uva que coincida con la búsqueda.</p>
                    : <GrillaProductos productos={uvas} clave={orden} {...propsGrilla} fondo="bg-marfil group-hover:bg-white" />}
            </div>
        </section>
    );
}
