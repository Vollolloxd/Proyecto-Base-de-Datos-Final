import { Link } from 'react-router-dom';
import { usePedido } from '../../../controladores/usePedido.js';
import { cantidadConUnidad, dinero, esPorKilo, unidadCorta } from '../../../utilidades/formato.js';
import Insignia from '../../componentes/Insignia.jsx';
import { Pie } from '../../componentes/Modal.jsx';
import Tabla from '../../componentes/Tabla.jsx';

const EXPLICACION = {
    BORRADOR: 'Elige un método de pago y envía cada producto cuando esté listo.',
    PENDIENTE: 'Enviado a la viña.',
    ACEPTADA: 'Aceptado por la viña: tu compra fue registrada.',
    RECHAZADA: 'La viña cerró esta solicitud.'
};

function SelectorPago({ id, etiqueta, metodos, valor, alCambiar, deshabilitado }) {
    return (
        <select id={id} aria-label={etiqueta} value={valor} disabled={deshabilitado || metodos.length === 0}
            onChange={(e) => alCambiar(e.target.value)}>
            <option value="">Selecciona un método</option>
            {metodos.map((m) => <option key={m.ID_METODO_PAGO} value={m.ID_METODO_PAGO}>{m.NOMBRE}</option>)}
        </select>
    );
}

export default function DetallePedido({ pedido, alCambiar }) {
    const p = usePedido(pedido, alCambiar);
    const idMetodo = `pedido-${pedido.ID_SOLICITUD}-metodo`;
    const selector = (linea) => (
        <SelectorPago id={linea ? `${idMetodo}-${linea.ID_PRODUCTO}` : idMetodo}
            etiqueta={linea ? `Método de pago para ${linea.NOMBRE}` : 'Método de pago'}
            metodos={p.metodos} valor={p.metodoDe(linea?.ID_PRODUCTO)}
            deshabilitado={p.cargandoMetodos || p.ocupado}
            alCambiar={(valor) => p.setMetodo(linea?.ID_PRODUCTO ?? 'pedido', valor)} />
    );

    return (
        <div className="tarjeta">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="flex flex-wrap items-center gap-2">Pedido folio {pedido.NUMERO_FOLIO} <Insignia valor={pedido.ESTADO} /></h2>
                    <p className="mt-1 text-sm text-suave">
                        {pedido.ESTADO === 'ACEPTADA' && pedido.ESTADO_VENTA === 'BORRADOR'
                            ? 'Aceptado por la viña. El registro del pago está pendiente.'
                            : EXPLICACION[pedido.ESTADO]}
                    </p>
                    {pedido.MOTIVO_RECHAZO && <p className="text-sm">Motivo de rechazo: {pedido.MOTIVO_RECHAZO}</p>}
                    {pedido.METODO_PAGO && <p className="text-sm">Método de pago: {pedido.METODO_PAGO}</p>}
                    {pedido.ID_TRANSACCION && <p className="break-all text-sm">ID de transacción: {pedido.ID_TRANSACCION}</p>}
                </div>
                <div className="text-2xl font-semibold tabular-nums text-vino">{dinero(p.total)}</div>
            </div>
            <Tabla
                filas={p.lineas} claveFila={(l) => l.ID_PRODUCTO} porPagina={20}
                vacio={<>Tu pedido está vacío. <Link to="/">Ir a la tienda</Link></>}
                columnas={[
                    { campo: 'NOMBRE', titulo: 'Producto' },
                    { campo: 'PRECIO_UNITARIO', titulo: 'Precio', alinear: 'derecha',
                        render: (l) => <>{dinero(l.PRECIO_UNITARIO)}<span className="text-xs text-suave"> / {esPorKilo(l.UNIDAD_MEDIDA) ? 'kg' : 'botella'}</span></> },
                    { campo: 'CANTIDAD', titulo: 'Cantidad', alinear: 'derecha',
                        render: (l) => p.editable ? (
                            <span className="inline-flex items-center gap-1.5">
                                <input type="number" min="0" step="any" value={p.cantidadDe(l)} className="w-20 text-right"
                                    aria-label={`Cantidad de ${l.NOMBRE}`} aria-invalid={!p.cantidadValida(l)}
                                    disabled={p.ocupado} onChange={(e) => p.cambiarCantidad(l, e.target.value)} />
                                <span className="w-14 text-left text-xs text-suave">{unidadCorta(l.UNIDAD_MEDIDA, p.cantidadDe(l))}</span>
                                {Number(p.cantidadDe(l)) !== Number(l.CANTIDAD) && (
                                    <button type="button" className="btn btn-sec btn-sm"
                                        disabled={!p.cantidadValida(l) || p.ocupado} onClick={() => p.guardarCantidad(l)}>
                                        Guardar cantidad
                                    </button>
                                )}
                            </span>
                        ) : cantidadConUnidad(l.CANTIDAD, l.UNIDAD_MEDIDA) },
                    { campo: 'SUBTOTAL', titulo: 'Subtotal', alinear: 'derecha', render: (l) => dinero(p.subtotalDe(l)) },
                    ...(p.editable ? [{ titulo: 'Método de pago', render: selector }] : [])
                ]}
                acciones={p.editable ? (l) => (
                    <div className="flex justify-end gap-2">
                        <button type="button" className="btn btn-peligro btn-sm" disabled={p.ocupado} onClick={() => p.quitar(l)}>
                            Quitar
                        </button>
                        <button type="button" className="btn btn-sm"
                            disabled={p.ocupado || p.cargandoMetodos || !p.cantidadValida(l) || !p.metodoValido(l.ID_PRODUCTO)}
                            onClick={() => p.enviarProducto(l)}>
                            Enviar producto
                        </button>
                    </div>
                ) : undefined}
            />
            {(p.editable || p.necesitaMetodo) && p.errorMetodos && (
                <p role="alert" className="mt-2 text-sm text-peligro">{p.errorMetodos}</p>
            )}
            {(p.editable || p.necesitaMetodo) && !p.cargandoMetodos && !p.errorMetodos && p.metodos.length === 0 && (
                <p className="mt-2 text-sm text-suave">No hay métodos de pago disponibles.</p>
            )}
            {p.editable && (
                <Pie>
                    <button type="button" className="btn btn-sec" onClick={p.anular} disabled={p.ocupado}>
                        Anular pedido
                    </button>
                </Pie>
            )}
            {p.necesitaMetodo && (
                <form className="mt-4" onSubmit={p.guardarMetodo}>
                    <div className="flex max-w-sm flex-col gap-1">
                        <label htmlFor={idMetodo} className="text-sm font-medium">Método de pago</label>
                        {selector()}
                    </div>
                    <Pie>
                        <button type="submit" className="btn" disabled={p.ocupado || p.cargandoMetodos ||
                            !p.metodoValido() || p.metodoDe() === String(pedido.ID_METODO_PAGO)}>
                            Guardar método de pago
                        </button>
                    </Pie>
                </form>
            )}
        </div>
    );
}
