import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGestorSolicitud } from '../../../controladores/useGestorSolicitud.js';
import { dinero } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import Modal from '../../componentes/Modal.jsx';

function Contenido({ solicitud, alCerrar, alCambiar }) {
    const gestor = useGestorSolicitud(solicitud, { alCambiar, alCerrar });
    const [rechazando, setRechazando] = useState(false);
    const [motivo, setMotivo] = useState('');
    const pendiente = solicitud.ESTADO === 'PENDIENTE';
    const ocupado = Boolean(gestor.accionEnCurso);

    return (
        <Modal titulo={`Solicitud folio ${solicitud.NUMERO_FOLIO}`} abierto alCerrar={alCerrar} ancho="grande">
            <p className="mb-3 text-sm text-suave">
                {solicitud.CLIENTE} · <Insignia valor={solicitud.ESTADO} /> · Total {dinero(solicitud.TOTAL)}
                {solicitud.METODO_PAGO && <><br />Método de pago: {solicitud.METODO_PAGO}</>}
                {solicitud.ID_TRANSACCION && <><br />ID de transacción: {solicitud.ID_TRANSACCION}</>}
                {solicitud.OBSERVACIONES && <><br />Observaciones: {solicitud.OBSERVACIONES}</>}
                {solicitud.MOTIVO_RECHAZO && <><br />Motivo de rechazo: {solicitud.MOTIVO_RECHAZO}</>}
            </p>
            <CrudPagina
                embebido recurso="detalle-solicitud" ids={['ID_PRODUCTO']} soloLectura
                filtros={{ idSolicitud: solicitud.ID_SOLICITUD }} porPagina={8}
                columnas={[
                    { campo: 'NOMBRE', titulo: 'Producto' },
                    { campo: 'CANTIDAD', titulo: 'Cantidad', alinear: 'derecha' },
                    { campo: 'PRECIO_UNITARIO', titulo: 'Precio', alinear: 'derecha', render: (f) => dinero(f.PRECIO_UNITARIO) },
                    { campo: 'SUBTOTAL', titulo: 'Subtotal', alinear: 'derecha', render: (f) => dinero(f.SUBTOTAL) }
                ]}
            />
            {rechazando ? (
                <form className="mt-5" onSubmit={(e) => {
                    e.preventDefault();
                    if (motivo.trim() && !ocupado) gestor.rechazar(motivo.trim());
                }}>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="motivo-rechazo" className="text-sm font-semibold">Motivo de rechazo (obligatorio)</label>
                        <textarea id="motivo-rechazo" rows={3} required maxLength={500} disabled={ocupado}
                            value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                    </div>
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <button type="button" className="btn btn-sec" disabled={ocupado} onClick={() => setRechazando(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-peligro" disabled={ocupado || !motivo.trim()}>
                            {ocupado ? 'Rechazando…' : 'Confirmar rechazo'}
                        </button>
                    </div>
                </form>
            ) : <div className="mt-5 flex flex-wrap justify-end gap-2">
                {pendiente && (
                    <button type="button" className="btn btn-exito" onClick={gestor.aceptar} disabled={ocupado}>
                        {gestor.accionEnCurso === 'aceptar' ? 'Aceptando…' : 'Aceptar solicitud'}
                    </button>
                )}
                {pendiente && (
                    <button type="button" className="btn btn-peligro" onClick={() => setRechazando(true)} disabled={ocupado}>
                        Rechazar solicitud
                    </button>
                )}
                {solicitud.ESTADO === 'BORRADOR' && (
                    <button type="button" className="btn btn-peligro" onClick={gestor.anular} disabled={ocupado}>
                        {gestor.accionEnCurso === 'anular' ? 'Anulando…' : 'Anular solicitud'}
                    </button>
                )}
                {solicitud.ID_VENTA && (
                    <Link className="btn btn-sec" to={`/ventas/${solicitud.ID_VENTA}`}>
                        Ver venta N° {solicitud.ID_VENTA}
                    </Link>
                )}
            </div>}
        </Modal>
    );
}

export default function DetalleSolicitud({ solicitud, alCerrar, alCambiar }) {
    if (!solicitud) return null;
    return <Contenido solicitud={solicitud} alCerrar={alCerrar} alCambiar={alCambiar} />;
}
