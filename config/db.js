const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT),
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
});

// Test connection safely
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ MySQL Connected');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
  }
})();

module.exports = db;
