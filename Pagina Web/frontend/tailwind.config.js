// Configuracion de Tailwind: tokens del DESIGN.md (colores, fuentes, radios y movimiento)
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                vino: { DEFAULT: '#65283b', oscuro: '#4d1d2c', profundo: '#391a26', claro: '#f4ecee', medio: '#8a4357' },
                bronce: { DEFAULT: '#c6a675', oscuro: '#78562f' },
                carbon: { DEFAULT: '#141210', elevado: '#201c19', borde: '#3d352f' },
                marfil: '#f7f4ee',
                fondo: '#f5f4f1',
                borde: '#ded9d0',
                control: '#8d857b',
                tinta: '#26221f',
                suave: '#665f57',
                inverso: { DEFAULT: '#f7f4ee', suave: '#c8c0b6' },
                exito: '#276249',
                aviso: '#8a5b17',
                peligro: '#a3323b',
                info: '#315c75',
                red: { 50: '#f8eced', 100: '#f1dadc', 200: '#e3b9bd', 600: '#a3323b', 700: '#a3323b', 800: '#842830' },
                emerald: { 50: '#eaf2ee', 200: '#bcd5c8', 700: '#276249', 800: '#1f4f3b' },
                amber: { 50: '#f7f0e4', 200: '#e6d2ad', 600: '#8a5b17', 800: '#8a5b17' },
                blue: { 50: '#eaf0f3', 600: '#315c75', 700: '#315c75' },
                stone: { 50: '#faf8f5', 100: '#f0ede8', 200: '#e5e0d8', 300: '#cfc8bd', 900: '#26221f' }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
                marca: ['"Cormorant Garamond"', 'Georgia', 'serif']
            },
            maxWidth: { tienda: '1360px' },
            transitionTimingFunction: {
                salida: 'cubic-bezier(0.23, 1, 0.32, 1)'
            },
            keyframes: {
                aparecer: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
                difuminar: { from: { opacity: '0' }, to: { opacity: '1' } },
                escalar: { from: { opacity: '0', transform: 'translateY(8px) scale(.98)' }, to: { opacity: '1', transform: 'none' } },
                entrarDerecha: { from: { opacity: '0', transform: 'translateX(16px)' }, to: { opacity: '1', transform: 'none' } },
                salirDerecha: { from: { opacity: '1', transform: 'none' }, to: { opacity: '0', transform: 'translateX(16px)' } },
                brillo: { '100%': { transform: 'translateX(100%)' } },
                revelar: { from: { opacity: '0', transform: 'translateY(14px)', filter: 'blur(4px)' }, to: { opacity: '1', transform: 'none', filter: 'blur(0)' } },
                revelarFoto: { from: { clipPath: 'inset(0 0 0 100%)' }, to: { clipPath: 'inset(0 0 0 0)' } }
            },
            animation: {
                aparecer: 'aparecer .22s cubic-bezier(0.23,1,0.32,1) backwards',
                difuminar: 'difuminar .18s ease-out both',
                escalar: 'escalar .24s cubic-bezier(0.23,1,0.32,1) backwards',
                'entrar-derecha': 'entrarDerecha .28s cubic-bezier(0.23,1,0.32,1) backwards',
                'salir-derecha': 'salirDerecha .18s ease-out both',
                revelar: 'revelar .35s cubic-bezier(0.23,1,0.32,1) backwards',
                'revelar-foto': 'revelarFoto .9s cubic-bezier(0.77,0,0.175,1) backwards'
            }
        }
    },
    plugins: []
};
