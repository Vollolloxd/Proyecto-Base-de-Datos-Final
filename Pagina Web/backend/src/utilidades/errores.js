// Errores de la aplicacion: crea errores con numero (como Oracle) y traduce los de Oracle a mensajes
function errorApp(numero, mensaje) {
    const err = new Error(`ORA-${numero}: ${mensaje}`);
    err.errorNum = numero;
    return err;
}

function traducirError(err) {
    const numero = err.errorNum;
    const texto = String(err.message || '');
    let linea = texto.split('\n')[0].replace(/^ORA-\d+:\s*/, '');

    const interno = linea.match(/ORA-(\d+):\s*(.*)$/);
    let numeroInterno = null;
    if (interno) {
        numeroInterno = Number(interno[1]);
        if (numeroInterno >= 20000 && numeroInterno <= 20999) {
            linea = interno[2];
        } else {
            linea = linea.slice(0, interno.index).replace(/[:\s]+$/, '');
        }
    }

    if (numero === 1 || numeroInterno === 1) {
        return { estado: 409, mensaje: 'YA EXISTE UN REGISTRO CON ESOS DATOS' };
    }
    if (numero === 2291 || numeroInterno === 2291) {
        return { estado: 400, mensaje: 'EL REGISTRO RELACIONADO NO EXISTE' };
    }
    if (numero === 2292 || numeroInterno === 2292) {
        return { estado: 409, mensaje: 'NO SE PUEDE ELIMINAR: TIENE REGISTROS ASOCIADOS' };
    }
    if (numero >= 20000 && numero <= 20999) {
        return { estado: numero === 20100 ? 404 : 400, mensaje: linea };
    }
    if (/^NJS-|ORA-12541|ORA-12514|ORA-01017|ORA-28000/.test(texto)) {
        return { estado: 503, mensaje: 'NO HAY CONEXION CON LA BASE DE DATOS' };
    }
    return { estado: 500, mensaje: 'ERROR INTERNO DEL SERVIDOR' };
}

module.exports = { errorApp, traducirError };
