// Vista: revision de una solicitud web (productos y acciones del gestor G3)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDatos } from '../../../controladores/useDatos.js';
import { useGestorSolicitud } from '../../../controladores/useGestorSolicitud.js';
import { RUTA_PRODUCTOS } from '../../../modelos/mantenedoresModelo.js';
import { dinero } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import Modal from '../../componentes/Modal.jsx';

function Contenido({ solicitud, alCerrar, alCambiar }) {
    const { datos: productos } = useDatos(RUTA_PRODUCTOS);
    const [total, setTotal] = useState(0);
    const gestor = useGestorSolicitud(solicitud, { alCambiar, alCerrar });
    const editable = solicitud.ESTADO === 'BORRADOR';

    return (
        <Modal titulo={`Solicitud folio ${solicitud.NUMERO_FOLIO}`} abierto alCerrar={alCerrar} ancho="grande">
            <p className="mb-3 text-sm text-suave">
                {solicitud.CLIENTE} · <Insignia valor={solicitud.ESTADO} /> · Total {dinero(total)}
                {solicitud.OBSERVACIONES && <><br />Observaciones: {solicitud.OBSERVACIONES}</>}
            </p>
            <CrudPagina
                embebido recurso="detalle-solicitud" ids={['ID_SOLICITUD', 'ID_PRODUCTO']}
                filtros={{ idSolicitud: solicitud.ID_SOLICITUD }} soloLectura={!editable}
                valoresIniciales={{ ID_SOLICITUD: solicitud.ID_SOLICITUD, CANTIDAD: 1 }}
                textoCrear="Agregar producto" textoEliminar="Quitar" porPagina={8}
                alCargar={(filas) => setTotal(filas.reduce((s, f) => s + f.SUBTOTAL, 0))}
                columnas={[
                    { campo: 'NOMBRE', titulo: 'Producto' },
                    { campo: 'CANTIDAD', titulo: 'Cantidad', alinear: 'derecha' },
                    { campo: 'PRECIO_UNITARIO', titulo: 'Precio', alinear: 'derecha', render: (f) => dinero(f.PRECIO_UNITARIO) },
                    { campo: 'SUBTOTAL', titulo: 'Subtotal', alinear: 'derecha', render: (f) => dinero(f.SUBTOTAL) }
                ]}
                campos={[
                    { nombre: 'ID_PRODUCTO', etiqueta: 'Producto', tipo: 'select', requerido: true, ancho: 'completo',
                        deshabilitado: (v, modo) => modo === 'editar',
                        opciones: productos.filter((p) => Number(p.ACTIVO) === 1)
                            .map((p) => ({ valor: p.ID_PRODUCTO, texto: `${p.NOMBRE} · ${dinero(p.PRECIO_ACTUAL)}` })) },
                    { nombre: 'CANTIDAD', etiqueta: 'Cantidad', tipo: 'number', requerido: true, min: 1 }
                ]}
            />
            <div className="mt-5 flex flex-wrap justify-end gap-2">
                {solicitud.ESTADO === 'BORRADOR' && (
                    <button type="button" className="btn" onClick={gestor.enviar}>
                        Enviar solicitud
                    </button>
                )}
                {solicitud.ESTADO === 'PENDIENTE' && (
                    <>
                        <button type="button" className="btn btn-peligro" onClick={gestor.rechazar}>
                            Rechazar
                        </button>
                        <button type="button" className="btn" onClick={gestor.aceptar}>
                            Aceptar (genera venta)
                        </button>
                    </>
                )}
                {solicitud.ID_VENTA && (
                    <Link className="btn btn-sec" to={`/ventas/${solicitud.ID_VENTA}`}>
                        Ver venta N° {solicitud.ID_VENTA}
                    </Link>
                )}
            </div>
        </Modal>
    );
}

export default function DetalleSolicitud({ solicitud, alCerrar, alCambiar }) {
    if (!solicitud) return null;
    return <Contenido solicitud={solicitud} alCerrar={alCerrar} alCambiar={alCambiar} />;
}
