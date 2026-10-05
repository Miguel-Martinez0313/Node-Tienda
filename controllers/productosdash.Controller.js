const pool = require('../config/db');
const { toInt, toDecimal, toText } = require('../utils/validators');
const { eliminarImagen } = require('../utils/uploads');

const controller = {};

// Valida los campos del formulario; devuelve { datos } o { error }
const validarProducto = (body) => {
    const datos = {
        nombre: toText(body.nombre, { max: 100 }),
        descripcion: toText(body.descripcion, { min: 0, max: 2000 }),
        precio: toDecimal(body.precio, { min: 0, max: 99999999.99 }),
        cantidad_en_almacen: toInt(body.cantidad_en_almacen, { min: 0, max: 1000000 }),
        categoria_id: toInt(body.categoria_id, { min: 1 })
    };
    if (!datos.nombre) return { error: 'El nombre es obligatorio (máximo 100 caracteres).' };
    if (datos.descripcion === null) return { error: 'La descripción es demasiado larga.' };
    if (datos.precio === null) return { error: 'El precio debe ser un número positivo con hasta 2 decimales.' };
    if (datos.cantidad_en_almacen === null) return { error: 'La cantidad en almacén debe ser un entero mayor o igual a 0.' };
    if (!datos.categoria_id) return { error: 'Selecciona una categoría válida.' };
    return { datos };
};

const categoriaExiste = async (id) => {
    const [rows] = await pool.query('SELECT id FROM categorias WHERE id = ?', [id]);
    return rows.length > 0;
};

// Mostrar todos los productos y categorías
controller.mostrar = async (req, res) => {
    const [productos] = await pool.query('SELECT * FROM productos');
    const [categorias] = await pool.query('SELECT id, nombre FROM categorias ORDER BY nombre');
    res.render('dashboard/productos', { productos, categorias });
};

// Crear un producto nuevo (la imagen es opcional)
controller.crear = async (req, res) => {
    const imagen = req.file ? req.file.filename : null;
    const { datos, error } = validarProducto(req.body);

    if (error || !(await categoriaExiste(datos.categoria_id))) {
        await eliminarImagen(imagen);
        return res.status(400).json({ success: false, message: error || 'La categoría no existe.' });
    }

    try {
        const [result] = await pool.query('INSERT INTO productos SET ?', [{ ...datos, cantidad_vendida: 0, imagen }]);
        res.status(201).json({ success: true, message: 'Producto creado correctamente.', id: result.insertId });
    } catch (err) {
        await eliminarImagen(imagen);
        throw err;
    }
};

controller.editar = async (req, res) => {
    const id = toInt(req.params.id, { min: 1 });
    const nuevaImagen = req.file ? req.file.filename : null;
    const { datos, error } = validarProducto(req.body);

    if (!id || error || !(await categoriaExiste(datos.categoria_id))) {
        await eliminarImagen(nuevaImagen);
        return res.status(400).json({ success: false, message: error || 'Datos no válidos.' });
    }

    const [actuales] = await pool.query('SELECT imagen FROM productos WHERE id = ?', [id]);
    if (actuales.length === 0) {
        await eliminarImagen(nuevaImagen);
        return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    if (nuevaImagen) datos.imagen = nuevaImagen;

    try {
        await pool.query('UPDATE productos SET ? WHERE id = ?', [datos, id]);
    } catch (err) {
        await eliminarImagen(nuevaImagen);
        throw err;
    }

    // Solo cuando la actualización tuvo éxito se borra la imagen anterior
    if (nuevaImagen) await eliminarImagen(actuales[0].imagen);

    res.json({ success: true, message: 'Producto actualizado correctamente.' });
};

// Eliminar un producto
controller.eliminar = async (req, res) => {
    const id = toInt(req.params.id, { min: 1 });
    if (!id) return res.status(400).json({ success: false, message: 'ID no válido.' });

    const [actuales] = await pool.query('SELECT imagen FROM productos WHERE id = ?', [id]);
    if (actuales.length === 0) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    try {
        await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ success: false, message: 'No se puede eliminar: el producto tiene compras registradas.' });
        }
        throw err;
    }

    await eliminarImagen(actuales[0].imagen);
    res.json({ success: true, message: 'Producto eliminado correctamente.' });
};

module.exports = controller;
