// Vista: producto destacado (ranking 01/02/03) en la seccion oscura de los mas vendidos
import { dinero, esPorKilo, nombrePropio } from '../../utilidades/formato.js';
import ImagenProducto from './ImagenProducto.jsx';

export default function Destacado({ p, posicion, alAgregar, agregando }) {
    const porKilo = esPorKilo(p.UNIDAD_MEDIDA);
    const disponible = p.DISPONIBILIDAD === 'DISPONIBLE';
    return (
        <article className="group flex flex-col">
            <div className="relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-sm bg-carbon-elevado">
                <span aria-hidden="true" className="absolute left-1/2 top-[18%] aspect-square w-[78%] -translate-x-1/2 rounded-full
                    bg-[radial-gradient(circle_at_50%_40%,#3a2a22_0%,#2a211c_55%,transparent_72%)]" />
                <span aria-hidden="true" className="absolute left-5 top-4 font-marca text-xl text-bronce tabular-nums">
                    {String(posicion).padStart(2, '0')}
                </span>
                <ImagenProducto p={p} className={`relative mb-[8%] transition-transform duration-300 ease-salida group-hover:-translate-y-1
                    ${porKilo ? 'h-[52%] w-[80%]' : 'h-[80%]'}`} />
            </div>
            <div className="mt-5 flex flex-1 flex-col">
                <h3 className="font-marca text-2xl font-medium leading-snug text-inverso">{p.NOMBRE}</h3>
                <p className="mt-1 text-sm text-inverso-suave">
                    {p.COMPOSICION ? nombrePropio(p.COMPOSICION) : nombrePropio(p.CATEGORIA)}
                    {porKilo && ' · venta por kilo'}
                </p>
                <div className="mt-auto flex items-center justify-between gap-4 pt-5">
                    <strong className="text-lg font-semibold tabular-nums text-inverso">
                        {dinero(p.PRECIO_ACTUAL)}
                        <span className="text-sm font-normal text-inverso-suave"> / {porKilo ? 'kg' : 'botella'}</span>
                    </strong>
                    <button type="button" onClick={alAgregar} disabled={!disponible || agregando}
                        className="btn btn-contorno-claro min-h-[44px]">
                        {agregando ? <><span className="giro" aria-hidden="true" /> Agregando</> : disponible ? 'Agregar' : 'Agotado'}
                    </button>
                </div>
            </div>
        </article>
    );
}
