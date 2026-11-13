require('dotenv').config();

const pool = require('./config/db');

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');

    console.log('✅ Database connection successful!');
    console.log('🕐 Database server time:', result.rows[0].now);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', error.message);
  } finally {
    await pool.end();
    console.log('🔌 Connection pool closed.');
  }
}

testConnection();
