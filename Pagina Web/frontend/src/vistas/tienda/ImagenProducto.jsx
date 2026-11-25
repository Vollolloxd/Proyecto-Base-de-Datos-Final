// Vista: imagen SVG de cada producto segun su tipo (botella tinto/blanco/rosado o caja de uva por kilo)
import { useId } from 'react';
import { esPorKilo } from '../../utilidades/formato.js';
import { tipoDeVino } from '../../utilidades/productos.js';

const LOGO = '/img/logo-emblema.png';

const ESTILOS = {
    tinto: {
        vidrio: ['#2c3a26', '#141c11'], capsula: ['#8f2d4a', '#521428'], banda: '#d4ab5c'
    },
    blanco: {
        vidrio: ['#cfcf86', '#8e9142'], capsula: ['#e8cf8c', '#b38a3e'], banda: '#65283b'
    },
    rosado: {
        vidrio: ['#f6b7ae', '#d97a70'], capsula: ['#f0c9c0', '#c98f86'], banda: '#65283b'
    }
};

function lineasEtiqueta(nombre, maxLargo = 13, maxLineas = 3) {
    const palabras = String(nombre || '').replace(/\s*\d{4}\s*$/, '').split(/\s+/).filter(Boolean);
    const lineas = [];
    for (const palabra of palabras) {
        const ultima = lineas[lineas.length - 1];
        if (ultima !== undefined && `${ultima} ${palabra}`.length <= maxLargo) {
            lineas[lineas.length - 1] = `${ultima} ${palabra}`;
        } else {
            lineas.push(palabra);
        }
    }
    if (lineas.length > maxLineas) {
        lineas.length = maxLineas;
        lineas[maxLineas - 1] = `${lineas[maxLineas - 1]}…`;
    }
    return lineas;
}

