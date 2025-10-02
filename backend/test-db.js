require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connected to DB. Current time:', res.rows[0]);
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();

