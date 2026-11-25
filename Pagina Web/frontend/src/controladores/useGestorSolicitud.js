// Controlador de la revision de una solicitud web (G3): enviar, aceptar (genera venta) o rechazar
import { useNavigate } from 'react-router-dom';
import * as solicitudesModelo from '../modelos/solicitudesModelo.js';
import { useMensajes } from './MensajesContexto.jsx';

export function useGestorSolicitud(solicitud, { alCambiar, alCerrar }) {
    const { avisar } = useMensajes();
    const navegar = useNavigate();

    async function ejecutar(operacion, mensaje) {
        try {
            const r = await operacion();
            avisar(mensaje);
            alCambiar();
            alCerrar();
            if (r?.ID_VENTA) {
                avisar(`Se generó la venta digital N° ${r.ID_VENTA}: confírmela con el pago`);
                navegar(`/ventas/${r.ID_VENTA}`);
            }
        } catch (err) {
            avisar(err.message, 'error');
        }
    }

    return {
        enviar: () => ejecutar(() => solicitudesModelo.enviar(solicitud.ID_SOLICITUD),
            'Solicitud enviada: queda pendiente de revisión'),
        rechazar: () => ejecutar(() => solicitudesModelo.resolver(solicitud.ID_SOLICITUD, 'RECHAZADA'), 'Solicitud rechazada'),
        aceptar: () => ejecutar(() => solicitudesModelo.resolver(solicitud.ID_SOLICITUD, 'ACEPTADA'), 'Solicitud aceptada')
    };
}
