const fs = require('fs/promises');
const path = require('path');
const { UPLOADS_DIR } = require('../config/multerConfig');

// Borra una imagen de public/uploads sin dejar que un nombre manipulado salga de la carpeta
const eliminarImagen = async (nombre) => {
    if (!nombre || nombre !== path.basename(nombre)) return;
    try {
        await fs.unlink(path.join(UPLOADS_DIR, nombre));
    } catch (err) {
        if (err.code !== 'ENOENT') console.error('No se pudo borrar la imagen', nombre, err.message);
    }
};

module.exports = { eliminarImagen };
