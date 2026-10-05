const test = require('node:test');
const assert = require('node:assert/strict');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

const crearReq = (user, { xhr = false } = {}) => ({
    session: { user },
    xhr,
    get: () => ''
});

const crearRes = () => {
    const res = { statusCode: 200 };
    res.status = (code) => { res.statusCode = code; return res; };
    res.send = (body) => { res.body = body; return res; };
    res.json = (body) => { res.body = body; return res; };
    res.redirect = (url) => { res.redirectedTo = url; return res; };
    return res;
};

test('isAuthenticated redirige al login sin sesión', () => {
    const res = crearRes();
    let llamado = false;
    isAuthenticated(crearReq(undefined), res, () => { llamado = true; });
    assert.equal(llamado, false);
    assert.equal(res.redirectedTo, '/inicio/login');
});

test('isAuthenticated responde 401 en peticiones AJAX sin sesión', () => {
    const res = crearRes();
    isAuthenticated(crearReq(undefined, { xhr: true }), res, () => {});
    assert.equal(res.statusCode, 401);
});

test('isAdmin permite el paso a administradores', () => {
    let llamado = false;
    isAdmin(crearReq({ id: 1, roles: ['Admin'] }), crearRes(), () => { llamado = true; });
    assert.equal(llamado, true);
});

test('isAdmin bloquea a compradores con 403', () => {
    const res = crearRes();
    let llamado = false;
    isAdmin(crearReq({ id: 2, roles: ['Comprador'] }), res, () => { llamado = true; });
    assert.equal(llamado, false);
    assert.equal(res.statusCode, 403);
});

test('isAdmin redirige al login sin sesión', () => {
    const res = crearRes();
    isAdmin(crearReq(undefined), res, () => {});
    assert.equal(res.redirectedTo, '/inicio/login');
});
