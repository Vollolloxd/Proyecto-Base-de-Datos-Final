// Pagina: mantenedor de productos (vinos y uva a granel) con acceso a su composicion de cepas
import { useState } from 'react';
import { useMensajes } from '../../../controladores/MensajesContexto.jsx';
import { useDatos } from '../../../controladores/useDatos.js';
import { RUTA_CATEGORIAS, RUTA_CEPAS, modificar } from '../../../modelos/mantenedoresModelo.js';
import { dinero, esPorKilo, nombrePropio } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import { colActivo } from './columnas.jsx';
import ComposicionCepas from './ComposicionCepas.jsx';
import CepasProductoNuevo from './CepasProductoNuevo.jsx';
import FormatoProducto, { formatoProducto } from './FormatoProducto.jsx';

export default function Productos() {
    const { avisar } = useMensajes();
    const { datos: categorias } = useDatos(RUTA_CATEGORIAS);
    const { datos: cepas, cargando: cargandoCepas, error: errorCepas } = useDatos(RUTA_CEPAS);
    const categoriaDe = (valores) => categorias.find((fila) => String(fila.ID_CATEGORIA) === String(valores.ID_CATEGORIA));
    const anadaMaxima = Number(new Intl.DateTimeFormat('es-CL', { year: 'numeric', timeZone: 'America/Santiago' }).format(new Date()));
    const cepasDe = (valores) => esPorKilo(categoriaDe(valores)?.UNIDAD_MEDIDA)
        ? [{ ID_CEPA: valores.CEPAS[0]?.ID_CEPA ?? '', PORCENTAJE: 100 }]
        : valores.CEPAS;
    const [conCepas, setConCepas] = useState(null);
    const [recargar, setRecargar] = useState(0);
    const [activando, setActivando] = useState(null);

    async function activar(fila, cargar) {
        setActivando(fila.ID_PRODUCTO);
        try {
            await modificar('productos', fila.ID_PRODUCTO, { ...fila, ACTIVO: 1 });
            await cargar();
            avisar('Producto activado');
        } catch (error) {
            avisar(error.message, 'error');
        } finally {
            setActivando(null);
        }
    }

    return (
        <>
            <CrudPagina
                titulo="Productos"
                descripcion="Crea vinos y uva a granel con su composición de cepas."
                recurso="productos" ids={['ID_PRODUCTO']} textoCrear="Nuevo producto" recargar={recargar}
                textoGuardarCreacion="Guardar y activar"
                valoresIniciales={{ STOCK_MINIMO: 0, CEPAS: [{ ID_CEPA: '', PORCENTAJE: 100 }] }}
                prepararEnvio={(v, modo) => {
                    const { cantidad, unidad } = formatoProducto(v, categoriaDe(v));
                    const formato = `${cantidad} ${unidad}`;
                    if (!unidad || !/^\d+(?:\.\d+)?$/.test(cantidad) || Number(cantidad) <= 0 || formato.length > 50) {
                        throw new Error('Ingresa una cantidad mayor a cero y selecciona una unidad del formato.');
                    }

                    const { FORMATO_EDICION, ...datos } = v;
                    return modo === 'crear'
                        ? { ...datos, FORMATO: formato, ACTIVO: 0, ACTIVAR_AL_GUARDAR: true, CODIGO: v.CODIGO.trim(), CEPAS: cepasDe(v) }
                        : { ...datos, FORMATO: formato };
                }}
                camposExtra={(v, modo, alCambiar) => (
                    <>
                        <FormatoProducto valores={v} categoria={categoriaDe(v)} alCambiar={alCambiar} />
                        {modo === 'crear' && (
                            <CepasProductoNuevo cepas={cepas} cargando={cargandoCepas} error={errorCepas}
                                unaSola={esPorKilo(categoriaDe(v)?.UNIDAD_MEDIDA)} composicion={cepasDe(v)} alCambiar={(CEPAS) => alCambiar({ ...v, CEPAS })} />
                        )}
                    </>
                )}
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
                    { nombre: 'ANADA', etiqueta: 'Añada', tipo: 'number', min: 1900, max: anadaMaxima },
                    { nombre: 'PRECIO_ACTUAL', etiqueta: 'Precio (CLP)', tipo: 'number', requerido: true, min: 1 },
                    { nombre: 'STOCK_MINIMO', etiqueta: 'Stock mínimo', tipo: 'number', min: 0,
                        visible: () => modo === 'crear' },
                    { nombre: 'ACTIVO', etiqueta: 'Activo (a la venta)', tipo: 'checkbox', visible: () => modo === 'editar',
                        ayuda: 'La composición debe sumar 100% para activar el producto.' },
                    { nombre: 'DESCRIPCION', etiqueta: 'Descripción', tipo: 'textarea', ancho: 'completo' }
                ]}
                accionesExtra={(f, cargar) => (
                    <>
                        {Number(f.ACTIVO) === 0 && (
                            <button type="button" className="btn btn-exito btn-sm" disabled={activando !== null}
                                onClick={() => activar(f, cargar)}>
                                {activando === f.ID_PRODUCTO ? 'Activando...' : 'Activar'}
                            </button>
                        )}
                        <button type="button" className="btn btn-sec btn-sm" onClick={() => setConCepas(f)}>
                            Cepas
                        </button>
                    </>
                )}
            />
            <ComposicionCepas producto={conCepas} alCerrar={() => { setConCepas(null); setRecargar((n) => n + 1); }} />
        </>
    );
}
