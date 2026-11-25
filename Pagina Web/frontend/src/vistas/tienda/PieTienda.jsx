// Vista: pie de la tienda con logo, aviso legal, enlaces y credito de la foto
import { Link } from 'react-router-dom';
import { useSesion } from '../../controladores/SesionContexto.jsx';
import { irASeccion } from '../../utilidades/navegacion.js';

export default function PieTienda({ hayDestacados, hayUva }) {
    const { usuario } = useSesion();
    const claseEnlace = 'enlace-linea text-sm text-inverso-suave hover:text-inverso';
    return (
        <footer className="tema-oscuro bg-carbon text-inverso">
            <div className="mx-auto grid max-w-tienda gap-10 px-4 py-14 sm:px-8 md:grid-cols-12 lg:px-14">
                <div className="md:col-span-5">
                    <div className="flex items-center gap-3">
                        <img src="/img/logo-emblema.png" alt="" className="h-11 w-11 rounded-md bg-marfil object-contain p-0.5" />
                        <span className="font-marca text-2xl font-semibold">Viña La Alborada</span>
                    </div>
                    <p className="mt-5 max-w-sm text-sm leading-relaxed text-inverso-suave">
                        Ley N° 19.925: prohibida la venta de bebidas alcohólicas a menores de 18 años. Disfruta con moderación.
                    </p>
                </div>
                <nav aria-label="Enlaces del pie" className="md:col-span-3">
                    <ul className="flex flex-col gap-3">
                        <li><a href="#vinos" onClick={irASeccion('vinos')} className={claseEnlace}>Vinos</a></li>
                        {hayUva && <li><a href="#uva" onClick={irASeccion('uva')} className={claseEnlace}>Uva</a></li>}
                        {hayDestacados && <li><a href="#destacados" onClick={irASeccion('destacados')} className={claseEnlace}>Más vendidos</a></li>}
                        <li>
                            {usuario?.rol === 'CLIENTE'
                                ? <Link to="/mis-pedidos" className={claseEnlace}>Mis pedidos</Link>
                                : usuario
                                    ? <Link to="/inicio" className={claseEnlace}>Panel de gestión</Link>
                                    : <Link to="/login" className={claseEnlace}>Iniciar sesión</Link>}
                        </li>
                    </ul>
                </nav>
                <p className="text-sm text-inverso-suave md:col-span-4">
                    Proyecto INF324 Base de Datos.
                </p>
            </div>
            <div className="border-t border-carbon-borde">
                <p className="mx-auto max-w-tienda px-4 py-5 text-xs text-inverso-suave/80 sm:px-8 lg:px-14">
                    Foto del viñedo: <a className="text-inverso-suave underline" href="https://commons.wikimedia.org/wiki/File:Row_upon_row_across_gently_rolling_valleys,_Matetic_Wines,_Chile_(38609005014).jpg"
                        target="_blank" rel="noreferrer">Winniepix</a>, licencia <a className="text-inverso-suave underline" href="https://creativecommons.org/licenses/by/2.0"
                        target="_blank" rel="noreferrer">CC BY 2.0</a> (Wikimedia Commons).
                </p>
            </div>
        </footer>
    );
}
