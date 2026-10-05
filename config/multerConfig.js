const crypto = require('crypto');
const multer = require('multer');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../public/uploads');
const EXTENSIONES_PERMITIDAS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const MIMETYPES_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const TAMANO_MAXIMO = 2 * 1024 * 1024; // 2 MB

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    // Nombre aleatorio: nunca se usa el nombre original que manda el cliente
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
    }
});

// El mimetype lo decide el cliente, así que también se valida la extensión
// (es la que determina con qué Content-Type se sirve el archivo después)
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (EXTENSIONES_PERMITIDAS.includes(ext) && MIMETYPES_PERMITIDOS.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
        error.message = 'Solo se permiten imágenes JPG, PNG, WEBP o GIF.';
        cb(error);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: TAMANO_MAXIMO, files: 1 }
});

upload.UPLOADS_DIR = UPLOADS_DIR;

module.exports = upload;
