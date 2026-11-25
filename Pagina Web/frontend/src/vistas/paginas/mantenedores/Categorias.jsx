// Pagina: mantenedor de categorias de producto
import { nombrePropio } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import { colActivo } from './columnas.jsx';

export default function Categorias() {
    return (
        <CrudPagina
            titulo="Categorías de producto"
            descripcion="Agrupan los productos y definen su unidad de medida (botella o kg)."
            recurso="categorias" reactivable ids={['ID_CATEGORIA']} conInactivos textoCrear="Nueva categoría"
            columnas={[
                { campo: 'NOMBRE', titulo: 'Nombre', render: (f) => nombrePropio(f.NOMBRE) },
                { campo: 'DESCRIPCION', titulo: 'Descripción' },
                { campo: 'UNIDAD_MEDIDA', titulo: 'Unidad', render: (f) => nombrePropio(f.UNIDAD_MEDIDA) },
                colActivo
            ]}
            campos={[
                { nombre: 'NOMBRE', etiqueta: 'Nombre', requerido: true },
                { nombre: 'UNIDAD_MEDIDA', etiqueta: 'Unidad de medida', tipo: 'select', requerido: true,
                    opciones: [{ valor: 'BOTELLA', texto: 'Botella' }, { valor: 'KG', texto: 'Kilogramo' }] },
                { nombre: 'DESCRIPCION', etiqueta: 'Descripción', tipo: 'textarea', ancho: 'completo' }
            ]}
        />
    );
}
