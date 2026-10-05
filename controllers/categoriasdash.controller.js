const pool = require('../config/db');
const { toInt, toText } = require('../utils/validators');

const categoriasController = {};

// Solo se aceptan estos campos del formulario (nunca req.body completo)
const validarCategoria = (body) => {
    const datos = {
        nombre: toText(body.nombre, { max: 100 }),
        descripcion: toText(body.descripcion, { min: 0, max: 2000 })
    };
    if (!datos.nombre) return { error: 'El nombre es obligatorio (máximo 100 caracteres).' };
    if (datos.descripcion === null) return { error: 'La descripción es demasiado larga.' };
    return { datos };
};

const manejarDuplicado = (err, res) => {
    if (err.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ success: false, message: 'Ya existe una categoría con ese nombre.' });
        return true;
    }
    return false;
};

categoriasController.mostrar = async (req, res) => {
    const [categorias] = await pool.query('SELECT * FROM categorias');
    res.render('dashboard/categorias', { categorias });
};

categoriasController.crear = async (req, res) => {
    const { datos, error } = validarCategoria(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    try {
        const [result] = await pool.query('INSERT INTO categorias SET ?', [datos]);
        res.status(201).json({ success: true, message: 'Categoría creada correctamente', id: result.insertId });
    } catch (err) {
        if (!manejarDuplicado(err, res)) throw err;
    }
};

categoriasController.editar = async (req, res) => {
    const id = toInt(req.params.id, { min: 1 });
    const { datos, error } = validarCategoria(req.body);
    if (!id || error) return res.status(400).json({ success: false, message: error || 'ID no válido.' });

    try {
        const [result] = await pool.query('UPDATE categorias SET ? WHERE id = ?', [datos, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada.' });
        }
        res.json({ success: true, message: 'Categoría actualizada correctamente' });
    } catch (err) {
        if (!manejarDuplicado(err, res)) throw err;
    }
};

categoriasController.eliminar = async (req, res) => {
    const id = toInt(req.params.id, { min: 1 });
    if (!id) return res.status(400).json({ success: false, message: 'ID no válido.' });

    try {
        const [result] = await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada.' });
        }
        res.json({ success: true, message: 'Categoría eliminada correctamente' });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ success: false, message: 'No se puede eliminar: hay productos en esta categoría.' });
        }
        throw err;
    }
};

module.exports = categoriasController;
