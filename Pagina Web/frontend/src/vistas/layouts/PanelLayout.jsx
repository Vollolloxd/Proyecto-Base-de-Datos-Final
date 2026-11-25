// Vista: estructura del panel (menu lateral + cabecera + contenido de la ruta)
import { Outlet } from 'react-router-dom';
import { usePanel } from '../../controladores/usePanel.js';
import CabeceraPanel from './CabeceraPanel.jsx';
import MenuLateral from './MenuLateral.jsx';
import ModalCambiarClave from './ModalCambiarClave.jsx';

export default function PanelLayout() {
    const panel = usePanel();

    return (
        <div className="flex min-h-screen bg-fondo">
            <a href="#contenido" className="sr-only z-[60] rounded-md bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
                Saltar al contenido
            </a>
            {panel.menuAbierto && (
                <div className="fixed inset-0 z-30 animate-difuminar bg-carbon/50 lg:hidden" onClick={() => panel.setMenuAbierto(false)} />
            )}
            <MenuLateral panel={panel} />

            <div className="flex min-w-0 flex-1 flex-col">
                <CabeceraPanel panel={panel} />
                <main id="contenido" className="w-full max-w-[1440px] p-4 md:p-8">
                    <div key={panel.pathname} className="animate-aparecer">
                        <Outlet />
                    </div>
                </main>
            </div>
            <ModalCambiarClave abierto={panel.cambiandoClave} alCerrar={() => panel.setCambiandoClave(false)} />
        </div>
    );
}
