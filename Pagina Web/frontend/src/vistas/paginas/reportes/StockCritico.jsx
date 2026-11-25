// Vista: reporte de stock critico y reposicion sugerida (CEMJ_PA_REP_STOCK_CRITICO)
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDatos } from '../../../controladores/useDatos.js';
import { rutaStockCritico } from '../../../modelos/reportesModelo.js';
import { numero } from '../../../utilidades/formato.js';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import { BARRA, CURSOR, Cifra, Cifras, EJE, ErrorReporte, PIZARRA, REJILLA, Reporte, TOOLTIP, VINO } from './partes.jsx';

export default function StockCritico() {
    const [dias, setDias] = useState(30);
    const [soloAlertas, setSoloAlertas] = useState(false);
    const { datos, error } = useDatos(rutaStockCritico(dias, soloAlertas));
    const alertas = datos.filter((d) => d.ESTADO_STOCK !== 'OK');

    return (
        <Reporte titulo="Stock crítico y reposición"
            pregunta="¿Qué productos se van a agotar y cuánto hay que reponer según lo que se vende?"
            filtros={<>
                <label className="filtro">Período <select value={dias} onChange={(e) => setDias(e.target.value)}>
                    <option value={7}>7 días</option><option value={30}>30 días</option><option value={90}>90 días</option>
                </select></label>
                <label className="casilla">
                    <input type="checkbox" checked={soloAlertas} onChange={(e) => setSoloAlertas(e.target.checked)} />
                    Solo alertas
                </label>
            </>}>
            <ErrorReporte texto={error} />
            <Cifras>
                <Cifra etiqueta="Productos con alerta" valor={numero(alertas.length)} />
                <Cifra etiqueta="Unidades sugeridas a reponer"
                    valor={numero(datos.reduce((s, d) => s + d.SUGERIDO_REPONER, 0))} />
            </Cifras>
            {datos.length > 0 && (
                <div className="mb-3 h-[280px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={datos} margin={{ left: 0, right: 10, bottom: 50 }}>
                            <CartesianGrid vertical={false} stroke={REJILLA} />
                            <XAxis dataKey="CODIGO" tick={{ ...EJE, fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                            <YAxis tick={EJE} allowDecimals={false} />
                            <Tooltip cursor={CURSOR} {...TOOLTIP}
                                formatter={(v, n) => [numero(v), n === 'STOCK_ACTUAL' ? 'Stock actual' : 'Stock mínimo']} />
                            <Legend verticalAlign="top" formatter={(v) => (v === 'STOCK_ACTUAL' ? 'Stock actual' : 'Stock mínimo')} />
                            <Bar dataKey="STOCK_ACTUAL" fill={VINO} {...BARRA} />
                            <Bar dataKey="STOCK_MINIMO" fill={PIZARRA} {...BARRA} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
            <Tabla filas={datos} claveFila={(d) => d.CODIGO} porPagina={20} vacio="Sin productos con alerta" columnas={[
                { campo: 'PRODUCTO', titulo: 'Producto' },
                { campo: 'STOCK_ACTUAL', titulo: 'Stock', alinear: 'derecha' },
                { campo: 'STOCK_MINIMO', titulo: 'Mínimo', alinear: 'derecha' },
                { campo: 'VENDIDAS_PERIODO', titulo: `Vendidas (${dias} d)`, alinear: 'derecha' },
                { campo: 'DIAS_COBERTURA', titulo: 'Cobertura', alinear: 'derecha',
                    render: (d) => (d.DIAS_COBERTURA != null ? `${d.DIAS_COBERTURA} días` : '—') },
                { campo: 'ESTADO_STOCK', titulo: 'Estado', render: (d) => <Insignia valor={d.ESTADO_STOCK} /> },
                { campo: 'SUGERIDO_REPONER', titulo: 'Reponer', alinear: 'derecha',
                    render: (d) => (d.SUGERIDO_REPONER > 0 ? <strong>{d.SUGERIDO_REPONER}</strong> : 0) }
            ]} />
        </Reporte>
    );
}
