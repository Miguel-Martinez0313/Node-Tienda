const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno antes de cualquier otro módulo que las use
dotenv.config();

const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const { isAdmin } = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  console.error('Falta SESSION_SECRET en el .env (mínimo 32 caracteres). Revisa .env.example.');
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === 'production';
const app = express();

// Configuración del motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

if (isProduction) {
  // Necesario para cookies "secure" detrás de un proxy (Nginx, Heroku, etc.)
  app.set('trust proxy', 1);
}

// Cabeceras de seguridad. La CSP queda desactivada porque las vistas usan
// scripts inline y varios CDN; activarla requiere mover esos scripts a archivos.
app.use(helmet({ contentSecurityPolicy: false }));

// Configuración de sesión
app.use(session({
  name: 'tienda.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 60 * 1000, // 1 hora
    httpOnly: true,
    sameSite: 'lax', // Bloquea el envío de la cookie en POST desde otros sitios (CSRF)
    secure: isProduction
  }
}));

// Middleware para parsear formularios
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Datos disponibles en todas las vistas
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Rutas públicas
app.use('/', require('./routes/index.Routes'));
app.use('/productos', require('./routes/productos.Routes'));
app.use('/nosotros', require('./routes/nosotros.Routes'));
app.use('/descuentos', require('./routes/decuento.Routes'));

// Login
app.use('/inicio', require('./routes/login.Routes'));

// Rutas del panel de administración: requieren sesión y rol Admin
app.use('/home', isAdmin, require('./routes/homedash.Routes'));
app.use('/almacen', isAdmin, require('./routes/productosdash.Routes'));
app.use('/compras', isAdmin, require('./routes/comprasdash.routes'));
app.use('/lista', isAdmin, require('./routes/categoriadash.Routes'));
app.use('/ofertas', isAdmin, require('./routes/descuentosdash.Routes'));

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).sendFile('status.html', { root: path.join(__dirname, 'public/html/') });
});

// Manejo centralizado de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
