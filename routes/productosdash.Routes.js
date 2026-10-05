const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosdash.Controller.js');
const upload = require('../config/multerConfig.js');
const asyncHandler = require('../utils/asyncHandler');

// Ruta para Mostrar
router.get('/productos', asyncHandler(productosController.mostrar));

// Ruta para Crear
router.post('/productos/add', upload.single('productImage'), asyncHandler(productosController.crear));

// Ruta para Editar
router.post('/productos/edit/:id', upload.single('productImage'), asyncHandler(productosController.editar));

// Ruta para Eliminar
router.delete('/productos/delete/:id', asyncHandler(productosController.eliminar));

module.exports = router;
