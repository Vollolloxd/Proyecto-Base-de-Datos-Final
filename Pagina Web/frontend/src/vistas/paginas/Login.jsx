// Pagina: inicio de sesion y registro de cliente web (foto a un lado, formulario al otro)
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useSesion } from '../../controladores/SesionContexto.jsx';
import { destinoTrasEntrar } from '../../utilidades/destino.js';
import FormularioIngreso from '../acceso/FormularioIngreso.jsx';
import FormularioRegistro from '../acceso/FormularioRegistro.jsx';

export default function Login() {
    const { sesion } = useSesion();
    const [parametros] = useSearchParams();
    const [pestana, setPestana] = useState(parametros.get('modo') === 'registro' ? 'registro' : 'ingreso');

    if (sesion) return <Navigate to={destinoTrasEntrar(sesion.usuario, parametros.get('volver'))} replace />;

    const registro = pestana === 'registro';
    const alEntrar = () => {};

    return (
        <div className="min-h-screen bg-marfil lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(520px,600px)]">
            <aside aria-hidden="true" className="relative hidden overflow-hidden bg-carbon lg:block">
                <img src="/img/vinedo.jpg" alt="" className="absolute inset-0 h-full w-full animate-difuminar object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon/90 via-carbon/20 to-carbon/30" />
                <div className="absolute inset-x-0 bottom-0 p-12 text-inverso">
                    <p className="max-w-md font-marca text-4xl font-medium leading-tight">Vinos con carácter, desde nuestra viña.</p>
                    <p className="mt-6 text-xs text-inverso-suave/80">Foto: Winniepix, CC BY 2.0 (Wikimedia Commons)</p>
                </div>
            </aside>

            <main className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14">
                <Link to="/" className="inline-flex min-h-[44px] items-center gap-2 self-start text-sm font-medium no-underline hover:underline">
                    <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" /> Volver a la tienda
                </Link>
                <div className={`mx-auto my-auto w-full py-10 ${registro ? 'max-w-[480px]' : 'max-w-[420px]'}`}>
                    <img src="/img/logo-completo.png" alt="Viña Alborada, vinos y viñedos" className="w-44" />
                    <h1 className="mt-8 block font-marca text-[2.5rem] font-medium leading-tight">
                        {registro ? 'Crea tu cuenta' : 'Inicia sesión'}
                    </h1>
                    <p className="mt-2 text-[15px] text-suave">
                        {registro ? 'Regístrate para hacer pedidos en la tienda en línea.' : 'Ingresa con tu correo y contraseña.'}
                    </p>

                    <div className="relative mb-6 mt-8 flex border-b border-borde" role="tablist" aria-label="Acceso">
                        <span aria-hidden="true" className={`absolute -bottom-px left-0 h-0.5 w-1/2 bg-vino transition-transform duration-200 ease-salida ${registro ? 'translate-x-full' : ''}`} />
                        {[['ingreso', 'Iniciar sesión'], ['registro', 'Crear cuenta']].map(([valor, texto]) => (
                            <button key={valor} type="button" role="tab" aria-selected={pestana === valor}
                                onClick={() => setPestana(valor)}
                                className={`min-h-[44px] flex-1 text-sm font-medium transition-colors duration-150 ${pestana === valor
                                    ? 'text-vino' : 'text-suave hover:text-tinta'}`}>
                                {texto}
                            </button>
                        ))}
                    </div>

                    <div key={pestana} className="animate-aparecer">
                        {registro
                            ? <FormularioRegistro alEntrar={alEntrar} />
                            : <FormularioIngreso alEntrar={alEntrar} />}
                    </div>
                </div>
            </main>
        </div>
    );
}
