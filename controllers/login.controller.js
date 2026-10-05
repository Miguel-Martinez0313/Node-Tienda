const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { toText, toEmail } = require('../utils/validators');

const SALT_ROUNDS = 10;
const ROL_POR_DEFECTO = 'Comprador';
// Hash de relleno para que el login tarde lo mismo exista o no el correo
const HASH_FALSO = bcrypt.hashSync('contraseña-inexistente', SALT_ROUNDS);

const redirigirConMensaje = (req, res, message, messageType) => {
    req.session.message = message;
    req.session.messageType = messageType;
    res.redirect('/inicio/login');
};

// Renderizar el formulario de login y registro
exports.renderLogin = (req, res) => {
    const { message = '', messageType = '' } = req.session;
    delete req.session.message;
    delete req.session.messageType;
    res.render('Login/login', { message, messageType });
};

// Procesar el registro de usuario
exports.register = async (req, res) => {
    const nombre = toText(req.body.nombre, { max: 100 });
    const email = toEmail(req.body.email);
    const contra = typeof req.body.contra === 'string' ? req.body.contra : '';

    if (!nombre || !email) {
        return redirigirConMensaje(req, res, 'Nombre o correo electrónico no válidos.', 'register');
    }
    // bcrypt solo usa los primeros 72 bytes
    if (contra.length < 8 || Buffer.byteLength(contra) > 72) {
        return redirigirConMensaje(req, res, 'La contraseña debe tener entre 8 y 72 caracteres.', 'register');
    }

    const hash = await bcrypt.hash(contra, SALT_ROUNDS);

    try {
        // Usuario y rol se crean juntos: si falla uno, no queda nada a medias
        await pool.withTransaction(async (conn) => {
            const [roles] = await conn.query('SELECT id FROM roles WHERE rol_nombre = ?', [ROL_POR_DEFECTO]);
            if (roles.length === 0) throw new Error(`No existe el rol "${ROL_POR_DEFECTO}" en la base de datos`);

            const [result] = await conn.query(
                'INSERT INTO login (nombre, email, contra) VALUES (?, ?, ?)',
                [nombre, email, hash]
            );
            await conn.query(
                'INSERT INTO usuario_roles (usuario_id, rol_id) VALUES (?, ?)',
                [result.insertId, roles[0].id]
            );
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return redirigirConMensaje(req, res, 'El correo electrónico ya está registrado.', 'register');
        }
        throw err;
    }

    redirigirConMensaje(req, res, 'Registro exitoso, por favor inicie sesión.', 'register');
};

// Procesar el inicio de sesión
exports.login = async (req, res, next) => {
    const email = toEmail(req.body.email);
    const contra = typeof req.body.contra === 'string' ? req.body.contra : '';

    const [usuarios] = email
        ? await pool.query('SELECT id, nombre, contra FROM login WHERE email = ?', [email])
        : [[]];
    const user = usuarios[0];
    const match = await bcrypt.compare(contra, user ? user.contra : HASH_FALSO);

    if (!user || !match) {
        return redirigirConMensaje(req, res, 'Credenciales incorrectas.', 'login');
    }

    const [filasRoles] = await pool.query(`
        SELECT roles.rol_nombre
        FROM usuario_roles
        JOIN roles ON usuario_roles.rol_id = roles.id
        WHERE usuario_roles.usuario_id = ?
    `, [user.id]);
    const roles = filasRoles.map((row) => row.rol_nombre);

    // Nueva sesión tras autenticarse para evitar fijación de sesión
    req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.user = { id: user.id, nombre: user.nombre, roles };
        req.session.save((err) => {
            if (err) return next(err);
            res.redirect(roles.includes('Admin') ? '/home' : '/');
        });
    });
};

// Cerrar sesión
exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('tienda.sid');
        res.redirect('/inicio/login');
    });
};
