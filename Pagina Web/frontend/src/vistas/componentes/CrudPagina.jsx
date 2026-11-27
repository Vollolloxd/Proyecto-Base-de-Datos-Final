// Vista generica de mantenedor (CRUD): buscador, tabla con acciones y formulario en modal
import { Plus } from 'lucide-react';
import { useCrud } from '../../controladores/useCrud.js';
import Cabecera from './Cabecera.jsx';
import Cargando from './Cargando.jsx';
import Formulario from './Formulario.jsx';
import Modal, { Pie } from './Modal.jsx';
import Tabla from './Tabla.jsx';

export default function CrudPagina({
    titulo,
    descripcion,
    recurso,
    columnas,
    campos,
    ids,
    filtros = {},
    conInactivos = false,
    reactivable = false,
    soloLectura = false,
    puedeEditar = () => true,
    puedeEliminar = () => true,
    textoEliminar = 'Desactivar',
    textoCrear = 'Nuevo',
    textoGuardarCreacion = 'Guardar',
    accionesExtra,
    valoresIniciales = {},
    prepararEnvio,
    camposExtra,
    transformarFilas,
    ordenDescendente = false,
    alCargar,
    recargar = 0,
    porPagina,
    embebido = false
}) {
    const crud = useCrud({
        recurso, ids, filtros, conInactivos, textoEliminar, prepararEnvio, transformarFilas,
        ordenDescendente, alCargar, recargar
    });
    const { edicion, setEdicion } = crud;

    const listaCampos = typeof campos === 'function'
        ? campos(edicion?.valores || {}, edicion?.modo)
        : (campos || []);

    const hayAcciones = !soloLectura || accionesExtra;
    const acciones = hayAcciones ? (fila) => (
        <div className="flex flex-wrap justify-end gap-1.5">
            {accionesExtra?.(fila, crud.cargar)}
            {!soloLectura && puedeEditar(fila) && (
                <button type="button" className="btn btn-sec btn-sm"
                    onClick={() => setEdicion({ modo: 'editar', valores: { ...fila }, original: fila })}>
                    Editar
                </button>
            )}
            {!soloLectura && reactivable && crud.estaInactivo(fila) && (
                <button type="button" className="btn btn-exito btn-sm" onClick={() => crud.reactivar(fila)}>
                    Reactivar
                </button>
            )}
            {!soloLectura && puedeEliminar(fila) && !crud.estaInactivo(fila) && (
                <button type="button" className="btn btn-peligro btn-sm" onClick={() => crud.eliminar(fila)}>
                    {textoEliminar}
                </button>
            )}
        </div>
    ) : undefined;

    return (
        <section>
            {!embebido && <Cabecera titulo={titulo} descripcion={descripcion} />}

            <div className="mb-3 flex flex-wrap items-center gap-3">
                <input type="search" className="min-w-0 flex-1 sm:max-w-xs" placeholder="Buscar..." value={crud.busqueda}
                    onChange={(e) => crud.setBusqueda(e.target.value)} aria-label="Buscar" />
                {conInactivos && (
                    <label className="casilla">
                        <input type="checkbox" checked={crud.verTodos} onChange={(e) => crud.setVerTodos(e.target.checked)} />
                        Mostrar desactivados
                    </label>
                )}
                {!soloLectura && (
                    <button type="button" className="btn ml-auto"
                        onClick={() => setEdicion({ modo: 'crear', valores: { ...valoresIniciales } })}>
                        <Plus size={16} strokeWidth={1.75} aria-hidden="true" /> {textoCrear}
                    </button>
                )}
            </div>

            {crud.cargando && crud.filas.length === 0
                ? <Cargando />
                : <Tabla columnas={columnas} filas={crud.visibles} acciones={acciones} porPagina={porPagina}
                    claveFila={(f) => crud.rutaIds(f)} />}

            <Modal titulo={edicion?.modo === 'crear' ? `${textoCrear}` : 'Editar'} abierto={!!edicion}
                alCerrar={() => setEdicion(null)}>
                {edicion && (
                    <form onSubmit={crud.guardar}>
                        <Formulario campos={listaCampos} valores={edicion.valores} modo={edicion.modo}
                            alCambiar={(valores) => setEdicion({ ...edicion, valores })} />
                        {camposExtra?.(edicion.valores, edicion.modo,
                            (valores) => setEdicion({ ...edicion, valores }))}
                        <Pie>
                            <button type="button" className="btn btn-sec" onClick={() => setEdicion(null)}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn" disabled={crud.guardando}>
                                {crud.guardando ? 'Guardando...' : edicion.modo === 'crear' ? textoGuardarCreacion : 'Guardar'}
                            </button>
                        </Pie>
                    </form>
                )}
            </Modal>
        </section>
    );
}
