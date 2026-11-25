// Mantenedor: Productos: vinos y uva a granel (CEMJ_PRODUCTO)
module.exports = {
    modulo: 'PRODUCTOS',
    lectura: [
        'PRODUCTOS',
        'VENTAS',
        'INVENTARIO',
        'SOLICITUDES'
    ],
    listar: 'CEMJ_PA_PRODUCTO_LISTAR',
    ids: [
        'ID_PRODUCTO'
    ],
    crear: 'CEMJ_PA_PRODUCTO_CREAR',
    modificar: 'CEMJ_PA_PRODUCTO_MODIFICAR',
    eliminar: 'CEMJ_PA_PRODUCTO_ELIMINAR',
    campos: [
        'ID_CATEGORIA',
        'CODIGO',
        'NOMBRE',
        'DESCRIPCION',
        'FORMATO',
        'ANADA',
        'PRECIO_ACTUAL',
        'ACTIVO'
    ],
    soloAlCrear: [
        'STOCK_MINIMO'
    ]
};
