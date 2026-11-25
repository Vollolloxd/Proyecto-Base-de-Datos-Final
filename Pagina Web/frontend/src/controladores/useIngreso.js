// Controlador del formulario de inicio de sesion
import { useState } from 'react';
import { useSesion } from './SesionContexto.jsx';

export function useIngreso(alEntrar) {
    const { iniciar } = useSesion();
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    async function entrar(e) {
        e.preventDefault();
        setError('');
        setEnviando(true);
        try {
            await iniciar(correo, clave);
            alEntrar();
        } catch (err) {
            setError(err.message);
            setEnviando(false);
        }
    }

    return { correo, setCorreo, clave, setClave, error, enviando, entrar };
}
