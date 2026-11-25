// Vista: reporte de ventas mensuales por canal, presencial y digital (CEMJ_PA_REP_VENTAS_CANAL)
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDatos } from '../../../controladores/useDatos.js';
import { rutaVentasCanal } from '../../../modelos/reportesModelo.js';
import { dinero, numero } from '../../../utilidades/formato.js';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import { CURSOR, Cifra, Cifras, EJE, ErrorReporte, PIZARRA, REJILLA, Reporte, TOOLTIP, VINO, Vacio, pesosCortos } from './partes.jsx';

export default function VentasPorCanal() {
    const [anio, setAnio] = useState(new Date().getFullYear());
    const { datos, error, cargando } = useDatos(rutaVentasCanal(anio));

    const porMes = useMemo(() => {
        const mapa = {};
        datos.forEach((d) => {
            mapa[d.MES] = mapa[d.MES] || { MES: d.MES, PRESENCIAL: 0, DIGITAL: 0 };
            mapa[d.MES][d.CANAL_VENTA] = d.MONTO_VENDIDO;
        });
        return Object.values(mapa);
    }, [datos]);

    const total = datos.reduce((s, d) => s + d.MONTO_VENDIDO, 0);
    const digital = datos.filter((d) => d.CANAL_VENTA === 'DIGITAL').reduce((s, d) => s + d.MONTO_VENDIDO, 0);
    const confirmadas = datos.reduce((s, d) => s + d.VENTAS_CONFIRMADAS, 0);

    return (
        <Reporte titulo="Ventas mensuales por canal"
            pregunta="¿Cuánto se vende en sala y cuánto por el sitio web? Mide el avance del canal digital."
            filtros={<label className="filtro">Año <input type="number" value={anio} min="2020" max="2100"
                onChange={(e) => setAnio(e.target.value)} className="w-24" /></label>}>
            <ErrorReporte texto={error} />
            <Cifras>
                <Cifra etiqueta="Monto vendido en el año" valor={cargando ? '—' : dinero(total)} />
                <Cifra etiqueta="Ventas confirmadas" valor={cargando ? '—' : numero(confirmadas)} />
                <Cifra etiqueta="Participación digital" valor={total ? `${((100 * digital) / total).toFixed(1)}%` : '—'} />
            </Cifras>
            {cargando && porMes.length === 0 ? <div className="esqueleto mb-3 h-[300px] w-full" role="status" aria-label="Cargando" /> : porMes.length === 0 ? <Vacio texto="No hay ventas en este año." /> : (
                <div className="mb-3 h-[300px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={porMes} margin={{ left: 10, right: 10 }}>
                            <CartesianGrid vertical={false} stroke={REJILLA} />
                            <XAxis dataKey="MES" tick={EJE} />
                            <YAxis tickFormatter={pesosCortos} tick={EJE} width={70} />
                            <Tooltip formatter={(v, n) => [dinero(v), n === 'PRESENCIAL' ? 'Presencial' : 'Digital']}
                                cursor={CURSOR} {...TOOLTIP} />
                            <Legend formatter={(v) => (v === 'PRESENCIAL' ? 'Presencial' : 'Digital')} />
                            <Bar dataKey="PRESENCIAL" stackId="a" fill={VINO} stroke="#fff" strokeWidth={2} maxBarSize={48} />
                            <Bar dataKey="DIGITAL" stackId="a" fill={PIZARRA} stroke="#fff" strokeWidth={2} maxBarSize={48}
                                radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
            <details>
                <summary>Ver tabla</summary>
                <Tabla filas={datos} claveFila={(d) => `${d.MES}-${d.CANAL_VENTA}`} porPagina={24} columnas={[
                    { campo: 'MES', titulo: 'Mes' },
                    { campo: 'CANAL_VENTA', titulo: 'Canal', render: (d) => <Insignia valor={d.CANAL_VENTA} /> },
                    { campo: 'VENTAS_CONFIRMADAS', titulo: 'Confirmadas', alinear: 'derecha' },
                    { campo: 'VENTAS_ANULADAS', titulo: 'Anuladas', alinear: 'derecha' },
                    { campo: 'MONTO_VENDIDO', titulo: 'Monto', alinear: 'derecha', render: (d) => dinero(d.MONTO_VENDIDO) },
                    { campo: 'TICKET_PROMEDIO', titulo: 'Ticket promedio', alinear: 'derecha', render: (d) => dinero(d.TICKET_PROMEDIO) },
                    { campo: 'PCT_DEL_MES', titulo: '% del mes', alinear: 'derecha', render: (d) => `${d.PCT_DEL_MES}%` }
                ]} />
            </details>
        </Reporte>
    );
}
