const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const { execSync } = require('child_process');

// Ensure environment variables are loaded without overriding system/platform environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// In local development, ensure local MariaDB service is active if targeting localhost
if (process.env.NODE_ENV !== 'production') {
  try {
    const host = process.env.DB_HOST || 'localhost';
    if (host === 'localhost' || host === '127.0.0.1') {
      execSync('service mariadb status >/dev/null 2>&1 || /etc/init.d/mariadb start >/dev/null 2>&1 || true');
    }
  } catch (e) {
    // Service check fallback
  }
}

/**
 * MySQL Connection Pool configuration using mysql2/promise.
 * Utilizes environment variables to keep credentials secure.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'taskuser',
  password: process.env.DB_PASSWORD || 'taskpassword',
  database: process.env.DB_NAME || 'ai_project_task_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Tests database connectivity safely during server startup.
 * Logs a clear confirmation message without leaking passwords.
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`Database connected successfully (${process.env.DB_NAME || 'ai_project_task_manager'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306})`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
