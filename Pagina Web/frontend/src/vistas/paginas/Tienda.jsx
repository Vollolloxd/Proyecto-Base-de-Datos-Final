// Pagina: tienda publica (portada, mas vendidos, vinos, uva y compra); la logica vive en useTienda
import { useTienda } from '../../controladores/useTienda.js';
import EncabezadoTienda from '../tienda/EncabezadoTienda.jsx';
import ModalIniciarSesion from '../tienda/ModalIniciarSesion.jsx';
import PieTienda from '../tienda/PieTienda.jsx';
import Portada from '../tienda/Portada.jsx';
import SeccionDestacados from '../tienda/SeccionDestacados.jsx';
import SeccionUva from '../tienda/SeccionUva.jsx';
import SeccionVinos from '../tienda/SeccionVinos.jsx';

export default function Tienda() {
    const tienda = useTienda();
    const hayDestacados = tienda.destacados.length > 0;
    const propsGrilla = {
        cantidades: tienda.cantidades,
        agregando: tienda.agregando,
        alComprar: tienda.quiereComprar,
        alCambiarCantidad: tienda.cambiarCantidad
    };

    return (
        <div className="min-h-screen bg-marfil">
            <a href="#vinos" className="sr-only z-[60] rounded-md bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
                Saltar al catálogo
            </a>
            <EncabezadoTienda hayDestacados={hayDestacados} hayUva={tienda.hayUva} />
            <main>
                <Portada cantidad={tienda.productos.length} />
                <SeccionDestacados destacados={tienda.destacados} agregando={tienda.agregando} alComprar={tienda.quiereComprar} />
                <SeccionVinos tienda={tienda} propsGrilla={propsGrilla} />
                <SeccionUva hayUva={tienda.hayUva} uvas={tienda.uvas} orden={tienda.orden} propsGrilla={propsGrilla} />
            </main>

            <PieTienda hayDestacados={hayDestacados} hayUva={tienda.hayUva} />

            <ModalIniciarSesion producto={tienda.pidiendoSesion} alCerrar={tienda.cancelarCompra} alIr={tienda.irAlAcceso} />
        </div>
    );
}
