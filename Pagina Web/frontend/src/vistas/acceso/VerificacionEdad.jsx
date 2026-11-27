// Vista: verificacion de mayoria de edad al entrar al sitio (se pregunta en cada entrada)
import { useState } from 'react';

export default function VerificacionEdad({ children }) {
    const [confirmado, setConfirmado] = useState(false);
    const [rechazado, setRechazado] = useState(false);

    if (confirmado) return children;

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-carbon px-4 py-10">
            <img src="/img/vinedo-alborada.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,18,16,0.55)_0%,rgba(20,18,16,0.92)_75%)]" />

            <div className="relative w-full max-w-[480px] animate-escalar rounded-md bg-marfil px-8 py-10 text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] sm:px-12"
                role="dialog" aria-modal="true" aria-labelledby="titulo-edad" aria-describedby="texto-edad">
                <img src="/img/logo-completo.png" alt="Viña Alborada, vinos y viñedos" className="mx-auto w-44" />

                {!rechazado ? (
                    <>
                        <h1 id="titulo-edad" className="mt-6 block font-marca text-[2.125rem] font-medium leading-tight text-tinta">
                            Bienvenido a nuestra viña
                        </h1>
                        <p id="texto-edad" className="mt-3 text-[15px] text-suave">
                            Este sitio vende bebidas alcohólicas. Debes tener 18 años o más para acceder.
                        </p>
                        <div className="mt-8 flex flex-col gap-3">
                            <button type="button" className="btn min-h-[48px] text-[15px]" onClick={() => setConfirmado(true)} autoFocus>
                                Sí, tengo 18 años o más
                            </button>
                            <button type="button" className="btn btn-sec min-h-[48px] text-[15px]" onClick={() => setRechazado(true)}>
                                No, soy menor de 18 años
                            </button>
                        </div>
                        <p className="mt-6 text-xs text-suave">
                            Ley N° 19.925: prohibida la venta de alcohol a menores de 18 años.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 id="titulo-edad" className="mt-6 block font-marca text-[2.125rem] font-medium leading-tight text-tinta">
                            Lo sentimos
                        </h1>
                        <p id="texto-edad" className="mt-3 text-[15px] text-suave">
                            Debes ser mayor de 18 años para ingresar a Viña La Alborada.
                        </p>
                        <button type="button" className="btn btn-sec mt-8 min-h-[44px]" onClick={() => setRechazado(false)} autoFocus>
                            Volver
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
