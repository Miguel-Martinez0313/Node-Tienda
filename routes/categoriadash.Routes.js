const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasdash.controller');
const asyncHandler = require('../utils/asyncHandler');

router.get('/categoria', asyncHandler(categoriasController.mostrar));
router.post('/categoria/add', asyncHandler(categoriasController.crear));
router.post('/categoria/edit/:id', asyncHandler(categoriasController.editar));
router.delete('/categoria/delete/:id', asyncHandler(categoriasController.eliminar));

module.exports = router;
