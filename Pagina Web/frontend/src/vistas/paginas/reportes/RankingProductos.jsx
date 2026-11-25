// Vista: reporte de productos mas y menos vendidos del mes (CEMJ_PA_REP_RANKING_PRODUCTOS)
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDatos } from '../../../controladores/useDatos.js';
import { rutaRanking } from '../../../modelos/reportesModelo.js';
import { dinero, mesActual, numero } from '../../../utilidades/formato.js';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import { COBRE, CURSOR, Cifra, Cifras, EJE, ErrorReporte, REJILLA, Reporte, TOOLTIP, VINO, Vacio } from './partes.jsx';

export default function RankingProductos() {
    const [mes, setMes] = useState(mesActual());
    const [anio, numMes] = mes.split('-');
    const { datos, cargando, error } = useDatos(rutaRanking(anio, Number(numMes)));
    const vendidos = datos.filter((d) => d.UNIDADES > 0);
    const mas = datos.find((d) => d.CLASIFICACION === 'MAS VENDIDO');
    const menos = datos.filter((d) => d.CLASIFICACION === 'MENOS VENDIDO');
    const totalMonto = datos.reduce((s, d) => s + d.MONTO, 0);

    return (
        <Reporte titulo="Productos más y menos vendidos del mes"
            pregunta="¿Qué productos rotan más y cuáles casi no se venden? Apoya la compra y el abastecimiento."
            filtros={<label className="filtro">Mes <input type="month" value={mes}
                onChange={(e) => e.target.value && setMes(e.target.value)} /></label>}>
            <ErrorReporte texto={error} />
            <Cifras>
                <Cifra etiqueta="Más vendido" valor={mas ? mas.PRODUCTO : '—'} detalle={mas && `${numero(mas.UNIDADES)} unidades`} />
                <Cifra etiqueta="Menos vendido" valor={menos.length ? menos.map((m) => m.PRODUCTO).join(', ') : '—'}
                    detalle={menos.length ? `${numero(menos[0].UNIDADES)} unidades` : ''} />
                <Cifra etiqueta="Monto vendido" valor={dinero(totalMonto)} />
            </Cifras>
            {!cargando && vendidos.length === 0 ? <Vacio texto="No hay ventas confirmadas en este mes." /> : (
                <div className="mb-3 w-full" style={{ height: Math.max(220, datos.length * 34) }}>
                    <ResponsiveContainer>
                        <BarChart data={datos} layout="vertical" margin={{ left: 20, right: 30 }}>
                            <CartesianGrid horizontal={false} stroke={REJILLA} />
                            <XAxis type="number" tick={EJE} allowDecimals={false} />
                            <YAxis type="category" dataKey="PRODUCTO" width={230} tick={EJE} />
                            <Tooltip formatter={(v) => [`${numero(v)} unidades`, 'Vendidas']} cursor={CURSOR} {...TOOLTIP} />
                            <Bar dataKey="UNIDADES" fill={VINO} radius={[0, 3, 3, 0]} maxBarSize={20} name="Unidades">
                                {datos.map((d) => <Cell key={d.CODIGO} fill={d.CLASIFICACION === 'MAS VENDIDO' ? COBRE : VINO} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
            <details>
                <summary>Ver tabla</summary>
                <Tabla filas={datos} claveFila={(d) => d.CODIGO} porPagina={20} columnas={[
                    { campo: 'POS_MAS_VENDIDO', titulo: '#' },
                    { campo: 'PRODUCTO', titulo: 'Producto' },
                    { campo: 'UNIDADES', titulo: 'Unidades', alinear: 'derecha', render: (d) => numero(d.UNIDADES) },
                    { campo: 'MONTO', titulo: 'Monto', alinear: 'derecha', render: (d) => dinero(d.MONTO) },
                    { campo: 'PCT_UNIDADES', titulo: '% unidades', alinear: 'derecha',
                        render: (d) => (d.PCT_UNIDADES != null ? `${d.PCT_UNIDADES}%` : '') },
                    { campo: 'CLASIFICACION', titulo: '', render: (d) => <Insignia valor={d.CLASIFICACION} /> }
                ]} />
            </details>
        </Reporte>
    );
}
