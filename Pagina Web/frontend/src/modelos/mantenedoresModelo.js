// Modelo generico de mantenedores (CRUD): listar, crear, modificar, eliminar y reactivar
import { api, consulta } from './http.js';

const base = (recurso) => `/mantenedores/${recurso}`;

export const rutaListar = (recurso, parametros) => `${base(recurso)}${consulta(parametros)}`;
export const RUTA_PRODUCTOS = base('productos');
export const RUTA_CLIENTES = base('clientes');
export const RUTA_SOLICITUDES = base('solicitudes');
export const RUTA_CATEGORIAS = base('categorias');
export const RUTA_CEPAS = base('cepas');
export const RUTA_ROLES = base('roles');
export const RUTA_METODOS_PAGO = base('metodos-pago');

export const listar = (recurso, parametros) => api(rutaListar(recurso, parametros));
const crearRegistro = (recurso, cuerpo) => api(base(recurso), { metodo: 'POST', cuerpo });

export function crear(recurso, cuerpo) {
    if (recurso === 'productos' && cuerpo.ACTIVAR_AL_GUARDAR) return crearYActivarProducto(cuerpo);
    return crearRegistro(recurso, cuerpo);
}
export const modificar = (recurso, rutaIds, cuerpo) => api(`${base(recurso)}/${rutaIds}`, { metodo: 'PUT', cuerpo });
export const eliminar = (recurso, rutaIds) => api(`${base(recurso)}/${rutaIds}`, { metodo: 'DELETE' });
export const reactivar = (recurso, rutaIds) => api(`${base(recurso)}/${rutaIds}/reactivar`, { metodo: 'PATCH' });


// El servidor anterior solo acepta el alta inactiva y devuelve { ok: true }.
async function crearYActivarProducto(cuerpo) {
    const total = cuerpo.CEPAS.reduce((suma, cepa) => suma + Math.round(Number(cepa.PORCENTAJE) * 100), 0);
    if (total !== 10000 || cuerpo.CEPAS.some((cepa) => !cepa.ID_CEPA || Number(cepa.PORCENTAJE) <= 0)
        || new Set(cuerpo.CEPAS.map((cepa) => String(cepa.ID_CEPA))).size !== cuerpo.CEPAS.length) {
        throw new Error('Selecciona cepas distintas y comprueba que sumen 100 %.');
    }

    const resultado = await crearRegistro('productos', { ...cuerpo, ACTIVO: 0 });
    if (resultado?.AVISO || resultado?.ID_PRODUCTO != null || !resultado?.ok) return resultado;

    try {
        const codigo = cuerpo.CODIGO.toUpperCase();
        const producto = (await listar('productos')).find((fila) => fila.CODIGO === codigo);
        if (!producto) throw new Error('No se pudo consultar el producto creado.');

        const id = producto.ID_PRODUCTO;
        for (const cepa of cuerpo.CEPAS) {
            await crearRegistro('productos-cepas', {
                ID_PRODUCTO: id,
                ID_CEPA: Number(cepa.ID_CEPA),
                PORCENTAJE: Number(cepa.PORCENTAJE)
            });
        }
        await modificar('productos', id, { ...producto, ACTIVO: 1 });
        const confirmado = (await listar('productos')).find((fila) => fila.ID_PRODUCTO === id);
        if (Number(confirmado?.ACTIVO) !== 1) throw new Error('No se pudo confirmar la activación.');
        return { ok: true, ID_PRODUCTO: id, ACTIVO: 1 };
    } catch (error) {
        return { ok: true, AVISO: `El producto se creó, pero la configuración quedó pendiente. ${error.message}` };
    }
}
