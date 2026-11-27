// Controlador generico de mantenedor: carga, busqueda, edicion, guardado, eliminacion logica y reactivacion
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as mantenedoresModelo from '../modelos/mantenedoresModelo.js';
import { normalizar } from '../utilidades/formato.js';
import { useMensajes } from './MensajesContexto.jsx';

export function useCrud({
    recurso, ids, filtros = {}, conInactivos = false, textoEliminar = 'Desactivar',
    prepararEnvio, transformarFilas, ordenDescendente = false, alCargar, recargar = 0
}) {
    const { avisar } = useMensajes();
    const [filas, setFilas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [verTodos, setVerTodos] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [edicion, setEdicion] = useState(null);
    const [guardando, setGuardando] = useState(false);

    const parametros = { ...filtros, todos: conInactivos && verTodos ? 1 : undefined };
    const ruta = mantenedoresModelo.rutaListar(recurso, parametros);

    const cargar = useCallback(async () => {
        setCargando(true);
        try {
            let datos = await mantenedoresModelo.listar(recurso, parametros);
            if (transformarFilas) datos = datos.map(transformarFilas);
            if (ordenDescendente) datos = [...datos].reverse();
            setFilas(datos);
            alCargar?.(datos);
        } catch (err) {
            avisar(err.message, 'error');
        } finally {
            setCargando(false);
        }
    }, [recurso, ruta]);

    useEffect(() => { cargar(); }, [cargar, recargar]);

    const visibles = useMemo(() => {
        const q = normalizar(busqueda.trim());
        if (!q) return filas;
        return filas.filter((f) => Object.values(f).some((v) => normalizar(v).includes(q)));
    }, [filas, busqueda]);

    const rutaIds = (fila) => ids.map((i) => encodeURIComponent(fila[i])).join('/');

    async function guardar(e) {
        e.preventDefault();
        setGuardando(true);
        try {
            const cuerpo = prepararEnvio ? prepararEnvio({ ...edicion.valores }, edicion.modo) : edicion.valores;
            if (edicion.modo === 'crear') {
                const resultado = await mantenedoresModelo.crear(recurso, cuerpo);
                if (resultado?.AVISO) avisar(resultado.AVISO, 'error');
                else if (recurso === 'productos' && cuerpo.ACTIVAR_AL_GUARDAR) {
                    if (Number(resultado?.ACTIVO) === 1) avisar('Producto creado y activado');
                    else avisar('El servidor no confirmó la activación. Revisa el estado del producto en la lista.', 'error');
                } else avisar('Registro creado');
            } else {
                await mantenedoresModelo.modificar(recurso, rutaIds(edicion.original), cuerpo);
                avisar('Cambios guardados');
            }
            setEdicion(null);
            cargar();
        } catch (err) {
            avisar(err.message, 'error');
        } finally {
            setGuardando(false);
        }
    }

    async function eliminar(fila) {
        if (!window.confirm(`¿${textoEliminar} este registro?`)) return;
        try {
            await mantenedoresModelo.eliminar(recurso, rutaIds(fila));
            avisar('Listo');
            cargar();
        } catch (err) {
            avisar(err.message, 'error');
        }
    }

    async function reactivar(fila) {
        try {
            await mantenedoresModelo.reactivar(recurso, rutaIds(fila));
            avisar('Registro reactivado');
            cargar();
        } catch (err) {
            avisar(err.message, 'error');
        }
    }

    const estaInactivo = (fila) => conInactivos && fila.ACTIVO !== undefined && Number(fila.ACTIVO) === 0;

    return {
        filas, visibles, cargando, verTodos, setVerTodos, busqueda, setBusqueda,
        edicion, setEdicion, guardando, cargar, guardar, eliminar, reactivar, rutaIds, estaInactivo
    };
}
