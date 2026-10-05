const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productos.Controller.js');
const { isAuthenticated } = require('../middleware/authMiddleware.js');
const asyncHandler = require('../utils/asyncHandler');

// Ruta para mostrar los productos disponibles para comprar junto con el carrito
router.get('/comprar', asyncHandler(productoController.mostrarProductos));

// Ruta para agregar un producto al carrito
router.post('/agregar-al-carrito', isAuthenticated, asyncHandler(productoController.agregarAlCarrito));

// Ruta para finalizar la compra
router.post('/finalizar-compra', isAuthenticated, asyncHandler(productoController.finalizarCompra));

module.exports = router;
