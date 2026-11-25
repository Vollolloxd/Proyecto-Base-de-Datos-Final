// Vista: alertas de stock (bajo el minimo y repuestos) del periodo
import { useState } from 'react';
import { useDatos } from '../../../controladores/useDatos.js';
import { rutaAlertasStock } from '../../../modelos/monitoreoModelo.js';
import { fechaHora } from '../../../utilidades/formato.js';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import { Barra, SelectorDias } from './partes.jsx';

export default function AlertasStock() {
    const [soloBajo, setSoloBajo] = useState(false);
    const [dias, setDias] = useState(30);
    const { datos } = useDatos(rutaAlertasStock(soloBajo, dias));
    return (
        <>
            <Barra>
                <SelectorDias valor={dias} alCambiar={setDias} />
                <label className="casilla">
                    <input type="checkbox" checked={soloBajo} onChange={(e) => setSoloBajo(e.target.checked)} />
                    Solo productos que hoy siguen bajo el mínimo
                </label>
            </Barra>
            <Tabla filas={datos} claveFila={(f) => f.ID_AUDITORIA} vacio="Sin alertas en el período" columnas={[
                { campo: 'FECHA', titulo: 'Fecha', render: (f) => fechaHora(f.FECHA) },
                { campo: 'OPERACION', titulo: 'Evento', render: (f) => <Insignia valor={f.OPERACION} /> },
                { campo: 'PRODUCTO', titulo: 'Producto' },
                { campo: 'DETALLE', titulo: 'Detalle' },
                { campo: 'STOCK_HOY', titulo: 'Stock hoy', alinear: 'derecha' },
                { campo: 'SITUACION_HOY', titulo: 'Situación hoy', render: (f) => <Insignia valor={f.SITUACION_HOY} /> }
            ]} />
        </>
    );
}
