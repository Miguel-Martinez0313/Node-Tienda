const pool = require('../config/db');
const { toInt } = require('../utils/validators');

const productosController = {};

const MAX_POR_PRODUCTO = 100;

const volverConMensaje = (req, res, message) => {
    req.session.mensajeCarrito = message;
    res.redirect('/productos/comprar');
};

// Agregar productos al carrito
productosController.agregarAlCarrito = async (req, res) => {
    const productoId = toInt(req.body.producto_id, { min: 1 });
    const cantidad = toInt(req.body.cantidad, { min: 1, max: MAX_POR_PRODUCTO });

    if (!productoId || !cantidad) {
        return volverConMensaje(req, res, `La cantidad debe ser un número entre 1 y ${MAX_POR_PRODUCTO}.`);
    }

    const [productos] = await pool.query(
        'SELECT id, nombre, imagen, cantidad_en_almacen FROM productos WHERE id = ?',
        [productoId]
    );
    const producto = productos[0];
    if (!producto) {
        return res.status(404).send('Producto no encontrado');
    }

    if (!Array.isArray(req.session.carrito)) {
        req.session.carrito = [];
    }

    const existente = req.session.carrito.find((item) => item.producto_id === productoId);
    const total = (existente ? existente.cantidad : 0) + cantidad;

    if (total > producto.cantidad_en_almacen) {
        return volverConMensaje(req, res, `Solo hay ${producto.cantidad_en_almacen} unidades de ${producto.nombre} disponibles.`);
    }

    if (existente) {
        existente.cantidad = total;
    } else {
        req.session.carrito.push({
            producto_id: productoId,
            nombre: producto.nombre,
            imagen: producto.imagen,
            cantidad
        });
    }

    res.redirect('/productos/comprar');
};

// Mostrar productos disponibles y contenido del carrito en la misma vista
productosController.mostrarProductos = async (req, res) => {
    const categoriaId = toInt(req.query.categoria, { min: 1 });

    const [categorias] = await pool.query('SELECT id, nombre FROM categorias ORDER BY nombre');

    let query = 'SELECT id, nombre, precio, imagen FROM productos WHERE cantidad_en_almacen > 0';
    const params = [];
    if (categoriaId) {
        query += ' AND categoria_id = ?';
        params.push(categoriaId);
    }
    const [productos] = await pool.query(query, params);

    const mensaje = req.session.mensajeCarrito || '';
    delete req.session.mensajeCarrito;

    res.render('vender/comprar', {
        productos,
        carrito: req.session.carrito || [],
        categorias,
        categoriaSeleccionada: categoriaId,
        mensaje
    });
};

// Finalizar la compra
productosController.finalizarCompra = async (req, res) => {
    const carrito = req.session.carrito;
    if (!Array.isArray(carrito) || carrito.length === 0) {
        return volverConMensaje(req, res, 'No hay productos en el carrito.');
    }

    const usuarioId = req.session.user.id;

    try {
        // Las consultas van una tras otra dentro de la transacción: así, si un producto
        // no tiene stock suficiente, se deshace todo lo anterior
        await pool.withTransaction(async (conn) => {
            for (const item of carrito) {
                const [productos] = await conn.query(
                    'SELECT nombre, precio, cantidad_en_almacen FROM productos WHERE id = ? FOR UPDATE',
                    [item.producto_id]
                );
                const producto = productos[0];
                if (!producto || producto.cantidad_en_almacen < item.cantidad) {
                    const error = new Error(`No hay stock suficiente de ${producto ? producto.nombre : item.nombre}.`);
                    error.stock = true;
                    throw error;
                }

                await conn.query(
                    'UPDATE productos SET cantidad_en_almacen = cantidad_en_almacen - ?, cantidad_vendida = cantidad_vendida + ? WHERE id = ?',
                    [item.cantidad, item.cantidad, item.producto_id]
                );
                await conn.query(
                    'INSERT INTO compras (producto_id, cantidad, usuario_id, precio_unitario) VALUES (?, ?, ?, ?)',
                    [item.producto_id, item.cantidad, usuarioId, producto.precio]
                );
            }
        });
    } catch (err) {
        if (err.stock) return volverConMensaje(req, res, err.message);
        throw err;
    }

    req.session.carrito = [];
    volverConMensaje(req, res, '¡Compra realizada con éxito!');
};

module.exports = productosController;
