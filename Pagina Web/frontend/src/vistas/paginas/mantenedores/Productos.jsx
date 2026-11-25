// Pagina: mantenedor de productos (vinos y uva a granel) con acceso a su composicion de cepas
import { useState } from 'react';
import { useDatos } from '../../../controladores/useDatos.js';
import { RUTA_CATEGORIAS } from '../../../modelos/mantenedoresModelo.js';
import { dinero, nombrePropio } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import { colActivo } from './columnas.jsx';
import ComposicionCepas from './ComposicionCepas.jsx';

export default function Productos() {
    const { datos: categorias } = useDatos(RUTA_CATEGORIAS);
    const [conCepas, setConCepas] = useState(null);
    const [recargar, setRecargar] = useState(0);

    return (
        <>
            <CrudPagina
                titulo="Productos"
                descripcion="Vinos y uva a granel. Al crear un producto queda inactivo: se activa cuando sus cepas suman 100%."
                recurso="productos" ids={['ID_PRODUCTO']} textoCrear="Nuevo producto" recargar={recargar}
                valoresIniciales={{ ACTIVO: 0, STOCK_MINIMO: 0 }}
                columnas={[
                    { campo: 'CODIGO', titulo: 'Código' },
                    { campo: 'NOMBRE', titulo: 'Nombre' },
                    { campo: 'CATEGORIA', titulo: 'Categoría', render: (f) => nombrePropio(f.CATEGORIA) },
                    { campo: 'PRECIO_ACTUAL', titulo: 'Precio', alinear: 'derecha', render: (f) => dinero(f.PRECIO_ACTUAL) },
                    { campo: 'STOCK_ACTUAL', titulo: 'Stock / mínimo', alinear: 'derecha',
                        render: (f) => (
                            <span className={f.STOCK_ACTUAL < f.STOCK_MINIMO ? 'font-semibold text-red-700' : ''}>
                                {f.STOCK_ACTUAL} / {f.STOCK_MINIMO}
                            </span>
                        ) },
                    colActivo
                ]}
                campos={(v, modo) => [
                    { nombre: 'CODIGO', etiqueta: 'Código', requerido: true, placeholder: 'VT-CAR-RES-2022' },
                    { nombre: 'ID_CATEGORIA', etiqueta: 'Categoría', tipo: 'select', requerido: true,
                        opciones: categorias.map((c) => ({ valor: c.ID_CATEGORIA, texto: nombrePropio(c.NOMBRE) })) },
                    { nombre: 'NOMBRE', etiqueta: 'Nombre', requerido: true, ancho: 'completo' },
                    { nombre: 'FORMATO', etiqueta: 'Formato', requerido: true, placeholder: '750 ml' },
                    { nombre: 'ANADA', etiqueta: 'Añada', tipo: 'number', min: 1900, max: 2100 },
                    { nombre: 'PRECIO_ACTUAL', etiqueta: 'Precio (CLP)', tipo: 'number', requerido: true, min: 1 },
                    { nombre: 'STOCK_MINIMO', etiqueta: 'Stock mínimo', tipo: 'number', min: 0,
                        visible: () => modo === 'crear' },
                    { nombre: 'ACTIVO', etiqueta: 'Activo (a la venta)', tipo: 'checkbox',
                        ayuda: 'Solo se puede activar si sus cepas suman 100%' },
                    { nombre: 'DESCRIPCION', etiqueta: 'Descripción', tipo: 'textarea', ancho: 'completo' }
                ]}
                accionesExtra={(f) => (
                    <button type="button" className="btn btn-sec btn-sm" onClick={() => setConCepas(f)}>
                        Cepas
                    </button>
                )}
            />
            <ComposicionCepas producto={conCepas} alCerrar={() => { setConCepas(null); setRecargar((n) => n + 1); }} />
        </>
    );
}
