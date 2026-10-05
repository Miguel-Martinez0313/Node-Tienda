const mysql = require('mysql2/promise');

// Pool de conexiones: cada petición obtiene su propia conexión y se reconecta sola
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE) || 10,
    decimalNumbers: true // DECIMAL como número (para usar toFixed en las vistas)
});

// Ejecuta `fn` dentro de una transacción y libera siempre la conexión
pool.withTransaction = async (fn) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const result = await fn(conn);
        await conn.commit();
        return result;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

module.exports = pool;
