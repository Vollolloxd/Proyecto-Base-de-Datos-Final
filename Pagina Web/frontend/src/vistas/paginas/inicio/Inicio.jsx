// Pagina: resumen de operaciones del panel (indicadores reales y listas de trabajo)
import { useInicio } from '../../../controladores/useInicio.js';
import { dinero, fechaHora, nombrePropio, numero } from '../../../utilidades/formato.js';
import Cabecera from '../../componentes/Cabecera.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import Indicador from './Indicador.jsx';
import { ListaVacia, PanelLista } from './PanelLista.jsx';

export default function Inicio() {
    const r = useInicio();
    const { tiene, alertas, pendientes, bajoMinimo } = r;

    const indicadores = [
        tiene('VENTAS') && (
            <Indicador key="v" a="/ventas" etiqueta={`Ventas confirmadas · ${r.nombreMes}`}
                valor={dinero(r.montoDelMes)}
                detalle={`${numero(r.ventasDelMes.length)} venta${r.ventasDelMes.length === 1 ? '' : 's'}`} />
        ),
        tiene('SOLICITUDES') && (
            <Indicador key="s" a="/solicitudes" etiqueta="Solicitudes web pendientes" valor={numero(pendientes.length)}
                detalle={pendientes.length ? 'Por revisar' : 'Sin solicitudes por revisar'} />
        ),
        alertas?.cantidad !== undefined && (
            <Indicador key="a" a={tiene('REPORTES') ? '/reportes' : '/inventario'} etiqueta="Productos bajo el stock mínimo"
                valor={numero(alertas.cantidad)} alerta={alertas.cantidad > 0}
                detalle={alertas.cantidad ? 'Requieren reposición' : 'Stock sobre el mínimo'} />
        ),
        tiene('MIS_SOLICITUDES') && (
            <Indicador key="p" a="/mis-pedidos" etiqueta="Mis pedidos" valor={numero(r.pedidos.length)}
                detalle={`${r.pedidos.filter((p) => p.ESTADO === 'PENDIENTE').length} en revisión`} />
        )
    ].filter(Boolean);

    return (
        <section>
            <Cabecera
                titulo={r.esPersonal ? 'Resumen de operaciones' : 'Mi cuenta'}
                descripcion={r.esPersonal
                    ? `${nombrePropio(r.usuario?.rol)} · ${r.usuario?.correo?.toLowerCase() || ''}`
                    : 'Revisa tus pedidos o vuelve a la tienda para agregar productos.'}
            />

            {indicadores.length > 0 && (
                <div className={`grid divide-y divide-borde overflow-hidden rounded-lg border border-borde bg-white sm:divide-y-0 sm:divide-x
                        ${indicadores.length >= 3 ? 'sm:grid-cols-3' : indicadores.length === 2 ? 'sm:grid-cols-2' : ''}`}>
                    {indicadores}
                </div>
            )}

            {(tiene('SOLICITUDES') || r.veStock) && (
                <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {tiene('SOLICITUDES') && (
                        <PanelLista titulo="Solicitudes por revisar" enlace="/solicitudes" textoEnlace="Ver solicitudes">
                            {pendientes.length === 0 ? <ListaVacia texto="No hay solicitudes pendientes." /> : (
                                <ul className="divide-y divide-stone-100">
                                    {pendientes.slice(0, 5).map((s) => (
                                        <li key={s.ID_SOLICITUD} className="flex min-h-[56px] items-center gap-4 px-5 py-2.5 text-sm">
                                            <span className="w-16 shrink-0 tabular-nums text-suave">N° {s.NUMERO_FOLIO}</span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate font-medium">{s.CLIENTE}</span>
                                                <span className="block text-xs text-suave">{fechaHora(s.FECHA_CREACION)}</span>
                                            </span>
                                            <span className="tabular-nums">{dinero(s.TOTAL)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </PanelLista>
                    )}
                    {r.veStock && (
                        <PanelLista titulo="Productos bajo el stock mínimo" enlace={tiene('INVENTARIO') ? '/inventario' : '/productos'}
                            textoEnlace={tiene('INVENTARIO') ? 'Ver inventario' : 'Ver productos'}>
                            {bajoMinimo.length === 0 ? <ListaVacia texto="Todos los productos activos están sobre su mínimo." /> : (
                                <ul className="divide-y divide-stone-100">
                                    {bajoMinimo.slice(0, 5).map((p) => (
                                        <li key={p.ID_PRODUCTO} className="flex min-h-[56px] flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 text-sm">
                                            <span className="min-w-0 flex-1 truncate font-medium">{p.NOMBRE}</span>
                                            <span className="tabular-nums text-suave">
                                                <strong className="font-semibold text-peligro">{numero(p.STOCK_ACTUAL)}</strong> de {numero(p.STOCK_MINIMO)} mín.
                                            </span>
                                            <Insignia valor={p.STOCK_ACTUAL <= 0 ? 'SIN STOCK' : 'BAJO MINIMO'} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </PanelLista>
                    )}
                </div>
            )}
        </section>
    );
}
