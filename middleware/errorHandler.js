const multer = require('multer');
const { quiereJson } = require('./authMiddleware');

// Manejador central de errores: registra el detalle en el servidor y
// al cliente le devuelve un mensaje genérico (sin SQL ni trazas)
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
    let status = err.status || 500;
    let message = 'Ocurrió un error inesperado. Inténtalo de nuevo más tarde.';

    if (err instanceof multer.MulterError) {
        status = 400;
        message = err.code === 'LIMIT_FILE_SIZE'
            ? 'La imagen supera el tamaño máximo permitido (2 MB).'
            : err.message;
    } else if (status < 500 && err.expose !== false) {
        message = err.message;
    } else {
        console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
    }

    if (res.headersSent) return next(err);

    if (quiereJson(req)) {
        return res.status(status).json({ success: false, message });
    }
    res.status(status).send(message);
};
