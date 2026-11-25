// Vista: detalle de un pedido del cliente (editable mientras esta en preparacion)
import { Link } from 'react-router-dom';
import { usePedido } from '../../../controladores/usePedido.js';
import { cantidadConUnidad, dinero, esPorKilo, unidadCorta } from '../../../utilidades/formato.js';
import Insignia from '../../componentes/Insignia.jsx';
import { Pie } from '../../componentes/Modal.jsx';
import Tabla from '../../componentes/Tabla.jsx';

const EXPLICACION = {
    BORRADOR: 'En preparación: puedes cambiar cantidades y enviarlo cuando esté listo.',
    PENDIENTE: 'Enviado: la viña lo está revisando.',
    ACEPTADA: 'Aceptado por la viña: tu compra fue registrada.',
    RECHAZADA: 'La viña no pudo aceptar este pedido (por ejemplo, por falta de stock).'
};

export default function DetallePedido({ pedido, alCambiar }) {
    const { lineas, editable, total, cambiarCantidad, quitar, anular, enviar } = usePedido(pedido, alCambiar);

    return (
        <div className="tarjeta">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="flex flex-wrap items-center gap-2">Pedido folio {pedido.NUMERO_FOLIO} <Insignia valor={pedido.ESTADO} /></h2>
                    <p className="mt-1 text-sm text-suave">{EXPLICACION[pedido.ESTADO]}</p>
                </div>
                <div className="text-2xl font-semibold tabular-nums text-vino">{dinero(total)}</div>
            </div>
            <Tabla
                filas={lineas} claveFila={(l) => l.ID_PRODUCTO} porPagina={20}
                vacio={<>Tu pedido está vacío. <Link to="/">Ir a la tienda</Link></>}
                columnas={[
                    { campo: 'NOMBRE', titulo: 'Producto' },
                    { campo: 'PRECIO_UNITARIO', titulo: 'Precio', alinear: 'derecha',
                        render: (l) => <>{dinero(l.PRECIO_UNITARIO)}<span className="text-xs text-suave"> / {esPorKilo(l.UNIDAD_MEDIDA) ? 'kg' : 'botella'}</span></> },
                    { campo: 'CANTIDAD', titulo: 'Cantidad', alinear: 'derecha',
                        render: (l) => (editable ? (
                            <span className="inline-flex items-center gap-1.5">
                            <input type="number" min="1" defaultValue={l.CANTIDAD} className="w-20 text-right"
                                aria-label={`Cantidad de ${l.NOMBRE} en ${esPorKilo(l.UNIDAD_MEDIDA) ? 'kilos' : 'botellas'}`}
                                onBlur={(e) => Number(e.target.value) !== l.CANTIDAD && cambiarCantidad(l, e.target.value)} />
                            <span className="w-14 text-left text-xs text-suave">{unidadCorta(l.UNIDAD_MEDIDA, l.CANTIDAD)}</span>
                            </span>
                        ) : cantidadConUnidad(l.CANTIDAD, l.UNIDAD_MEDIDA)) },
                    { campo: 'SUBTOTAL', titulo: 'Subtotal', alinear: 'derecha', render: (l) => dinero(l.SUBTOTAL) }
                ]}
                acciones={editable ? (l) => (
                    <button type="button" className="btn btn-peligro btn-sm" onClick={() => quitar(l)}>
                        Quitar
                    </button>
                ) : undefined}
            />
            {editable && (
                <Pie>
                    <button type="button" className="btn btn-sec" onClick={anular}>
                        Anular pedido
                    </button>
                    <button type="button" className="btn" disabled={lineas.length === 0} onClick={enviar}>
                        Enviar pedido
                    </button>
                </Pie>
            )}
        </div>
    );
}
