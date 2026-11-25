// Vista: formulario de inicio de sesion (correo y contraseña)
import { useIngreso } from '../../controladores/useIngreso.js';
import CampoClave from '../componentes/CampoClave.jsx';
import AlertaError from './AlertaError.jsx';
import Campo from './Campo.jsx';

export default function FormularioIngreso({ alEntrar }) {
    const f = useIngreso(alEntrar);

    return (
        <form onSubmit={f.entrar} className="flex flex-col gap-4">
            <Campo id="correo" etiqueta="Correo">
                <input id="correo" type="email" value={f.correo} onChange={(e) => f.setCorreo(e.target.value)}
                    required autoComplete="username" autoFocus />
            </Campo>
            <Campo id="clave" etiqueta="Contraseña">
                <CampoClave id="clave" value={f.clave} onChange={(e) => f.setClave(e.target.value)}
                    required autoComplete="current-password" />
            </Campo>

            <AlertaError texto={f.error} />

            <button type="submit" className="btn mt-1 min-h-[48px] w-full text-[15px]" disabled={f.enviando}>
                {f.enviando ? <><span className="giro" aria-hidden="true" /> Ingresando...</> : 'Ingresar'}
            </button>
            <p className="text-center text-xs text-suave">
                Tras 5 intentos fallidos la cuenta se bloquea por 15 minutos.
            </p>
        </form>
    );
}
