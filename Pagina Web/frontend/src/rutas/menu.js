// Menu del panel: grupos, rutas, iconos (Lucide) y el modulo que exige cada enlace
import {
    Boxes, ChartNoAxesCombined, ClipboardList, CreditCard, Grape, Inbox, LayoutDashboard,
    Receipt, ShieldCheck, Store, Tags, UserCog, Users, Wine
} from 'lucide-react';

export const MENU = [
    {
        seccion: 'General',
        enlaces: [{ ruta: '/inicio', texto: 'Inicio', icono: LayoutDashboard, modulo: null }]
    },
    {
        seccion: 'Gestión',
        enlaces: [
            { ruta: '/ventas', texto: 'Ventas', icono: Receipt, modulo: 'VENTAS' },
            { ruta: '/solicitudes', texto: 'Solicitudes web', icono: Inbox, modulo: 'SOLICITUDES' },
            { ruta: '/inventario', texto: 'Inventario', icono: Boxes, modulo: 'INVENTARIO' }
        ]
    },
    {
        seccion: 'Mantenedores',
        enlaces: [
            { ruta: '/productos', texto: 'Productos', icono: Wine, modulo: 'PRODUCTOS' },
            { ruta: '/categorias', texto: 'Categorías', icono: Tags, modulo: 'PRODUCTOS' },
            { ruta: '/cepas', texto: 'Cepas', icono: Grape, modulo: 'PRODUCTOS' },
            { ruta: '/clientes', texto: 'Clientes', icono: Users, modulo: 'CLIENTES' },
            { ruta: '/usuarios', texto: 'Usuarios', icono: UserCog, modulo: 'USUARIOS' },
            { ruta: '/metodos-pago', texto: 'Métodos de pago', icono: CreditCard, modulo: 'METODOS_PAGO' }
        ]
    },
    {
        seccion: 'Análisis',
        enlaces: [
            { ruta: '/reportes', texto: 'Reportes', icono: ChartNoAxesCombined, modulo: 'REPORTES' },
            { ruta: '/monitoreo', texto: 'Monitoreo', icono: ShieldCheck, modulo: 'MONITOREO' }
        ]
    },
    {
        seccion: 'Tienda',
        enlaces: [
            { ruta: '/', texto: 'Tienda', icono: Store, modulo: 'CATALOGO' },
            { ruta: '/mis-pedidos', texto: 'Mis pedidos', icono: ClipboardList, modulo: 'MIS_SOLICITUDES' }
        ]
    }
];

// Grupo y nombre de la pagina actual (para la ruta de migas de la cabecera)
export function tituloDe(pathname) {
    const enlace = MENU.flatMap((g) => g.enlaces).find((e) => e.ruta !== '/' && pathname.startsWith(e.ruta));
    const grupo = MENU.find((g) => g.enlaces.includes(enlace));
    return enlace ? { grupo: grupo?.seccion, texto: enlace.texto } : null;
}
