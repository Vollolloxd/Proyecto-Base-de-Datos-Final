// Vista: auditoria de cambios registrada por los triggers (filtro por tabla y periodo)
import { useState } from 'react';
import { useDatos } from '../../../controladores/useDatos.js';
import { rutaAuditoria } from '../../../modelos/monitoreoModelo.js';
import { fechaHora } from '../../../utilidades/formato.js';
import Cargando from '../../componentes/Cargando.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import { Barra, SelectorDias } from './partes.jsx';

const TABLAS = ['USUARIO', 'CLIENTE', 'PRODUCTO', 'VENTA', 'PAGO', 'MOVIMIENTO_INVENTARIO', 'INVENTARIO', 'LOGIN'];

export default function Auditoria() {
    const [tabla, setTabla] = useState('');
    const [dias, setDias] = useState(7);
    const { datos, cargando } = useDatos(rutaAuditoria(tabla, dias));
    return (
        <>
            <Barra>
                <label className="filtro">Tabla <select value={tabla} onChange={(e) => setTabla(e.target.value)}>
                    <option value="">Todas</option>
                    {TABLAS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select></label>
                <SelectorDias valor={dias} alCambiar={setDias} />
            </Barra>
            {cargando && datos.length === 0 ? <Cargando /> : (
                <Tabla filas={datos} claveFila={(f) => f.ID_AUDITORIA} vacio="Sin registros en el período" columnas={[
                    { campo: 'FECHA', titulo: 'Fecha', render: (f) => fechaHora(f.FECHA) },
                    { campo: 'USUARIO_APP', titulo: 'Usuario', render: (f) => f.USUARIO_APP?.toLowerCase() },
                    { campo: 'TABLA', titulo: 'Tabla' },
                    { campo: 'OPERACION', titulo: 'Operación', render: (f) => <Insignia valor={f.OPERACION} /> },
                    { campo: 'ID_REGISTRO', titulo: 'Registro' },
                    { campo: 'DETALLE', titulo: 'Detalle' }
                ]} />
            )}
        </>
    );
}
