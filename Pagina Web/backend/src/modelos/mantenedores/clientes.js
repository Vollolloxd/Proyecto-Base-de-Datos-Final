// Mantenedor: Clientes personas y empresas (CEMJ_CLIENTE)
module.exports = {
    modulo: 'CLIENTES',
    lectura: [
        'CLIENTES',
        'VENTAS',
        'SOLICITUDES',
        'USUARIOS'
    ],
    listar: 'CEMJ_PA_CLIENTE_LISTAR',
    conInactivos: true,
    ids: [
        'ID_CLIENTE'
    ],
    crear: 'CEMJ_PA_CLIENTE_CREAR',
    modificar: 'CEMJ_PA_CLIENTE_MODIFICAR',
    eliminar: 'CEMJ_PA_CLIENTE_ELIMINAR',
    reactivar: 'CEMJ_PA_CLIENTE_REACTIVAR',
    campos: [
        'TIPO_CLIENTE',
        'RUT',
        'NOMBRE',
        'APELLIDO1',
        'APELLIDO2',
        'RAZON_SOCIAL',
        'TELEFONO',
        'CORREO'
    ]
};
