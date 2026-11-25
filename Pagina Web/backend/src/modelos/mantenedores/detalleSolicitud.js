// Mantenedor: Productos de cada solicitud (CEMJ_DETALLE_SOLICITUD)
module.exports = {
    modulo: 'SOLICITUDES',
    lectura: [
        'SOLICITUDES'
    ],
    listar: 'CEMJ_PA_DET_SOLIC_LISTAR',
    filtros: {
        P_ID_SOLICITUD: 'idSolicitud'
    },
    ids: [
        'ID_SOLICITUD',
        'ID_PRODUCTO'
    ],
    crear: 'CEMJ_PA_DET_SOLIC_CREAR',
    modificar: 'CEMJ_PA_DET_SOLIC_MODIFICAR',
    eliminar: 'CEMJ_PA_DET_SOLIC_ELIMINAR',
    campos: [
        'CANTIDAD'
    ]
};
