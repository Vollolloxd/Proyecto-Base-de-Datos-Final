// Vista: composicion de cepas de un producto (debe sumar 100% para activarlo)
import { useState } from 'react';
import { useDatos } from '../../../controladores/useDatos.js';
import { RUTA_CEPAS } from '../../../modelos/mantenedoresModelo.js';
import { nombrePropio } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import Modal from '../../componentes/Modal.jsx';

export default function ComposicionCepas({ producto, alCerrar }) {
    const { datos: cepas } = useDatos(RUTA_CEPAS);
    const [total, setTotal] = useState(0);
    if (!producto) return null;

    return (
        <Modal titulo={`Cepas de ${producto.NOMBRE}`} abierto={!!producto} alCerrar={alCerrar} ancho="grande">
            <p className="mb-3 text-sm text-suave">
                La composición debe sumar 100% para poder activar el producto.
                Total actual: <strong className={total === 100 ? 'font-semibold text-emerald-700' : 'font-semibold text-red-700'}>{total}%</strong>
            </p>
            <CrudPagina
                embebido recurso="productos-cepas" ids={['ID_PRODUCTO', 'ID_CEPA']}
                filtros={{ idProducto: producto.ID_PRODUCTO }}
                transformarFilas={(f) => ({ ...f, ID_PRODUCTO: producto.ID_PRODUCTO })}
                alCargar={(filas) => setTotal(filas.reduce((s, f) => s + Number(f.PORCENTAJE), 0))}
                valoresIniciales={{ ID_PRODUCTO: producto.ID_PRODUCTO }}
                textoCrear="Agregar cepa" textoEliminar="Quitar" porPagina={10}
                columnas={[
                    { campo: 'CEPA', titulo: 'Cepa', render: (f) => nombrePropio(f.CEPA) },
                    { campo: 'PORCENTAJE', titulo: 'Porcentaje', alinear: 'derecha', render: (f) => `${f.PORCENTAJE}%` }
                ]}
                campos={[
                    { nombre: 'ID_CEPA', etiqueta: 'Cepa', tipo: 'select', requerido: true,
                        deshabilitado: (v, modo) => modo === 'editar',
                        opciones: cepas.map((c) => ({ valor: c.ID_CEPA, texto: nombrePropio(c.NOMBRE) })) },
                    { nombre: 'PORCENTAJE', etiqueta: 'Porcentaje (%)', tipo: 'number', requerido: true, min: 1, max: 100 }
                ]}
            />
        </Modal>
    );
}
