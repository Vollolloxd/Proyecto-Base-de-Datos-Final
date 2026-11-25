// Vista: seccion "Los más vendidos" (ranking calculado por la base de datos)
import Destacado from './Destacado.jsx';

export default function SeccionDestacados({ destacados, agregando, alComprar }) {
    if (destacados.length === 0) return null;
    return (
        <section id="destacados" aria-labelledby="titulo-destacados"
            className="tema-oscuro scroll-mt-16 border-t border-carbon-borde bg-carbon text-inverso">
            <div className="mx-auto max-w-tienda px-4 py-20 sm:px-8 lg:px-14 lg:py-24">
                <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
                    <h2 id="titulo-destacados" className="font-marca text-4xl font-medium tracking-[-0.005em] lg:text-5xl">
                        Los más vendidos
                    </h2>
                    <p className="max-w-sm text-sm text-inverso-suave">
                        Según las ventas confirmadas de los últimos 30 días.
                    </p>
                </div>
                <div className="grid gap-x-8 gap-y-14 md:grid-cols-3">
                    {destacados.map(({ p, posicion }) => (
                        <Destacado key={p.ID_PRODUCTO} p={p} posicion={posicion}
                            agregando={agregando === p.ID_PRODUCTO}
                            alAgregar={() => alComprar(p)} />
                    ))}
                </div>
            </div>
        </section>
    );
}
