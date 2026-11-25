// Guardias de rutas: exigir sesion y exigir permiso sobre un modulo
import { Navigate, useLocation } from 'react-router-dom';
import { useSesion } from '../controladores/SesionContexto.jsx';

export function Protegida({ children }) {
    const { sesion } = useSesion();
    const { pathname } = useLocation();
    return sesion ? children : <Navigate to={`/login?volver=${encodeURIComponent(pathname)}`} replace />;
}

export function ConModulo({ modulo, children }) {
    const { tiene } = useSesion();
    if (!tiene(modulo)) {
        return (
            <section>
                <h1>Sin acceso</h1>
                <p className="text-sm text-suave">Tu perfil no tiene permiso para este módulo.</p>
            </section>
        );
    }
    return children;
}
