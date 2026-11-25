// Sistema de Gestion Viña La Alborada
// Ramo: Base de Datos - Seccion 2
// Profesor: Carlos Castro
// Integrantes: Mauricio Castro, Emerson Fuenzalida, José Cáceres, Cristóbal Villalobos
// Punto de entrada: conecta con Oracle y levanta la aplicacion (src/app.js)
const config = require('./config/entorno');
const db = require('./config/baseDatos');
const app = require('./app');

async function iniciar() {
    try {
        await db.iniciarPool();
        await db.probarConexion();
        console.log(`Conectado a Oracle (${config.db.connectString}) como ${config.db.user}`);
    } catch (err) {
        console.error('No se pudo conectar a Oracle. Revise backend/.env y que el servicio este iniciado.');
        console.error(err.message);
        process.exit(1);
    }
    app.listen(config.puerto, () => {
        console.log(`Servidor listo en http://localhost:${config.puerto}`);
    });
}

process.on('SIGINT', async () => {
    await db.cerrarPool();
    process.exit(0);
});

iniciar();
