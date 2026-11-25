// Pagina: solicitudes web (revision, aceptacion y rechazo, gestor G3)
import { useState } from 'react';
import { useDatos } from '../../../controladores/useDatos.js';
import { RUTA_CLIENTES } from '../../../modelos/mantenedoresModelo.js';
import { dinero, fechaHora, nombreCliente } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import DetalleSolicitud from './DetalleSolicitud.jsx';

export default function Solicitudes() {
    const { datos: clientes } = useDatos(RUTA_CLIENTES);
    const [abierta, setAbierta] = useState(null);
    const [recargar, setRecargar] = useState(0);
    const [pendientes, setPendientes] = useState(0);

    return (
        <>
            <CrudPagina
                titulo="Solicitudes web"
                descripcion="Pedidos que los clientes hacen desde el sitio. Revise las pendientes y acéptelas o recháchelas."
                recurso="solicitudes" ids={['ID_SOLICITUD']} ordenDescendente recargar={recargar}
                textoCrear="Nueva solicitud" textoEliminar="Anular"
                alCargar={(filas) => setPendientes(filas.filter((f) => f.ESTADO === 'PENDIENTE').length)}
                puedeEditar={(f) => f.ESTADO === 'BORRADOR'}
                puedeEliminar={(f) => f.ESTADO === 'BORRADOR'}
                columnas={[
                    { campo: 'NUMERO_FOLIO', titulo: 'Folio' },
                    { campo: 'CLIENTE', titulo: 'Cliente' },
                    { campo: 'FECHA_CREACION', titulo: 'Creada', render: (f) => fechaHora(f.FECHA_CREACION) },
                    { campo: 'TOTAL', titulo: 'Total', alinear: 'derecha', render: (f) => dinero(f.TOTAL) },
                    { campo: 'ESTADO', titulo: 'Estado', render: (f) => <Insignia valor={f.ESTADO} /> },
                    { campo: 'ID_VENTA', titulo: 'Venta', render: (f) => (f.ID_VENTA ? `N° ${f.ID_VENTA}` : '') }
                ]}
                campos={[
                    { nombre: 'ID_CLIENTE', etiqueta: 'Cliente', tipo: 'select', requerido: true, ancho: 'completo',
                        opciones: clientes.map((c) => ({ valor: c.ID_CLIENTE, texto: nombreCliente(c) })) },
                    { nombre: 'OBSERVACIONES', etiqueta: 'Observaciones', tipo: 'textarea', ancho: 'completo' }
                ]}
                accionesExtra={(f) => (
                    <button type="button" className={`btn btn-sm ${f.ESTADO === 'PENDIENTE' ? '' : 'btn-sec'}`}
                        onClick={() => setAbierta(f)}>
                        {f.ESTADO === 'PENDIENTE' ? 'Revisar' : 'Detalle'}
                    </button>
                )}
            />
            {pendientes > 0 && (
                <p className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-aviso shadow-[0_8px_24px_-8px_rgba(38,34,31,0.25)]">{pendientes} solicitud{pendientes === 1 ? '' : 'es'} pendiente{pendientes === 1 ? '' : 's'} de revisión</p>
            )}
            <DetalleSolicitud solicitud={abierta} alCerrar={() => setAbierta(null)}
                alCambiar={() => setRecargar((n) => n + 1)} />
        </>
    );
}
