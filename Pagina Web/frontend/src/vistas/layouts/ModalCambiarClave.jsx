// Vista: modal para cambiar la contraseña del usuario de la sesion
import { useCambiarClave } from '../../controladores/useCambiarClave.js';
import Formulario from '../componentes/Formulario.jsx';
import Modal, { Pie } from '../componentes/Modal.jsx';

const CAMPOS = [
    { nombre: 'claveActual', etiqueta: 'Contraseña actual', tipo: 'password', requerido: true, ancho: 'completo' },
    { nombre: 'claveNueva', etiqueta: 'Contraseña nueva', tipo: 'password', requerido: true, ancho: 'completo',
        ayuda: 'Mínimo 6 caracteres' },
    { nombre: 'repetir', etiqueta: 'Repetir contraseña nueva', tipo: 'password', requerido: true, ancho: 'completo' }
];

export default function ModalCambiarClave({ abierto, alCerrar }) {
    const { valores, setValores, guardar } = useCambiarClave(alCerrar);

    return (
        <Modal titulo="Cambiar contraseña" abierto={abierto} alCerrar={alCerrar} ancho="chico">
            <form onSubmit={guardar}>
                <Formulario campos={CAMPOS} valores={valores} alCambiar={setValores} />
                <Pie>
                    <button type="button" className="btn btn-sec" onClick={alCerrar}>Cancelar</button>
                    <button type="submit" className="btn">Guardar contraseña</button>
                </Pie>
            </form>
        </Modal>
    );
}
