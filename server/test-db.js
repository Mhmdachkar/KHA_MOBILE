import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

console.log('DATABASE_URL exists:', Boolean(process.env.DATABASE_URL));
console.log('DATABASE_URL (masked):', process.env.DATABASE_URL?.replace(/:[^@]+@/, ':****@'));

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  console.log('\nTesting database connection...');
  const result = await pool.query('SELECT NOW() as time, version() as pg_version');
  console.log('✓ Connection successful!');
  console.log('Time:', result.rows[0].time);
  console.log('PostgreSQL:', result.rows[0].pg_version);
  
  console.log('\nTesting admin_users table...');
  const adminCheck = await pool.query('SELECT COUNT(*) as count FROM admin_users');
  console.log(`✓ admin_users table exists with ${adminCheck.rows[0].count} users`);
  
} catch (error) {
  console.error('\n✗ Database connection failed:');
  console.error('Error code:', error.code);
  console.error('Message:', error.message);
  if (error.code === 'ENOTFOUND') {
    console.error('\n→ DNS lookup failed. Check the database host in DATABASE_URL');
  } else if (error.code === '28P01') {
    console.error('\n→ Authentication failed. Check username/password in DATABASE_URL');
  } else if (error.code === '3D000') {
    console.error('\n→ Database does not exist');
  } else if (error.code === '42P01') {
    console.error('\n→ Table does not exist. Run the SQL migrations in Supabase SQL Editor');
  }
} finally {
  await pool.end();
}
