// Vista: acciones de cuenta en la cabecera de la tienda (ingresar, crear cuenta, mis pedidos o panel, salir)
import { ClipboardList, LayoutDashboard, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSesion } from '../../controladores/SesionContexto.jsx';

export default function CuentaTienda() {
    const { usuario, cerrar } = useSesion();
    const esCliente = usuario?.rol === 'CLIENTE';

    if (!usuario) {
        return (
            <>
                <Link to="/login" className="enlace-linea py-2 text-sm text-inverso">Iniciar sesión</Link>
                <Link to="/login?modo=registro" className="btn btn-contorno-claro">Crear cuenta</Link>
            </>
        );
    }
    return (
        <>
            {esCliente ? (
                <Link to="/mis-pedidos" className="btn btn-contorno-claro">
                    <ClipboardList size={18} strokeWidth={1.75} aria-hidden="true" /> Mis pedidos
                </Link>
            ) : (
                <Link to="/inicio" className="btn btn-contorno-claro">
                    <LayoutDashboard size={18} strokeWidth={1.75} aria-hidden="true" /> Ir al panel
                </Link>
            )}
            <button type="button" onClick={cerrar} aria-label="Cerrar sesión" title="Cerrar sesión"
                className="grid h-10 w-10 place-items-center rounded-md text-inverso-suave transition-colors hover:bg-white/10 hover:text-inverso">
                <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
        </>
    );
}
