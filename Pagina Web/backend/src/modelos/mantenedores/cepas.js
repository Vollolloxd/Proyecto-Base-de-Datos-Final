// Mantenedor: Cepas de uva (CEMJ_CEPA)
module.exports = {
    modulo: 'PRODUCTOS',
    lectura: [
        'PRODUCTOS'
    ],
    listar: 'CEMJ_PA_CEPA_LISTAR',
    conInactivos: true,
    ids: [
        'ID_CEPA'
    ],
    crear: 'CEMJ_PA_CEPA_CREAR',
    modificar: 'CEMJ_PA_CEPA_MODIFICAR',
    eliminar: 'CEMJ_PA_CEPA_ELIMINAR',
    reactivar: 'CEMJ_PA_CEPA_REACTIVAR',
    campos: [
        'NOMBRE',
        'DESCRIPCION'
    ]
};
