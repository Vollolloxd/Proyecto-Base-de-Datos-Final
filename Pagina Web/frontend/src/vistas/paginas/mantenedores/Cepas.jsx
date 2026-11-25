// Pagina: mantenedor de cepas
import { nombrePropio } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import { colActivo } from './columnas.jsx';

export default function Cepas() {
    return (
        <CrudPagina
            titulo="Cepas"
            descripcion="Variedades de uva con que se elaboran los vinos."
            recurso="cepas" reactivable ids={['ID_CEPA']} conInactivos textoCrear="Nueva cepa"
            columnas={[
                { campo: 'NOMBRE', titulo: 'Nombre', render: (f) => nombrePropio(f.NOMBRE) },
                { campo: 'DESCRIPCION', titulo: 'Descripción' },
                colActivo
            ]}
            campos={[
                { nombre: 'NOMBRE', etiqueta: 'Nombre', requerido: true, ancho: 'completo' },
                { nombre: 'DESCRIPCION', etiqueta: 'Descripción', tipo: 'textarea', ancho: 'completo' }
            ]}
        />
    );
}
