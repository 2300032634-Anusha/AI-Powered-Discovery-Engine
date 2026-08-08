import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'server', '.env'),
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '.env')
];
const foundEnv = envPaths.find(p => fs.existsSync(p));
if (foundEnv) {
  dotenv.config({ path: foundEnv });
} else {
  dotenv.config();
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'discovery_engine_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection on startup
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully to:', process.env.DB_NAME);
    connection.release();
    return true;
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Make sure MySQL is running and credentials in .env are correct.');
    return false;
  }
}

export default pool;
