const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homedash.Controller');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(homeController.getProductos));

module.exports = router;
