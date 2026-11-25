// Mantenedor: Movimientos de inventario (CEMJ_MOVIMIENTO_INVENTARIO)
module.exports = {
    modulo: 'INVENTARIO',
    lectura: [
        'INVENTARIO'
    ],
    listar: 'CEMJ_PA_MOVIMIENTO_LISTAR',
    ids: [
        'ID_MOVIMIENTO'
    ],
    crear: 'CEMJ_PA_MOVIMIENTO_CREAR',
    modificar: 'CEMJ_PA_MOVIMIENTO_MODIFICAR',
    eliminar: 'CEMJ_PA_MOVIMIENTO_ELIMINAR',
    campos: [
        'ID_PRODUCTO',
        'TIPO_MOVIMIENTO',
        'CANTIDAD',
        'MOTIVO'
    ],
    usuarioAlCrear: 'P_ID_USUARIO'
};
