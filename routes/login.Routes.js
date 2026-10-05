const express = require('express');
const { rateLimit } = require('express-rate-limit');
const router = express.Router();
const loginController = require('../controllers/login.controller');
const asyncHandler = require('../utils/asyncHandler');

// Limita los intentos para dificultar ataques de fuerza bruta
const limitarIntentos = (messageType) => rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
        req.session.message = 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
        req.session.messageType = messageType;
        res.redirect('/inicio/login');
    }
});

// Ruta para renderizar la vista de login y registro
router.get('/login', loginController.renderLogin);

// Ruta para procesar el registro de usuario
router.post('/register', limitarIntentos('register'), asyncHandler(loginController.register));

// Ruta para procesar el inicio de sesión
router.post('/auth', limitarIntentos('login'), asyncHandler(loginController.login));

// Ruta para cerrar sesión (POST: un enlace o imagen externa no puede cerrar la sesión)
router.post('/logout', loginController.logout);

module.exports = router;
