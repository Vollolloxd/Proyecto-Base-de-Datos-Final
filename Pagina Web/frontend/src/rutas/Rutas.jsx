// Tabla de rutas: tienda y login publicos; panel protegido por sesion y por modulo
import { Navigate, Route, Routes } from 'react-router-dom';
import PanelLayout from '../vistas/layouts/PanelLayout.jsx';
import Inicio from '../vistas/paginas/inicio/Inicio.jsx';
import Inventario from '../vistas/paginas/inventario/Inventario.jsx';
import Login from '../vistas/paginas/Login.jsx';
import Categorias from '../vistas/paginas/mantenedores/Categorias.jsx';
import Cepas from '../vistas/paginas/mantenedores/Cepas.jsx';
import Clientes from '../vistas/paginas/mantenedores/Clientes.jsx';
import MetodosPago from '../vistas/paginas/mantenedores/MetodosPago.jsx';
import Productos from '../vistas/paginas/mantenedores/Productos.jsx';
import Usuarios from '../vistas/paginas/mantenedores/Usuarios.jsx';
import Monitoreo from '../vistas/paginas/monitoreo/Monitoreo.jsx';
import MisPedidos from '../vistas/paginas/pedidos/MisPedidos.jsx';
import Reportes from '../vistas/paginas/reportes/Reportes.jsx';
import Solicitudes from '../vistas/paginas/solicitudes/Solicitudes.jsx';
import Tienda from '../vistas/paginas/Tienda.jsx';
import VentaDetalle from '../vistas/paginas/ventas/VentaDetalle.jsx';
import VentaNueva from '../vistas/paginas/ventas/VentaNueva.jsx';
import Ventas from '../vistas/paginas/ventas/Ventas.jsx';
import { ConModulo, Protegida } from './Guardias.jsx';

export default function Rutas() {
    return (
        <Routes>
            <Route path="/" element={<Tienda />} />
            <Route path="/login" element={<Login />} />
            <Route element={<Protegida><PanelLayout /></Protegida>}>
                <Route path="inicio" element={<Inicio />} />
                <Route path="ventas" element={<ConModulo modulo="VENTAS"><Ventas /></ConModulo>} />
                <Route path="ventas/nueva" element={<ConModulo modulo="VENTAS"><VentaNueva /></ConModulo>} />
                <Route path="ventas/:id" element={<ConModulo modulo="VENTAS"><VentaDetalle /></ConModulo>} />
                <Route path="solicitudes" element={<ConModulo modulo="SOLICITUDES"><Solicitudes /></ConModulo>} />
                <Route path="inventario" element={<ConModulo modulo="INVENTARIO"><Inventario /></ConModulo>} />
                <Route path="productos" element={<ConModulo modulo="PRODUCTOS"><Productos /></ConModulo>} />
                <Route path="categorias" element={<ConModulo modulo="PRODUCTOS"><Categorias /></ConModulo>} />
                <Route path="cepas" element={<ConModulo modulo="PRODUCTOS"><Cepas /></ConModulo>} />
                <Route path="clientes" element={<ConModulo modulo="CLIENTES"><Clientes /></ConModulo>} />
                <Route path="usuarios" element={<ConModulo modulo="USUARIOS"><Usuarios /></ConModulo>} />
                <Route path="metodos-pago" element={<ConModulo modulo="METODOS_PAGO"><MetodosPago /></ConModulo>} />
                <Route path="reportes" element={<ConModulo modulo="REPORTES"><Reportes /></ConModulo>} />
                <Route path="monitoreo" element={<ConModulo modulo="MONITOREO"><Monitoreo /></ConModulo>} />
                <Route path="mis-pedidos" element={<ConModulo modulo="MIS_SOLICITUDES"><MisPedidos /></ConModulo>} />
            </Route>
            <Route path="/catalogo" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
