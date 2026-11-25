// Controlador de sesion: usuario, modulos permitidos, login, registro y cierre de sesion
import { createContext, useContext, useEffect, useState } from 'react';
import * as accesoModelo from '../modelos/accesoModelo.js';
import { borrarSesion, guardarSesion, leerSesion } from '../modelos/almacenSesion.js';

const ContextoSesion = createContext(null);

export function ProveedorSesion({ children }) {
    const [sesion, setSesion] = useState(leerSesion);

    useEffect(() => {
        if (!sesion) return;
        accesoModelo.obtenerSesion()
            .then((datos) => {
                const nueva = { ...leerSesion(), ...datos };
                guardarSesion(nueva);
                setSesion(nueva);
            })
            .catch(() => {});
    }, []);

    async function iniciar(correo, clave) {
        const datos = await accesoModelo.iniciarSesion(correo, clave);
        guardarSesion(datos);
        setSesion(datos);
        return datos;
    }

    async function registrar(datos) {
        const respuesta = await accesoModelo.registrar(datos);
        guardarSesion(respuesta);
        setSesion(respuesta);
        return respuesta;
    }

    function cerrar() {
        borrarSesion();
        setSesion(null);
    }

    const modulos = sesion?.modulos || [];
    const valor = {
        sesion,
        usuario: sesion?.usuario || null,
        modulos,
        tiene: (modulo) => modulos.includes(modulo),
        iniciar,
        registrar,
        cerrar
    };
    return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

export const useSesion = () => useContext(ContextoSesion);
