// Consulta de solicitudes web de los clientes.
import { useState } from 'react';
import { dinero, fechaHora } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import DetalleSolicitud from './DetalleSolicitud.jsx';

export default function Solicitudes() {
    const [abierta, setAbierta] = useState(null);
    const [recargar, setRecargar] = useState(0);

    return (
        <>
            <CrudPagina
                titulo="Solicitudes web"
                descripcion="Consulta las solicitudes de los clientes, acepta o rechaza las pendientes y anula borradores."
                recurso="solicitudes" ids={['ID_SOLICITUD']} ordenDescendente recargar={recargar} soloLectura
                columnas={[
                    { campo: 'NUMERO_FOLIO', titulo: 'Folio' },
                    { campo: 'CLIENTE', titulo: 'Cliente' },
                    { campo: 'FECHA_CREACION', titulo: 'Creada', render: (f) => fechaHora(f.FECHA_CREACION) },
                    { campo: 'TOTAL', titulo: 'Total', alinear: 'derecha', render: (f) => dinero(f.TOTAL) },
                    { campo: 'ESTADO', titulo: 'Estado', render: (f) => <Insignia valor={f.ESTADO} /> },
                    { campo: 'ID_VENTA', titulo: 'Venta', render: (f) => (f.ID_VENTA ? `N° ${f.ID_VENTA}` : '') }
                ]}
                accionesExtra={(f) => (
                    <button type="button" className="btn btn-sec btn-sm" onClick={() => setAbierta(f)}>
                        Ver detalle
                    </button>
                )}
            />
            <DetalleSolicitud solicitud={abierta} alCerrar={() => setAbierta(null)}
                alCambiar={() => setRecargar((n) => n + 1)} />
        </>
    );
}
