// Definicion de los mantenedores: recurso de la URL -> procedimientos CRUD, campos y permisos
module.exports = {
    'categorias': require('./categorias'),
    'cepas': require('./cepas'),
    'clientes': require('./clientes'),
    'usuarios': require('./usuarios'),
    'metodos-pago': require('./metodosPago'),
    'productos': require('./productos'),
    'productos-cepas': require('./productosCepas'),
    'solicitudes': require('./solicitudes'),
    'detalle-solicitud': require('./detalleSolicitud'),
    'movimientos': require('./movimientos'),
    'roles': require('./roles')
};
