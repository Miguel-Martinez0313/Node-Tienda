const pool = require('../config/db');
const { toInt, toDecimal, toText, toDateTime, formatDateTimeLocal } = require('../utils/validators');

const descuentodashController = {};

// Solo se aceptan estos campos del formulario (nunca req.body completo)
const validarOferta = (body) => {
    const datos = {
        descuento: toDecimal(body.descuento, { min: 0.01, max: 100 }),
        descripcion: toText(body.descripcion, { min: 0, max: 2000 }),
        fecha_inicio: toDateTime(body.fecha_inicio),
        fecha_fin: toDateTime(body.fecha_fin)
    };
    if (datos.descuento === null) return { error: 'El descuento debe ser un porcentaje entre 0.01 y 100.' };
    if (datos.descripcion === null) return { error: 'La descripción es demasiado larga.' };
    if (!datos.fecha_inicio || !datos.fecha_fin) return { error: 'Las fechas no son válidas.' };
    if (datos.fecha_fin < datos.fecha_inicio) return { error: 'La fecha de fin debe ser posterior a la de inicio.' };
    return { datos };
};

// Mostrar todas las ofertas
descuentodashController.mostrar = async (req, res) => {
    const [resultados] = await pool.query('SELECT * FROM ofertas');

    const descuentos = resultados.map((oferta) => ({
        ...oferta,
        fecha_inicio: formatDateTimeLocal(oferta.fecha_inicio),
        fecha_fin: formatDateTimeLocal(oferta.fecha_fin)
    }));

    res.render('dashboard/descuentos', { descuentos });
};

// Crear una nueva oferta
descuentodashController.crear = async (req, res) => {
    const { datos, error } = validarOferta(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const [result] = await pool.query('INSERT INTO ofertas SET ?', [datos]);
    res.status(201).json({ success: true, message: 'Oferta creada correctamente', id: result.insertId });
};

// Editar una oferta existente
descuentodashController.editar = async (req, res) => {
    const id = toInt(req.params.id, { min: 1 });
    const { datos, error } = validarOferta(req.body);
    if (!id || error) return res.status(400).json({ success: false, message: error || 'ID no válido.' });

    const [result] = await pool.query('UPDATE ofertas SET ? WHERE id = ?', [datos, id]);
    if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'No se encontró la oferta para actualizar' });
    }
    res.json({ success: true, message: 'Oferta actualizada correctamente' });
};

// Eliminar una oferta
descuentodashController.eliminar = async (req, res) => {
    const id = toInt(req.params.id, { min: 1 });
    if (!id) return res.status(400).json({ success: false, message: 'ID no válido.' });

    try {
        const [result] = await pool.query('DELETE FROM ofertas WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'No se encontró la oferta para eliminar' });
        }
        res.json({ success: true, message: 'Oferta eliminada correctamente' });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ success: false, message: 'No se puede eliminar: hay productos con esta oferta.' });
        }
        throw err;
    }
};

module.exports = descuentodashController;
