// Pagina: nueva venta presencial (G2)
import { useVentaNueva } from '../../../controladores/useVentaNueva.js';
import { nombreCliente } from '../../../utilidades/formato.js';
import Cabecera from '../../componentes/Cabecera.jsx';
import Formulario from '../../componentes/Formulario.jsx';
import { Pie } from '../../componentes/Modal.jsx';
import { Volver } from './partes.jsx';

export default function VentaNueva() {
    const { clientes, valores, setValores, crear } = useVentaNueva();

    const campos = [
        { nombre: 'TIPO', etiqueta: 'Comprador', tipo: 'select', requerido: true,
            opciones: [{ valor: 'MOSTRADOR', texto: 'Sin registro (mostrador)' }, { valor: 'CLIENTE', texto: 'Cliente registrado' }] },
        { nombre: 'ID_CLIENTE', etiqueta: 'Cliente', tipo: 'select', requerido: true,
            visible: (v) => v.TIPO === 'CLIENTE',
            opciones: clientes.map((c) => ({ valor: c.ID_CLIENTE, texto: `${nombreCliente(c)}${c.RUT ? ` (${c.RUT})` : ''}` })) },
        { nombre: 'NOMBRE_COMPRADOR', etiqueta: 'Nombre del comprador (opcional)',
            visible: (v) => v.TIPO === 'MOSTRADOR' },
        { nombre: 'LUGAR_VENTA', etiqueta: 'Lugar de venta', requerido: true, ancho: 'completo' },
        { nombre: 'OBSERVACIONES', etiqueta: 'Observaciones', tipo: 'textarea', ancho: 'completo' }
    ];

    return (
        <section className="max-w-2xl">
            <Volver />
            <Cabecera titulo="Nueva venta presencial" />
            <form className="tarjeta" onSubmit={crear}>
                <Formulario campos={campos} valores={valores} alCambiar={setValores} />
                <Pie>
                    <button type="submit" className="btn">Crear venta y agregar productos</button>
                </Pie>
            </form>
        </section>
    );
}
