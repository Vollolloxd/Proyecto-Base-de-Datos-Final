// Campo de contraseña con boton para mostrarla u ocultarla
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function CampoClave({ id, value, onChange, className = '', ...resto }) {
    const [visible, setVisible] = useState(false);
    const Icono = visible ? EyeOff : Eye;
    return (
        <div className="relative">
            <input id={id} type={visible ? 'text' : 'password'} value={value} onChange={onChange}
                className={`w-full pr-11 ${className}`} {...resto} />
            <button type="button" onClick={() => setVisible((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-suave transition-colors hover:text-vino"
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={visible} disabled={resto.disabled}>
                <Icono size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
        </div>
    );
}
