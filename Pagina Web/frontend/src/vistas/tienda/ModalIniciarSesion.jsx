// Vista: aviso para iniciar sesion o crear cuenta antes de agregar un producto al pedido
import { cantidadConUnidad } from '../../utilidades/formato.js';
import Modal from '../componentes/Modal.jsx';

export default function ModalIniciarSesion({ producto, alCerrar, alIr }) {
    return (
        <Modal titulo="Inicia sesión para continuar" abierto={!!producto} ancho="chico" alCerrar={alCerrar}>
            <p className="text-sm leading-relaxed">
                Para agregar <strong>{producto?.NOMBRE}</strong>
                {producto && <> ({cantidadConUnidad(producto.cantidad, producto.UNIDAD_MEDIDA)})</>} a tu
                pedido necesitas una cuenta de cliente. Al ingresar lo agregaremos automáticamente.
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <button type="button" className="btn btn-sec min-h-[44px]" onClick={() => alIr('ingreso')}>
                    Iniciar sesión
                </button>
                <button type="button" className="btn min-h-[44px]" onClick={() => alIr('registro')}>
                    Crear cuenta
                </button>
            </div>
        </Modal>
    );
}
