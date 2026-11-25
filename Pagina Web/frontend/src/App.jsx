// Aplicacion: proveedores (avisos y sesion), verificacion de edad y rutas
import { ProveedorMensajes } from './controladores/MensajesContexto.jsx';
import { ProveedorSesion } from './controladores/SesionContexto.jsx';
import Rutas from './rutas/Rutas.jsx';
import VerificacionEdad from './vistas/acceso/VerificacionEdad.jsx';

export default function App() {
    return (
        <ProveedorMensajes>
            <ProveedorSesion>
                <VerificacionEdad>
                    <Rutas />
                </VerificacionEdad>
            </ProveedorSesion>
        </ProveedorMensajes>
    );
}
