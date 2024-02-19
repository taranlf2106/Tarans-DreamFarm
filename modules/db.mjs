

// db.mjs
import dotenv from 'dotenv';
import pg from 'pg';

// Make sure to call this as early as possible
dotenv.config();

const { Pool } = pg;

// Create a new pool using the connection details from .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export default pool;


