// Pagina: monitoreo (pestañas de auditoria, alertas de stock e intentos de inicio de sesion)
import { useState } from 'react';
import Cabecera from '../../componentes/Cabecera.jsx';
import AlertasStock from './AlertasStock.jsx';
import Auditoria from './Auditoria.jsx';
import IntentosLogin from './IntentosLogin.jsx';

const PESTANAS = [
    { id: 'auditoria', texto: 'Auditoría de cambios', componente: Auditoria },
    { id: 'alertas', texto: 'Alertas de stock', componente: AlertasStock },
    { id: 'logins', texto: 'Intentos de inicio de sesión', componente: IntentosLogin }
];

export default function Monitoreo() {
    const [pestana, setPestana] = useState('auditoria');
    const Actual = PESTANAS.find((p) => p.id === pestana).componente;
    return (
        <section>
            <Cabecera titulo="Monitoreo"
                descripcion="Registro automático de los triggers de la base de datos: quién cambió qué y cuándo. Este registro no se puede modificar ni borrar." />
            <div className="mb-4 flex flex-wrap gap-1 border-b border-borde" role="tablist">
                {PESTANAS.map((p) => (
                    <button key={p.id} type="button" role="tab" aria-selected={pestana === p.id}
                        onClick={() => setPestana(p.id)}
                        className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors ${pestana === p.id
                            ? 'border-vino font-semibold text-vino'
                            : 'border-transparent text-suave hover:text-tinta'}`}>
                        {p.texto}
                    </button>
                ))}
            </div>
            <Actual />
        </section>
    );
}
