// Configuracion leida desde backend/.env (puerto, conexion a Oracle y sesiones JWT)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

module.exports = {
    puerto: Number(process.env.PUERTO || 3001),
    db: {
        user: process.env.DB_USUARIO,
        password: process.env.DB_CLAVE,
        connectString: process.env.DB_CONEXION
    },
    jwtSecreto: process.env.JWT_SECRETO || 'cambiar-este-secreto',
    jwtDuracion: process.env.JWT_DURACION || '8h'
};
