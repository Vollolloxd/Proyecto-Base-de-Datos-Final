// Controlador del registro de cliente web: datos, validaciones (RUT y contraseña) y envio
import { useState } from 'react';
import { formatearRut, rutValido } from '../utilidades/rut.js';
import { useSesion } from './SesionContexto.jsx';

const VACIO = {
    tipoCliente: 'NATURAL', nombre: '', apellido1: '', apellido2: '', razonSocial: '',
    rut: '', telefono: '', correo: '', clave: '', repetir: ''
};

export function useRegistro(alEntrar) {
    const { registrar } = useSesion();
    const [d, setD] = useState(VACIO);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);
    const esEmpresa = d.tipoCliente === 'EMPRESA';
    const cambiar = (campo) => (e) => setD({ ...d, [campo]: e.target.value });
    const elegirTipo = (tipo) => setD({ ...d, tipoCliente: tipo });
    const formatearRutIngresado = () => d.rut && setD({ ...d, rut: formatearRut(d.rut) });

    async function crear(e) {
        e.preventDefault();
        setError('');
        if (d.rut && !rutValido(d.rut)) {
            setError('El RUT ingresado no es válido.');
            return;
        }
        if (d.clave.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (d.clave !== d.repetir) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setEnviando(true);
        try {
            const { repetir, ...datos } = d;
            await registrar({ ...datos, rut: d.rut ? formatearRut(d.rut) : '' });
            alEntrar();
        } catch (err) {
            setError(err.message);
            setEnviando(false);
        }
    }

    return { d, esEmpresa, cambiar, elegirTipo, formatearRutIngresado, error, enviando, crear };
}
