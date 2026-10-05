// Funciones de validación: devuelven el valor limpio o null si no es válido

const toInt = (value, { min = -Infinity, max = Infinity } = {}) => {
    if (value === undefined || value === null || String(value).trim() === '') return null;
    const str = String(value).trim();
    if (!/^-?\d+$/.test(str)) return null;
    const n = Number(str);
    return Number.isSafeInteger(n) && n >= min && n <= max ? n : null;
};

const toDecimal = (value, { min = -Infinity, max = Infinity } = {}) => {
    if (value === undefined || value === null || String(value).trim() === '') return null;
    const str = String(value).trim();
    if (!/^-?\d+(\.\d{1,2})?$/.test(str)) return null;
    const n = Number(str);
    return n >= min && n <= max ? n : null;
};

const toText = (value, { min = 1, max = 255 } = {}) => {
    if (typeof value !== 'string') return null;
    const str = value.trim();
    return str.length >= min && str.length <= max ? str : null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const toEmail = (value) => {
    const str = toText(value, { min: 3, max: 50 }); // login.email es VARCHAR(50)
    return str && EMAIL_REGEX.test(str) ? str.toLowerCase() : null;
};

// Acepta el formato de <input type="datetime-local"> ("2024-01-01T10:30") y devuelve
// el formato DATETIME de MySQL ("2024-01-01 10:30:00")
const toDateTime = (value) => {
    if (typeof value !== 'string') return null;
    const m = value.trim().match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(:\d{2})?$/);
    if (!m) return null;
    const result = `${m[1]} ${m[2]}${m[3] || ':00'}`;
    return Number.isNaN(new Date(result.replace(' ', 'T')).getTime()) ? null : result;
};

// Formatea un Date para un <input type="datetime-local"> usando la hora local
// (toISOString() convertía a UTC y desplazaba las fechas en cada edición)
const formatDateTimeLocal = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

module.exports = { toInt, toDecimal, toText, toEmail, toDateTime, formatDateTimeLocal };
