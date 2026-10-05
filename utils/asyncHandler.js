// Express 4 no captura los errores de funciones async: los pasamos a next()
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
