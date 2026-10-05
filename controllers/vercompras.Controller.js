const pool = require('../config/db');

exports.mostrarCompras = async (req, res) => {
    // Se suman las cantidades por usuario y producto. Antes se usaba
    // GROUP_CONCAT(DISTINCT ...), que juntaba compras iguales y se truncaba a 1024 caracteres.
    const [filas] = await pool.query(`
        SELECT
            l.id AS usuario_id,
            l.nombre AS usuario_nombre,
            p.nombre AS producto_nombre,
            SUM(c.cantidad) AS cantidad,
            MAX(c.fecha_compra) AS ultima_compra
        FROM compras c
        JOIN productos p ON c.producto_id = p.id
        JOIN login l ON c.usuario_id = l.id
        GROUP BY l.id, l.nombre, p.id, p.nombre
        ORDER BY l.nombre, p.nombre
    `);

    const porUsuario = new Map();
    for (const fila of filas) {
        if (!porUsuario.has(fila.usuario_id)) {
            porUsuario.set(fila.usuario_id, {
                usuario_id: fila.usuario_id,
                usuario_nombre: fila.usuario_nombre,
                ultima_compra: fila.ultima_compra,
                productos: []
            });
        }
        const usuario = porUsuario.get(fila.usuario_id);
        if (fila.ultima_compra > usuario.ultima_compra) usuario.ultima_compra = fila.ultima_compra;
        usuario.productos.push({ nombre: fila.producto_nombre, cantidad: Number(fila.cantidad) });
    }

    res.render('dashboard/compras', { compras: [...porUsuario.values()] });
};
