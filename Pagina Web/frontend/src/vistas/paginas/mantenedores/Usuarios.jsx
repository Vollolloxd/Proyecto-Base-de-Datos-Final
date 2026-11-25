// Pagina: mantenedor de usuarios (perfil, cliente asociado y contraseña cifrada en el servidor)
import { useDatos } from '../../../controladores/useDatos.js';
import { RUTA_CLIENTES, RUTA_ROLES } from '../../../modelos/mantenedoresModelo.js';
import { fecha, nombreCliente, nombrePropio } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import { colActivo } from './columnas.jsx';

export default function Usuarios() {
    const { datos: roles } = useDatos(RUTA_ROLES);
    const { datos: clientes } = useDatos(RUTA_CLIENTES);
    const nombreRol = (id) => roles.find((r) => String(r.ID_ROL) === String(id))?.NOMBRE;
    const esCliente = (v) => nombreRol(v.ID_ROL) === 'CLIENTE';
    const clientePorId = (id) => clientes.find((c) => c.ID_CLIENTE === id);

    return (
        <CrudPagina
            titulo="Usuarios"
            descripcion="Cuentas de acceso. La contraseña se guarda cifrada (hash) en la base de datos."
            recurso="usuarios" ids={['ID_USUARIO']} conInactivos textoCrear="Nuevo usuario"
            valoresIniciales={{ ACTIVO: 1 }}
            columnas={[
                { campo: 'CORREO', titulo: 'Correo', render: (f) => f.CORREO.toLowerCase() },
                { campo: 'ROL', titulo: 'Perfil', render: (f) => <Insignia valor={f.ROL} /> },
                { campo: 'ID_CLIENTE', titulo: 'Cliente asociado',
                    render: (f) => nombreCliente(clientePorId(f.ID_CLIENTE)) },
                { campo: 'FECHA_REGISTRO', titulo: 'Registro', render: (f) => fecha(f.FECHA_REGISTRO) },
                colActivo
            ]}
            campos={(v, modo) => [
                { nombre: 'CORREO', etiqueta: 'Correo', tipo: 'email', requerido: true, ancho: 'completo' },
                { nombre: 'ID_ROL', etiqueta: 'Perfil', tipo: 'select', requerido: true,
                    opciones: roles.map((r) => ({ valor: r.ID_ROL, texto: nombrePropio(r.NOMBRE) })) },
                { nombre: 'ID_CLIENTE', etiqueta: 'Cliente asociado', tipo: 'select', requerido: true,
                    visible: esCliente,
                    opciones: clientes.map((c) => ({ valor: c.ID_CLIENTE, texto: nombreCliente(c) })) },
                { nombre: 'CLAVE', etiqueta: modo === 'crear' ? 'Contraseña' : 'Nueva contraseña',
                    tipo: 'password', requerido: modo === 'crear', autocompletar: 'new-password',
                    ayuda: modo === 'crear' ? 'Mínimo 6 caracteres' : 'Déjela vacía para mantener la actual' },
                { nombre: 'ACTIVO', etiqueta: 'Activo', tipo: 'checkbox' }
            ]}
            prepararEnvio={(v) => ({
                ...v,
                ID_CLIENTE: esCliente(v) ? v.ID_CLIENTE : null,
                CLAVE: v.CLAVE || null
            })}
        />
    );
}
