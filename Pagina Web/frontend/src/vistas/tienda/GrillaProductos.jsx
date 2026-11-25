// Vista: grilla de tarjetas de producto (4/3/2/1 columnas segun el ancho)
import TarjetaProducto from './TarjetaProducto.jsx';

export default function GrillaProductos({ productos, clave, cantidades, agregando, alComprar, alCambiarCantidad, fondo }) {
    return (
        <div key={clave} className="escalonado grid grid-cols-1 gap-x-8 gap-y-14 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productos.map((p) => (
                <TarjetaProducto key={p.ID_PRODUCTO} p={p} fondo={fondo}
                    cantidad={cantidades[p.ID_PRODUCTO] ?? 1}
                    alCambiarCantidad={alCambiarCantidad(p.ID_PRODUCTO)}
                    agregando={agregando === p.ID_PRODUCTO}
                    alAgregar={() => alComprar(p)} />
            ))}
        </div>
    );
}
