// Mantenedor: Categorias de producto (CEMJ_CATEGORIA_PRODUCTO)
module.exports = {
    modulo: 'PRODUCTOS',
    lectura: [
        'PRODUCTOS'
    ],
    listar: 'CEMJ_PA_CATEGORIA_LISTAR',
    conInactivos: true,
    ids: [
        'ID_CATEGORIA'
    ],
    crear: 'CEMJ_PA_CATEGORIA_CREAR',
    modificar: 'CEMJ_PA_CATEGORIA_MODIFICAR',
    eliminar: 'CEMJ_PA_CATEGORIA_ELIMINAR',
    reactivar: 'CEMJ_PA_CATEGORIA_REACTIVAR',
    campos: [
        'NOMBRE',
        'DESCRIPCION',
        'UNIDAD_MEDIDA'
    ]
};
