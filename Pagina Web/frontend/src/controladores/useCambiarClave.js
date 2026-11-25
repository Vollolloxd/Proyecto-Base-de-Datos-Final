// Controlador del cambio de contraseña del usuario de la sesion
import { useState } from 'react';
import * as accesoModelo from '../modelos/accesoModelo.js';
import { useMensajes } from './MensajesContexto.jsx';

export function useCambiarClave(alCerrar) {
    const { avisar } = useMensajes();
    const [valores, setValores] = useState({});

    async function guardar(e) {
        e.preventDefault();
        if (valores.claveNueva !== valores.repetir) {
            avisar('Las contraseñas nuevas no coinciden', 'error');
            return;
        }
        try {
            await accesoModelo.cambiarClave(valores.claveActual, valores.claveNueva);
            avisar('Contraseña actualizada');
            setValores({});
            alCerrar();
        } catch (err) {
            avisar(err.message, 'error');
        }
    }

    return { valores, setValores, guardar };
}
