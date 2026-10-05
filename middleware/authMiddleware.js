// Las peticiones AJAX (jQuery) reciben JSON en lugar de una redirección o una página HTML
const quiereJson = (req) => req.xhr || (req.get('accept') || '').includes('application/json');

const isAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    if (quiereJson(req)) {
        return res.status(401).json({ success: false, message: 'Debes iniciar sesión.' });
    }
    res.redirect('/inicio/login');
};

const requireRole = (rol) => (req, res, next) => {
    const user = req.session.user;
    if (!user) return isAuthenticated(req, res, next);
    if (Array.isArray(user.roles) && user.roles.includes(rol)) return next();
    if (quiereJson(req)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado.' });
    }
    res.status(403).send('Acceso denegado: no tienes permisos para acceder a esta página.');
};

const isAdmin = requireRole('Admin');

module.exports = { isAuthenticated, requireRole, isAdmin, quiereJson };
