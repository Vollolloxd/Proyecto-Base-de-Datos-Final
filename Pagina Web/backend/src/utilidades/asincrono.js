// Envuelve un controlador async para que sus errores lleguen al manejador de errores de Express
const asincrono = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asincrono;
