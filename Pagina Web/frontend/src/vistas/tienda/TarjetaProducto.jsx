// Vista: tarjeta de producto del catalogo (imagen, datos, precio, disponibilidad, cantidad y agregar)
import { cantidadConUnidad, dinero, esPorKilo, nombrePropio } from '../../utilidades/formato.js';
import Cantidad from './Cantidad.jsx';
import ImagenProducto from './ImagenProducto.jsx';

export default function TarjetaProducto({ p, cantidad, alCambiarCantidad, alAgregar, agregando, fondo = 'bg-[#ece6dc] group-hover:bg-[#e6dfd3]' }) {
    const disponible = p.DISPONIBILIDAD === 'DISPONIBLE';
    const porKilo = esPorKilo(p.UNIDAD_MEDIDA);
    const detalle = [nombrePropio(p.CATEGORIA), p.FORMATO, p.ANADA].filter(Boolean).join(' · ');
    return (
        <article className="group flex flex-col">
            <div className={`flex aspect-[4/5] items-end justify-center overflow-hidden rounded-sm transition-colors duration-200 ${fondo}`}>
                <ImagenProducto p={p} className={`mb-[7%] transition-transform duration-300 ease-salida group-hover:-translate-y-1
                    ${porKilo ? 'h-[52%] w-[82%]' : 'h-[80%]'} ${disponible ? '' : 'opacity-60 grayscale-[.4]'}`} />
            </div>
            <div className="mt-4 flex flex-1 flex-col">
                <h3 className="font-marca text-[1.375rem] font-semibold leading-snug">{p.NOMBRE}</h3>
                <p className="mt-0.5 text-[13px] text-suave">{detalle}</p>
                {p.COMPOSICION && <p className="mt-2 text-sm font-medium text-vino">{nombrePropio(p.COMPOSICION)}</p>}
                {p.DESCRIPCION && <p className="mt-1.5 line-clamp-2 text-sm text-suave">{p.DESCRIPCION}</p>}
                <div className="mt-auto pt-4">
                    <div className="flex items-baseline justify-between gap-3">
                        <strong className="text-lg font-semibold tabular-nums">
                            {dinero(p.PRECIO_ACTUAL)}
                            <span className="text-sm font-normal text-suave"> / {porKilo ? 'kg' : 'botella'}</span>
                        </strong>
                        <span className={`inline-flex items-center gap-1.5 text-xs ${disponible ? 'text-exito' : 'text-peligro'}`}>
                            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${disponible ? 'bg-exito' : 'bg-peligro'}`} />
                            {disponible ? 'Disponible' : 'Agotado'}
                        </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Cantidad valor={cantidad} porKilo={porKilo} nombre={p.NOMBRE} deshabilitado={!disponible}
                            alCambiar={alCambiarCantidad} />
                        <button type="button" className="btn min-h-[44px] flex-1" disabled={!disponible || agregando} onClick={alAgregar}>
                            {agregando ? <><span className="giro" aria-hidden="true" /> Agregando</> : 'Agregar'}
                        </button>
                    </div>
                    <p className="mt-2 h-4 text-right text-xs tabular-nums text-suave" aria-live="polite">
                        {Number(cantidad) > 1 && disponible && (
                            <>{cantidadConUnidad(cantidad, p.UNIDAD_MEDIDA)} = <strong className="font-medium text-tinta">{dinero(cantidad * p.PRECIO_ACTUAL)}</strong></>
                        )}
                    </p>
                </div>
            </div>
        </article>
    );
}
