const test = require('node:test');
const assert = require('node:assert/strict');
const { toInt, toDecimal, toText, toEmail, toDateTime, formatDateTimeLocal } = require('../utils/validators');

test('toInt acepta enteros dentro del rango', () => {
    assert.equal(toInt('5', { min: 1 }), 5);
    assert.equal(toInt(' 10 ', { min: 1, max: 10 }), 10);
});

test('toInt rechaza negativos, decimales, texto y vacíos', () => {
    assert.equal(toInt('-100', { min: 1 }), null);
    assert.equal(toInt('1.5'), null);
    assert.equal(toInt('abc'), null);
    assert.equal(toInt(''), null);
    assert.equal(toInt(undefined), null);
    assert.equal(toInt('101', { max: 100 }), null);
    assert.equal(toInt(['1', '2']), null);
});

test('toDecimal acepta hasta 2 decimales', () => {
    assert.equal(toDecimal('19.99', { min: 0 }), 19.99);
    assert.equal(toDecimal('20', { min: 0 }), 20);
    assert.equal(toDecimal('1.999'), null);
    assert.equal(toDecimal('-1', { min: 0 }), null);
});

test('toText recorta y valida la longitud', () => {
    assert.equal(toText('  Pan  '), 'Pan');
    assert.equal(toText('   '), null);
    assert.equal(toText('', { min: 0 }), '');
    assert.equal(toText('a'.repeat(101), { max: 100 }), null);
    assert.equal(toText({ nombre: 'x' }), null);
});

test('toEmail normaliza y valida', () => {
    assert.equal(toEmail(' Juan@Example.com '), 'juan@example.com');
    assert.equal(toEmail('no-es-un-correo'), null);
    assert.equal(toEmail(`${'a'.repeat(45)}@b.com`), null);
});

test('toDateTime convierte el formato de datetime-local', () => {
    assert.equal(toDateTime('2024-01-31T10:30'), '2024-01-31 10:30:00');
    assert.equal(toDateTime('2024-01-31 10:30:15'), '2024-01-31 10:30:15');
    assert.equal(toDateTime('31/01/2024'), null);
    assert.equal(toDateTime('2024-13-45T10:30'), null);
});

test('formatDateTimeLocal usa la hora local (no UTC)', () => {
    const fecha = new Date(2024, 0, 31, 23, 45);
    assert.equal(formatDateTimeLocal(fecha), '2024-01-31T23:45');
    assert.equal(formatDateTimeLocal(null), null);
});
