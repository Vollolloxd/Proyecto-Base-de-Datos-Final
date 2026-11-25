// Vista: intentos de inicio de sesion (exitosos y fallidos) del periodo
import { useState } from 'react';
import { useDatos } from '../../../controladores/useDatos.js';
import { rutaLogins } from '../../../modelos/monitoreoModelo.js';
import { fechaHora } from '../../../utilidades/formato.js';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import { Barra, SelectorDias } from './partes.jsx';

export default function IntentosLogin() {
    const [soloFallidos, setSoloFallidos] = useState(false);
    const [dias, setDias] = useState(7);
    const { datos } = useDatos(rutaLogins(soloFallidos, dias));
    return (
        <>
            <Barra>
                <SelectorDias valor={dias} alCambiar={setDias} />
                <label className="casilla">
                    <input type="checkbox" checked={soloFallidos} onChange={(e) => setSoloFallidos(e.target.checked)} />
                    Solo intentos fallidos
                </label>
            </Barra>
            <Tabla filas={datos} claveFila={(f) => f.ID_AUDITORIA} vacio="Sin intentos en el período" columnas={[
                { campo: 'FECHA', titulo: 'Fecha', render: (f) => fechaHora(f.FECHA) },
                { campo: 'CORREO', titulo: 'Correo', render: (f) => f.CORREO?.toLowerCase() },
                { campo: 'EXITOSO', titulo: 'Exitoso', render: (f) => <Insignia valor={f.EXITOSO} texto={f.EXITOSO === 'SI' ? 'Sí' : 'No'} /> },
                { campo: 'MOTIVO', titulo: 'Motivo' },
                { campo: 'EQUIPO', titulo: 'Equipo' }
            ]} />
        </>
    );
}
