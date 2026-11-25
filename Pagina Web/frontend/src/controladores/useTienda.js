// Controlador de la tienda: catalogo, destacados, busqueda, orden, cantidades y compra (con o sin sesion)
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RUTA_CATALOGO, RUTA_MAS_VENDIDOS } from '../modelos/catalogoModelo.js';
import { guardarPendiente, leerPendiente } from '../modelos/compraPendiente.js';
import { agregarAlPedido } from '../modelos/pedidosModelo.js';
import { cantidadConUnidad, normalizar } from '../utilidades/formato.js';
import { esUva } from '../utilidades/productos.js';
import { useDatos } from './useDatos.js';
import { useMensajes } from './MensajesContexto.jsx';
import { useSesion } from './SesionContexto.jsx';

const COMPARADORES = {
    menorPrecio: (a, b) => a.PRECIO_ACTUAL - b.PRECIO_ACTUAL,
    mayorPrecio: (a, b) => b.PRECIO_ACTUAL - a.PRECIO_ACTUAL,
    nombre: (a, b) => a.NOMBRE.localeCompare(b.NOMBRE, 'es')
};

export function useTienda() {
    const { usuario } = useSesion();
    const { avisar } = useMensajes();
    const navegar = useNavigate();
    const { datos: productos, cargando, error } = useDatos(RUTA_CATALOGO);
    const { datos: masVendidos } = useDatos(RUTA_MAS_VENDIDOS);
    const [orden, setOrden] = useState('vendidos');
    const [cantidades, setCantidades] = useState({});
    const [agregando, setAgregando] = useState(null);
    const [pidiendoSesion, setPidiendoSesion] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const esCliente = usuario?.rol === 'CLIENTE';

    const hayUva = useMemo(() => productos.some(esUva), [productos]);
    const puesto = useMemo(() => Object.fromEntries(masVendidos.map((m) => [m.ID_PRODUCTO, m.POSICION])), [masVendidos]);
    const destacados = useMemo(() => masVendidos
        .map((m) => ({ p: productos.find((x) => x.ID_PRODUCTO === m.ID_PRODUCTO), posicion: m.POSICION }))
        .filter((d) => d.p), [masVendidos, productos]);
    const visibles = useMemo(() => {
        const q = normalizar(busqueda.trim());
        const lista = productos.filter((p) => !q || normalizar(`${p.NOMBRE} ${p.COMPOSICION} ${p.DESCRIPCION}`).includes(q));
        const comparar = COMPARADORES[orden] || ((a, b) => (puesto[a.ID_PRODUCTO] || 99) - (puesto[b.ID_PRODUCTO] || 99));
        return [...lista].sort(comparar);
    }, [productos, busqueda, orden, puesto]);
    const vinos = visibles.filter((p) => !esUva(p));
    const uvas = visibles.filter(esUva);

    async function agregar(p, cantidad) {
        setAgregando(p.ID_PRODUCTO);
        try {
            const pedido = await agregarAlPedido(p.ID_PRODUCTO, cantidad);
            avisar(`${p.NOMBRE} (${cantidadConUnidad(cantidad, p.UNIDAD_MEDIDA)}) agregado a tu pedido, folio ${pedido.NUMERO_FOLIO}`);
        } catch (err) {
            avisar(err.message, 'error');
        } finally {
            setAgregando(null);
        }
    }

    function quiereComprar(p) {
        const cantidad = Math.max(1, Number(cantidades[p.ID_PRODUCTO] || 1));
        if (!usuario) {
            guardarPendiente({ id: p.ID_PRODUCTO, nombre: p.NOMBRE, cantidad });
            setPidiendoSesion({ ...p, cantidad });
            return;
        }
        if (!esCliente) {
            avisar('Las compras web son para clientes. Ingresa con una cuenta de cliente.', 'error');
            return;
        }
        agregar(p, cantidad);
    }

    useEffect(() => {
        const pendiente = leerPendiente();
        if (!pendiente || !usuario || productos.length === 0) return;
        guardarPendiente(null);
        const p = productos.find((x) => x.ID_PRODUCTO === pendiente.id);
        if (esCliente && p) agregar(p, pendiente.cantidad);
    }, [usuario, productos]);

    const cambiarCantidad = (id) => (v) => setCantidades((c) => ({ ...c, [id]: v === '' ? '' : Math.max(1, Number(v) || 1) }));
    const cancelarCompra = () => { setPidiendoSesion(null); guardarPendiente(null); };
    const irAlAcceso = (modo) => navegar(`/login?${modo === 'registro' ? 'modo=registro&' : ''}volver=/`);

    return {
        productos, cargando, error, esCliente, hayUva, destacados, visibles, vinos, uvas,
        orden, setOrden, busqueda, setBusqueda, cantidades, agregando, pidiendoSesion,
        quiereComprar, cambiarCantidad, cancelarCompra, irAlAcceso
    };
}
