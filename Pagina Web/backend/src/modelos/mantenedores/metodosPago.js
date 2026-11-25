// Mantenedor: Metodos de pago (CEMJ_METODO_PAGO)
module.exports = {
    modulo: 'METODOS_PAGO',
    lectura: [
        'METODOS_PAGO',
        'VENTAS'
    ],
    listar: 'CEMJ_PA_METODO_PAGO_LISTAR',
    conInactivos: true,
    ids: [
        'ID_METODO_PAGO'
    ],
    crear: 'CEMJ_PA_METODO_PAGO_CREAR',
    modificar: 'CEMJ_PA_METODO_PAGO_MODIFICAR',
    eliminar: 'CEMJ_PA_METODO_PAGO_ELIMINAR',
    campos: [
        'NOMBRE',
        'DESCRIPCION',
        'ACTIVO'
    ]
};
