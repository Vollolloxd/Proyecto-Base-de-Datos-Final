// Vista: portada (hero) de la tienda con titular, llamado a explorar y foto del viñedo
import { ArrowRight } from 'lucide-react';
import { irASeccion } from '../../utilidades/navegacion.js';
import FotoVinedo from './FotoVinedo.jsx';

export default function Portada({ cantidad }) {
    return (
        <section id="inicio" className="tema-oscuro relative overflow-hidden bg-carbon text-inverso">
            <div className="relative mx-auto grid min-h-[620px] max-w-tienda items-center gap-10 px-4 pb-14 pt-[112px] sm:px-8
                    lg:h-[min(80vh,760px)] lg:min-h-[640px] lg:grid-cols-12 lg:pb-16 lg:pt-28 lg:px-14">
                <div className="relative z-10 lg:col-span-6 xl:col-span-5">
                    <h1 className="block animate-revelar font-marca text-[2.75rem] font-medium leading-[1.04] tracking-[-0.01em] sm:text-6xl xl:text-[4.5rem]">
                        Vinos con carácter, desde nuestra viña.
                    </h1>
                    <p className="mt-6 max-w-md animate-revelar text-[17px] leading-relaxed text-inverso-suave [animation-delay:80ms]">
                        Descubre nuestra selección de vinos y elige tu próxima botella. Arma tu pedido en línea
                        y la viña lo revisa y confirma.
                    </p>
                    <div className="mt-9 flex animate-revelar flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:140ms]">
                        <a href="#vinos" onClick={irASeccion('vinos')} className="btn btn-bronce group min-h-[48px] px-6 text-[15px]">
                            Explorar vinos
                            <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true"
                                className="transition-transform duration-200 ease-salida group-hover:translate-x-0.5" />
                        </a>
                        {cantidad > 0 && (
                            <span className="text-sm text-inverso-suave">{cantidad} productos · precios en pesos chilenos</span>
                        )}
                    </div>
                </div>
                <FotoVinedo clase="relative -mx-4 h-[300px] sm:-mx-8 sm:h-[380px] lg:hidden" />
            </div>
            <FotoVinedo clase="absolute inset-y-0 right-0 hidden w-[54%] lg:block" />
        </section>
    );
}
