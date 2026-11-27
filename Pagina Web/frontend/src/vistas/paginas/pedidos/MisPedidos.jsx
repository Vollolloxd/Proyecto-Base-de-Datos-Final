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
    const borradores = lista.filter((p) => p.ESTADO === 'BORRADOR');
    const historial = lista.filter((p) => p.ESTADO !== 'BORRADOR');
    const actual = historial.find((p) => p.ID_SOLICITUD === elegido);

    return (
        <section>
            <Cabecera titulo="Mis pedidos" descripcion="Tus solicitudes de compra a la viña.">
                <Link to="/" className="btn">Ir a la tienda</Link>
            </Cabecera>
            <div className="grid gap-4">
                {borradores.map((p) => <DetallePedido key={p.ID_SOLICITUD} pedido={p} alCambiar={recargar} />)}
                {actual && <DetallePedido key={actual.ID_SOLICITUD} pedido={actual} alCambiar={recargar} />}
            </div>
            <h2 className="mb-3 mt-8">Historial</h2>
            {cargando && pedidos.length === 0 ? <Cargando /> : (
                <Tabla
                    filas={historial} claveFila={(p) => p.ID_SOLICITUD} alClickFila={(p) => setElegido(p.ID_SOLICITUD)}
                    vacio="Aún no tienes pedidos enviados"
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
