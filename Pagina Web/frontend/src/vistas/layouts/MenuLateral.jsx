// Vista: menu lateral del panel (enlaces segun los modulos del perfil, contraseña y cerrar sesion)
import { KeyRound, LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { MENU } from '../../rutas/menu.js';

const claseEnlace = ({ isActive }) => `group flex min-h-[40px] items-center gap-3 rounded-md px-3 text-sm no-underline
    transition-colors duration-150 ${isActive
        ? 'bg-white/[0.12] font-medium text-white'
        : 'text-inverso-suave hover:bg-white/[0.06] hover:text-white'}`;

export default function MenuLateral({ panel }) {
    const { usuario, tiene, menuAbierto, setMenuAbierto, setCambiandoClave, salir } = panel;
    return (
        <aside className={`tema-oscuro fixed inset-y-0 left-0 z-40 flex w-[248px] shrink-0 flex-col bg-vino-profundo text-inverso
                transition-transform duration-300 ease-salida lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
                ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}`}
            aria-label="Menú del panel">
            <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
                <img src="/img/logo-emblema.png" alt="" className="h-9 w-9 shrink-0 rounded-md bg-marfil object-contain p-0.5" />
                <div className="min-w-0 leading-tight">
                    <strong className="block truncate font-marca text-lg font-semibold">Viña La Alborada</strong>
                    <span className="block text-xs text-inverso-suave">Sistema de gestión</span>
                </div>
                <button type="button" onClick={() => setMenuAbierto(false)} aria-label="Cerrar menú"
                    className="ml-auto grid h-10 w-10 place-items-center rounded-md text-inverso-suave hover:bg-white/10 lg:hidden">
                    <X size={20} strokeWidth={1.75} aria-hidden="true" />
                </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4" onClick={(e) => e.target.closest('a') && setMenuAbierto(false)}>
                {MENU.map((grupo) => {
                    const enlaces = grupo.enlaces.filter((e) => !e.modulo || tiene(e.modulo));
                    if (enlaces.length === 0) return null;
                    return (
                        <div key={grupo.seccion} className="mb-5">
                            <div className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-inverso-suave/70">
                                {grupo.seccion}
                            </div>
                            <ul className="flex flex-col gap-0.5">
                                {enlaces.map(({ ruta, texto, icono: Icono }) => (
                                    <li key={ruta}>
                                        <NavLink to={ruta} end className={claseEnlace}>
                                            {({ isActive }) => (
                                                <>
                                                    <Icono size={18} strokeWidth={1.75} aria-hidden="true"
                                                        className={isActive ? 'text-bronce' : 'text-inverso-suave/80 group-hover:text-white'} />
                                                    {texto}
                                                </>
                                            )}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </nav>
            <div className="border-t border-white/10 p-3">
                <div className="mb-2 px-3 text-xs text-inverso-suave">
                    <span className="block truncate">{usuario?.correo?.toLowerCase()}</span>
                </div>
                <button type="button" onClick={() => setCambiandoClave(true)}
                    className="flex min-h-[40px] w-full items-center gap-3 rounded-md px-3 text-sm text-inverso-suave transition-colors hover:bg-white/[0.06] hover:text-white">
                    <KeyRound size={18} strokeWidth={1.75} aria-hidden="true" /> Cambiar contraseña
                </button>
                <button type="button" onClick={salir}
                    className="flex min-h-[40px] w-full items-center gap-3 rounded-md px-3 text-sm text-inverso-suave transition-colors hover:bg-white/[0.06] hover:text-white">
                    <LogOut size={18} strokeWidth={1.75} aria-hidden="true" /> Cerrar sesión
                </button>
            </div>
        </aside>
    );
}
