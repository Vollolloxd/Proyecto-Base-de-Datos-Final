// Formulario generado a partir de una lista de campos
import CampoClave from './CampoClave.jsx';

export default function Formulario({ campos, valores, alCambiar, modo }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {campos
                .filter((c) => !c.visible || c.visible(valores, modo))
                .map((c) => {
                    const valor = valores[c.nombre] ?? '';
                    const cambiar = (v) => alCambiar({ ...valores, [c.nombre]: v });
                    const deshabilitado = c.deshabilitado ? c.deshabilitado(valores, modo) : false;
                    const requerido = typeof c.requerido === 'function' ? c.requerido(valores, modo) : c.requerido;
                    const id = `campo-${c.nombre}`;
                    let control;

                    if (c.tipo === 'select') {
                        control = (
                            <select id={id} value={valor} onChange={(e) => cambiar(e.target.value)}
                                disabled={deshabilitado} required={requerido}>
                                <option value="">{c.placeholder || 'Seleccione...'}</option>
                                {(c.opciones || []).map((o) => (
                                    <option key={o.valor} value={o.valor}>{o.texto}</option>
                                ))}
                            </select>
                        );
                    } else if (c.tipo === 'textarea') {
                        control = (
                            <textarea id={id} value={valor} rows={3} onChange={(e) => cambiar(e.target.value)}
                                disabled={deshabilitado} required={requerido} placeholder={c.placeholder} />
                        );
                    } else if (c.tipo === 'checkbox') {
                        control = (
                            <label className="casilla py-2">
                                <input id={id} type="checkbox" checked={Number(valor) === 1}
                                    onChange={(e) => cambiar(e.target.checked ? 1 : 0)} disabled={deshabilitado} />
                                {c.textoCasilla || 'Sí'}
                            </label>
                        );
                    } else if (c.tipo === 'password') {
                        control = (
                            <CampoClave id={id} value={valor} onChange={(e) => cambiar(e.target.value)}
                                disabled={deshabilitado} required={requerido} placeholder={c.placeholder}
                                autoComplete={c.autocompletar || 'off'} />
                        );
                    } else {
                        control = (
                            <input id={id} type={c.tipo || 'text'} value={valor}
                                onChange={(e) => cambiar(e.target.value)} disabled={deshabilitado}
                                required={requerido} placeholder={c.placeholder}
                                onKeyDown={c.tipo === 'search' ? (e) => {
                                    if (e.key === 'Enter') e.preventDefault();
                                } : undefined}
                                min={c.min} max={c.max} step={c.paso} autoComplete={c.autocompletar || 'off'} />
                        );
                    }

                    return (
                        <div key={c.nombre} className={`flex flex-col gap-1 ${c.ancho === 'completo' ? 'sm:col-span-2' : ''}`}>
                            <label htmlFor={id} className="text-sm font-medium">
                                {c.etiqueta}{requerido && <span className="text-peligro" aria-hidden="true"> *</span>}
                            </label>
                            {control}
                            {c.ayuda && <small className="text-xs text-suave">{c.ayuda}</small>}
                        </div>
                    );
                })}
        </div>
    );
}