function Botella({ p, id }) {
    const e = ESTILOS[tipoDeVino(p)];
    const lineas = lineasEtiqueta(p.NOMBRE);
    const forma = 'M51 16 L51 92 C51 113 29 119 29 143 L29 279 Q29 291 41 291 L79 291 Q91 291 91 279 L91 143 C91 119 69 113 69 92 L69 16 Z';
    const yTexto = 212 - (lineas.length - 1) * 4.5;
    return (
        <svg viewBox="0 0 120 300" className="h-full w-auto" role="img" aria-label={`Botella de ${p.NOMBRE}`}>
            <defs>
                <linearGradient id={`${id}v`} x1="0" x2="1">
                    <stop offset="0" stopColor={e.vidrio[1]} />
                    <stop offset=".35" stopColor={e.vidrio[0]} />
                    <stop offset="1" stopColor={e.vidrio[1]} />
                </linearGradient>
                <linearGradient id={`${id}c`} x1="0" x2="1">
                    <stop offset="0" stopColor={e.capsula[1]} />
                    <stop offset=".4" stopColor={e.capsula[0]} />
                    <stop offset="1" stopColor={e.capsula[1]} />
                </linearGradient>
                <linearGradient id={`${id}o`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f3dc9c" />
                    <stop offset="1" stopColor="#b8893e" />
                </linearGradient>
                <clipPath id={`${id}f`}><path d={forma} /></clipPath>
            </defs>

            <ellipse cx="60" cy="293" rx="38" ry="5" fill="#000" opacity=".18" />
            <path d={forma} fill={`url(#${id}v)`} />
            <g clipPath={`url(#${id}f)`}>
                <rect x="36" y="120" width="5" height="165" rx="2.5" fill="#fff" opacity=".22" />
                <rect x="55" y="20" width="3" height="80" rx="1.5" fill="#fff" opacity=".18" />
                <rect x="82" y="140" width="2" height="140" rx="1" fill="#fff" opacity=".08" />
                <rect x="40" y="10" width="40" height="58" fill={`url(#${id}c)`} />
                <rect x="40" y="62" width="40" height="2.2" fill={e.banda} opacity=".9" />
            </g>
            <rect x="49.5" y="100" width="21" height="10" rx="1" fill="#fbf6ec" stroke={`url(#${id}o)`} strokeWidth=".8" />
            <text x="60" y="107.3" textAnchor="middle" fontSize="5.2" fontFamily="'Cormorant Garamond', Georgia, serif"
                fontWeight="700" fill="#65283b">{p.ANADA || 'NV'}</text>

            <rect x="33" y="160" width="54" height="98" rx="2" fill="#fbf6ec" />
            <rect x="35.5" y="162.5" width="49" height="93" rx="1.2" fill="none" stroke={`url(#${id}o)`} strokeWidth=".9" />
            <image href={LOGO} x="38" y="165" width="44" height="28" preserveAspectRatio="xMidYMid meet" />
            <line x1="44" y1="197" x2="76" y2="197" stroke={`url(#${id}o)`} strokeWidth=".6" />
            <text textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="700" fill="#65283b"
                fontSize="7.4">
                {lineas.map((l, i) => <tspan key={i} x="60" y={yTexto + i * 9}>{l}</tspan>)}
            </text>
            <text x="60" y="247" textAnchor="middle" fontSize="4" letterSpacing=".9" fill="#7a6a55"
                fontFamily="system-ui, sans-serif">VIÑA ALBORADA</text>
            <text x="60" y="253" textAnchor="middle" fontSize="3.6" fill="#a58a5a"
                fontFamily="system-ui, sans-serif">{p.FORMATO || '750 ml'}</text>
        </svg>
    );
}

function Racimo({ x, y, escala = 1, color }) {
    const granos = [[0, 0], [7, 0], [14, 0], [3.5, 6], [10.5, 6], [0, 12], [7, 12], [14, 12], [3.5, 18], [10.5, 18], [7, 24]];
    return (
        <g transform={`translate(${x} ${y}) scale(${escala})`}>
            <path d="M7 -6 C7 -10 9 -12 12 -13" stroke="#5b4a2a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d="M8 -9 C12 -15 19 -14 21 -11 C17 -7 12 -7 8 -9 Z" fill="#5f7a3a" />
            {granos.map(([gx, gy], i) => (
                <circle key={i} cx={gx} cy={gy} r="4.4" fill={color} stroke="#2a0a14" strokeWidth=".4" strokeOpacity=".5" />
            ))}
            {granos.map(([gx, gy], i) => (
                <circle key={`b${i}`} cx={gx - 1.3} cy={gy - 1.4} r="1.1" fill="#fff" opacity=".35" />
            ))}
        </g>
    );
}

function CajaUva({ p, id }) {
    return (
        <svg viewBox="0 0 200 170" className="h-full w-auto" role="img" aria-label={`Caja de ${p.NOMBRE}`}>
            <defs>
                <linearGradient id={`${id}m`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#c99a62" />
                    <stop offset="1" stopColor="#8f6435" />
                </linearGradient>
            </defs>
            <ellipse cx="100" cy="160" rx="82" ry="7" fill="#000" opacity=".16" />
            <Racimo x={40} y={58} escala={1.25} color="#5a1830" />
            <Racimo x={78} y={50} escala={1.35} color="#6b1d3a" />
            <Racimo x={118} y={56} escala={1.25} color="#561528" />
            <Racimo x={60} y={70} escala={1.1} color="#7a2443" />
            <Racimo x={100} y={68} escala={1.15} color="#61203a" />
            <path d="M26 92 L174 92 L166 156 L34 156 Z" fill={`url(#${id}m)`} />
            <g stroke="#7a522a" strokeWidth="1.2" opacity=".8">
                <line x1="28" y1="113" x2="172" y2="113" />
                <line x1="31" y1="134" x2="169" y2="134" />
            </g>
            <rect x="24" y="88" width="152" height="7" rx="1.5" fill="#d8ab73" />
            <path d="M150 95 L150 104" stroke="#8a6a3a" strokeWidth="1" />
            <rect x="124" y="104" width="52" height="40" rx="3" fill="#fbf6ec" stroke="#c9a25a" strokeWidth="1" />
            <image href={LOGO} x="128" y="106" width="44" height="22" preserveAspectRatio="xMidYMid meet" />
            <text x="150" y="135" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#65283b"
                fontFamily="'Cormorant Garamond', Georgia, serif">Uva a granel</text>
            <text x="150" y="141.5" textAnchor="middle" fontSize="4.4" fill="#7a6a55" fontFamily="system-ui, sans-serif">
                VENTA POR KILO
            </text>
        </svg>
    );
}

export default function ImagenProducto({ p, className = '' }) {
    const id = `b${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
    return (
        <div className={`flex items-end justify-center ${className}`}>
            {esPorKilo(p.UNIDAD_MEDIDA) ? <CajaUva p={p} id={id} /> : <Botella p={p} id={id} />}
        </div>
    );
}
