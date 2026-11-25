// Pagina: pedidos del cliente web (pedido actual + historial)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDatos } from '../../../controladores/useDatos.js';
import { RUTA_MIS_PEDIDOS } from '../../../modelos/pedidosModelo.js';
import { dinero, fechaHora } from '../../../utilidades/formato.js';
import Cabecera from '../../componentes/Cabecera.jsx';
import Cargando from '../../componentes/Cargando.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import DetallePedido from './DetallePedido.jsx';

export default function MisPedidos() {
    const { datos: pedidos, cargando, recargar } = useDatos(RUTA_MIS_PEDIDOS);
    const [elegido, setElegido] = useState(null);
    const lista = [...pedidos].reverse();
    const actual = lista.find((p) => p.ID_SOLICITUD === elegido) || lista.find((p) => p.ESTADO === 'BORRADOR');

    return (
        <section>
            <Cabecera titulo="Mis pedidos" descripcion="Tus solicitudes de compra a la viña.">
                <Link to="/" className="btn">Ir a la tienda</Link>
            </Cabecera>
            {actual && <DetallePedido key={actual.ID_SOLICITUD} pedido={actual} alCambiar={recargar} />}
            <h2 className="mb-3 mt-8">Historial</h2>
            {cargando && pedidos.length === 0 ? <Cargando /> : (
                <Tabla
                    filas={lista} claveFila={(p) => p.ID_SOLICITUD} alClickFila={(p) => setElegido(p.ID_SOLICITUD)}
                    vacio="Aún no tienes pedidos"
                    columnas={[
                        { campo: 'NUMERO_FOLIO', titulo: 'Folio' },
                        { campo: 'FECHA_CREACION', titulo: 'Fecha', render: (p) => fechaHora(p.FECHA_CREACION) },
                        { campo: 'TOTAL', titulo: 'Total', alinear: 'derecha', render: (p) => dinero(p.TOTAL) },
                        { campo: 'ESTADO', titulo: 'Estado', render: (p) => <Insignia valor={p.ESTADO} /> }
                    ]}
                />
            )}
        </section>
    );
}
