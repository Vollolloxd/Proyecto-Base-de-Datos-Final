// Vista: seccion "Nuestros vinos" con la barra del catalogo y la grilla de vinos
import { Link } from 'react-router-dom';
import Cargando from '../componentes/Cargando.jsx';
import BarraCatalogo from './BarraCatalogo.jsx';
import GrillaProductos from './GrillaProductos.jsx';

export default function SeccionVinos({ tienda, propsGrilla }) {
    const { esCliente, busqueda, setBusqueda, orden, setOrden, visibles, hayUva, error, cargando, productos, vinos } = tienda;
    return (
        <section id="vinos" aria-labelledby="titulo-vinos" className="scroll-mt-16">
            <div className="mx-auto max-w-tienda px-4 py-20 sm:px-8 lg:px-14 lg:py-24">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 id="titulo-vinos" className="font-marca text-4xl font-medium tracking-[-0.005em] lg:text-5xl">Nuestros vinos</h2>
                        <p className="mt-3 text-sm text-suave">
                            {esCliente
                                ? <>Agrega productos a tu pedido y envíalo desde <Link to="/mis-pedidos">Mis pedidos</Link>.</>
                                : 'Precios en pesos chilenos. Puedes ver todo el catálogo sin registrarte.'}
                        </p>
                    </div>
                </div>

                <BarraCatalogo busqueda={busqueda} alBuscar={setBusqueda} orden={orden} alOrdenar={setOrden}
                    resultados={visibles.length} hayUva={hayUva} />

                {error && <p className="mb-6 text-sm text-peligro" role="alert">{error}</p>}
                {cargando && productos.length === 0 ? <Cargando /> : (
                    vinos.length === 0
                        ? (
                            <div className="py-12 text-center">
                                <p className="text-suave">No hay vinos que coincidan con la búsqueda.</p>
                                {busqueda && (
                                    <button type="button" className="btn btn-sec mt-4" onClick={() => setBusqueda('')}>
                                        Ver todo el catálogo
                                    </button>
                                )}
                            </div>
                        )
                        : <GrillaProductos productos={vinos} clave={orden} {...propsGrilla} />
                )}
            </div>
        </section>
    );
}
