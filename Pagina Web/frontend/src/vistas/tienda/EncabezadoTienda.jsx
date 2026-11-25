// Vista: cabecera fija de la tienda con logo, secciones, cuenta y menu movil
import { Menu, X } from 'lucide-react';
import { useEncabezadoTienda } from '../../controladores/useEncabezadoTienda.js';
import { irASeccion } from '../../utilidades/navegacion.js';
import CuentaTienda from './CuentaTienda.jsx';

export default function EncabezadoTienda({ hayDestacados, hayUva }) {
    const { solido, abierto, setAbierto } = useEncabezadoTienda();

    const enlaces = [
        ['inicio', 'Inicio'],
        ...(hayDestacados ? [['destacados', 'Más vendidos']] : []),
        ['vinos', 'Vinos'],
        ...(hayUva ? [['uva', 'Uva']] : [])
    ];
    const claseEnlace = 'enlace-linea py-2 text-sm text-inverso-suave transition-colors hover:text-inverso';

    return (
        <header className={`tema-oscuro fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-200
                ${solido || abierto ? 'border-b border-carbon-borde bg-carbon' : 'border-b border-transparent bg-transparent'}`}>
            <div className="mx-auto flex h-[72px] max-w-tienda items-center gap-6 px-4 sm:px-8 lg:h-20 lg:px-14">
                <a href="#inicio" onClick={irASeccion('inicio')} className="flex shrink-0 items-center gap-3 text-inverso no-underline">
                    <img src="/img/logo-emblema.png" alt="" className="h-10 w-10 rounded-md bg-marfil object-contain p-0.5" />
                    <span className="font-marca text-[1.375rem] font-semibold leading-none tracking-[0.01em]">Viña La Alborada</span>
                </a>
                <nav aria-label="Secciones de la tienda" className="mx-auto hidden items-center gap-8 md:flex">
                    {enlaces.map(([id, texto]) => (
                        <a key={id} href={`#${id}`} onClick={irASeccion(id)} className={claseEnlace}>{texto}</a>
                    ))}
                </nav>
                <div className="hidden items-center gap-4 md:flex"><CuentaTienda /></div>
                <button type="button" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}
                    aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
                    className="ml-auto grid h-11 w-11 place-items-center rounded-md text-inverso hover:bg-white/10 md:hidden">
                    {abierto ? <X size={22} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={22} strokeWidth={1.75} aria-hidden="true" />}
                </button>
            </div>
            {abierto && (
                <div className="h-[calc(100dvh-72px)] animate-difuminar overflow-y-auto border-t border-carbon-borde bg-carbon px-4 pb-8 sm:px-8 md:hidden">
                    <nav aria-label="Secciones de la tienda" className="flex flex-col py-4">
                        {enlaces.map(([id, texto]) => (
                            <a key={id} href={`#${id}`} onClick={(e) => { setAbierto(false); irASeccion(id)(e); }}
                                className="border-b border-carbon-borde py-4 font-marca text-2xl text-inverso no-underline">{texto}</a>
                        ))}
                    </nav>
                    <div className="flex flex-wrap items-center gap-4"><CuentaTienda /></div>
                </div>
            )}
        </header>
    );
}
