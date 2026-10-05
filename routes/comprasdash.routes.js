const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/vercompras.Controller.js');
const asyncHandler = require('../utils/asyncHandler');

// Ruta para Mostrar todas las compras
router.get('/', asyncHandler(comprasController.mostrarCompras));

module.exports = router;
