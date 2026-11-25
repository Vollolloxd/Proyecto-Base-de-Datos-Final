// Mantenedor: Composicion de cepas de cada producto (CEMJ_PRODUCTO_CEPA)
module.exports = {
    modulo: 'PRODUCTOS',
    lectura: [
        'PRODUCTOS'
    ],
    listar: 'CEMJ_PA_PROD_CEPA_LISTAR',
    filtros: {
        P_ID_PRODUCTO: 'idProducto'
    },
    ids: [
        'ID_PRODUCTO',
        'ID_CEPA'
    ],
    crear: 'CEMJ_PA_PROD_CEPA_CREAR',
    modificar: 'CEMJ_PA_PROD_CEPA_MODIFICAR',
    eliminar: 'CEMJ_PA_PROD_CEPA_ELIMINAR',
    campos: [
        'PORCENTAJE'
    ]
};
