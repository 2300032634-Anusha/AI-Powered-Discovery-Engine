import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function runMigration() {
  console.log('\n📦 Running Discovery Engine Database Migration...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let connection;
  try {
    // Connect without specifying database first (to create it)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    // Read and execute SQL file
    const sqlPath = join(__dirname, 'init.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    console.log('📄 Executing init.sql migration...');
    await connection.query(sql);

    console.log('✅ Database created and seeded successfully!');

    // Verify by counting rows
    await connection.query('USE discovery_engine_db');
    const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [personas] = await connection.query('SELECT COUNT(*) as count FROM user_personas');
    const [rag] = await connection.query('SELECT COUNT(*) as count FROM rag_knowledge_base');
    const [faiss] = await connection.query('SELECT COUNT(*) as count FROM faiss_index_specs');

    console.log('\n📊 Seed Data Summary:');
    console.log(`   Products:       ${products[0].count} rows`);
    console.log(`   Personas:       ${personas[0].count} rows`);
    console.log(`   RAG Entries:    ${rag[0].count} rows`);
    console.log(`   FAISS Specs:    ${faiss[0].count} rows`);
    console.log('\n✨ Migration complete! You can now start the server.\n');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('   Make sure MySQL is running on', process.env.DB_HOST || 'localhost');
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Check your DB_USER and DB_PASSWORD in server/.env');
    }
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runMigration();
