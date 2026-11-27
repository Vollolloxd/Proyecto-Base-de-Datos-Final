module.exports = {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                fondo: '#f8f6f2',
                marfil: '#f7f3eb',
                tinta: '#26221f',
                suave: '#6e625a',
                borde: '#e7e0d7',
                control: '#a89c90',
                carbon: '#141210',
                'carbon-elevado': '#231e1a',
                'carbon-borde': '#3d352f',
                inverso: '#faf6ed',
                'inverso-suave': '#d1c6b9',
                vino: '#65283b',
                'vino-oscuro': '#522031',
                'vino-profundo': '#361420',
                'vino-claro': '#8c4055',
                bronce: '#c6a675',
                peligro: '#a52735',
                exito: '#176548',
                aviso: '#8a5415',
                info: '#285e88'
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                marca: ['Cormorant Garamond', 'Georgia', 'serif']
            },
            transitionTimingFunction: { salida: 'var(--ease-out)' },
            keyframes: {
                aparecer: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
                difuminar: { from: { opacity: '0' }, to: { opacity: '1' } },
                escalar: { from: { opacity: '0', transform: 'translateY(4px) scale(.98)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
                'entrar-derecha': { from: { opacity: '0', transform: 'translateX(16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
                'salir-derecha': { from: { opacity: '1', transform: 'translateX(0)' }, to: { opacity: '0', transform: 'translateX(16px)' } },
                brillo: { to: { transform: 'translateX(100%)' } }
            },
            animation: {
                aparecer: 'aparecer 200ms var(--ease-out) both',
                difuminar: 'difuminar 180ms ease-out both',
                escalar: 'escalar 220ms var(--ease-out) both',
                revelar: 'aparecer 480ms var(--ease-out) both',
                'revelar-foto': 'difuminar 480ms ease-out both',
                'entrar-derecha': 'entrar-derecha 200ms var(--ease-out) both',
                'salir-derecha': 'salir-derecha 150ms ease-in both'
            }
        }
    }
};
