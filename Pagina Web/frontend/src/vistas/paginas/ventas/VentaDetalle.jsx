// Pagina: detalle de una venta (productos, agregar, confirmar con pago y anular)
import { useParams } from 'react-router-dom';
import { useVentaDetalle } from '../../../controladores/useVentaDetalle.js';
import { dinero, fechaHora } from '../../../utilidades/formato.js';
import Cabecera from '../../componentes/Cabecera.jsx';
import Cargando from '../../componentes/Cargando.jsx';
import Formulario from '../../componentes/Formulario.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import { Dato, PanelAccion, Volver } from './partes.jsx';

export default function VentaDetalle() {
    const { id } = useParams();
    const v = useVentaDetalle(id);
    const { venta } = v;

    if (v.cargando && !venta) return <Cargando />;
    if (!venta) {
        return (
            <section>
                <Volver />
                <h1>Venta no encontrada</h1>
            </section>
        );
    }

    return (
        <section>
            <Volver />
            <Cabecera
                titulo={<>Venta N° {venta.ID_VENTA} <Insignia valor={venta.ESTADO} /> <Insignia valor={venta.CANAL_VENTA} /></>}
                descripcion={<>
                    {venta.COMPRADOR || 'Comprador de mostrador'}
                    {venta.FOLIO_SOLICITUD && ` · Solicitud web folio ${venta.FOLIO_SOLICITUD}`}
                    {venta.LUGAR_VENTA && ` · ${venta.LUGAR_VENTA}`}
                </>}>
                <div className="text-3xl font-semibold tabular-nums text-vino">{dinero(v.total)}</div>
            </Cabecera>

            <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-borde bg-white p-5 md:grid-cols-4">
                <Dato etiqueta="Creada">{fechaHora(venta.FECHA_CREACION)}</Dato>
                <Dato etiqueta="Confirmada">{fechaHora(venta.FECHA_CONFIRMACION) || '—'}</Dato>
                <Dato etiqueta="Pago">
                    {venta.METODO_PAGO || (venta.METODO_ELEGIDO ? `${venta.METODO_ELEGIDO} (elegido por el cliente)` : '—')}
                </Dato>
                <Dato etiqueta="Vendedor">{venta.VENDEDOR?.toLowerCase()}</Dato>
                {venta.ESTADO === 'ANULADA' && (
                    <Dato etiqueta="Anulada" ancho>{fechaHora(venta.FECHA_ANULACION)} · {venta.MOTIVO_ANULACION}</Dato>
                )}
            </div>

            <h2 className="mb-3">Productos</h2>
            <Tabla
                filas={v.lineas} claveFila={(l) => l.ID_PRODUCTO} vacio="Aún no hay productos en esta venta"
                columnas={[
                    { campo: 'CODIGO', titulo: 'Código' },
                    { campo: 'NOMBRE', titulo: 'Producto' },
                    { campo: 'CANTIDAD', titulo: 'Cantidad', alinear: 'derecha' },
                    { campo: 'PRECIO_UNITARIO', titulo: 'Precio', alinear: 'derecha', render: (l) => dinero(l.PRECIO_UNITARIO) },
                    { campo: 'SUBTOTAL', titulo: 'Subtotal', alinear: 'derecha', render: (l) => dinero(l.SUBTOTAL) }
                ]}
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
                {venta.ESTADO === 'BORRADOR' && venta.CANAL_VENTA === 'PRESENCIAL' && (
                    <PanelAccion titulo="Agregar producto" ayuda="Se usa el precio vigente y se valida el stock disponible."
                        onSubmit={v.agregarProducto}>
                        <Formulario valores={v.agregar} alCambiar={v.setAgregar} campos={[
                            { nombre: 'ID_PRODUCTO', etiqueta: 'Producto', tipo: 'select', requerido: true, ancho: 'completo',
                                opciones: v.activos.map((p) => ({ valor: p.ID_PRODUCTO,
                                    texto: `${p.NOMBRE} · ${dinero(p.PRECIO_ACTUAL)} · stock ${p.STOCK_ACTUAL}` })) },
                            { nombre: 'CANTIDAD', etiqueta: 'Cantidad', tipo: 'number', requerido: true, min: 1 }
                        ]} />
                        <button type="submit" className="btn self-start">Agregar</button>
                    </PanelAccion>
                )}

                {venta.ESTADO === 'BORRADOR' && (
                    <PanelAccion titulo="Confirmar venta y registrar pago"
                        ayuda={`Descuenta el stock y registra el pago por el total (${dinero(v.total)}).`}
                        onSubmit={v.confirmar}>
                        {venta.METODO_ELEGIDO && (
                            <p className="text-sm">
                                Método de pago elegido por el cliente: <strong>{venta.METODO_ELEGIDO}</strong>
                            </p>
                        )}
                        <Formulario valores={v.pago} alCambiar={v.setPago} campos={[
                            { nombre: 'ID_METODO_PAGO', etiqueta: 'Método de pago', tipo: 'select', requerido: true,
                                visible: () => !venta.METODO_ELEGIDO,
                                opciones: v.metodos.map((m) => ({ valor: m.ID_METODO_PAGO, texto: m.NOMBRE })) }
                        ]} />
                        <p className="text-xs text-suave">El N° de referencia del pago se asigna automáticamente al confirmar.</p>
                        <button type="submit" className="btn self-start" disabled={v.lineas.length === 0}>Confirmar venta</button>
                    </PanelAccion>
                )}

                {venta.ESTADO === 'CONFIRMADA' && (
                    <PanelAccion titulo="Anular venta" ayuda="Genera movimientos de reversión y devuelve el stock."
                        onSubmit={v.anular}>
                        <label htmlFor="motivo" className="text-sm font-semibold">Motivo</label>
                        <textarea id="motivo" rows={3} value={v.motivo} onChange={(e) => v.setMotivo(e.target.value)} required />
                        <button type="submit" className="btn btn-peligro self-start">Anular venta</button>
                    </PanelAccion>
                )}
            </div>
        </section>
    );
}
