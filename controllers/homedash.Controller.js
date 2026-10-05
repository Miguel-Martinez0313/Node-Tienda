const pool = require('../config/db');

const getProductos = async (req, res) => {
  const [productos] = await pool.query(
    'SELECT nombre, cantidad_en_almacen, cantidad_vendida FROM productos ORDER BY cantidad_vendida DESC LIMIT 6'
  );
  const userName = req.session.user ? req.session.user.nombre : 'Invitado';
  res.render('dashboard/home', { productos, userName });
};

module.exports = { getProductos };
