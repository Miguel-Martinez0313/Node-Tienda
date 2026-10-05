const express = require('express');
const router = express.Router();
const descuentodashController = require('../controllers/descuntodash.Controller');
const asyncHandler = require('../utils/asyncHandler');

// Mostrar todas las ofertas
router.get('/descuentos', asyncHandler(descuentodashController.mostrar));

// Crear una nueva oferta
router.post('/descuentos', asyncHandler(descuentodashController.crear));

// Editar una oferta existente
router.put('/descuentos/:id', asyncHandler(descuentodashController.editar));

// Eliminar una oferta
router.delete('/descuentos/:id', asyncHandler(descuentodashController.eliminar));

module.exports = router;
