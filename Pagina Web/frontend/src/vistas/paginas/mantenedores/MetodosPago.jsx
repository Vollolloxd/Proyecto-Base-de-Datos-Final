// Pagina: mantenedor de metodos de pago
import CrudPagina from '../../componentes/CrudPagina.jsx';
import { colActivo } from './columnas.jsx';

export default function MetodosPago() {
    return (
        <CrudPagina
            titulo="Métodos de pago"
            descripcion="Formas de pago aceptadas al confirmar una venta."
            recurso="metodos-pago" ids={['ID_METODO_PAGO']} conInactivos textoCrear="Nuevo método"
            valoresIniciales={{ ACTIVO: 1 }}
            columnas={[
                { campo: 'NOMBRE', titulo: 'Nombre' },
                { campo: 'DESCRIPCION', titulo: 'Descripción' },
                colActivo
            ]}
            campos={[
                { nombre: 'NOMBRE', etiqueta: 'Nombre', requerido: true },
                { nombre: 'ACTIVO', etiqueta: 'Activo', tipo: 'checkbox' },
                { nombre: 'DESCRIPCION', etiqueta: 'Descripción', tipo: 'textarea', ancho: 'completo' }
            ]}
        />
    );
}
