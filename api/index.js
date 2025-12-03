/* eslint-env node */
import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const app = express();
app.use(express.json());

// Database Connection Pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  // ⚠️ CRITICAL: Vercel/Cloud Postgres requires SSL
  // This configuration works for both local dev (connecting to cloud) and production
  ssl: {
    rejectUnauthorized: false 
  }
});

// Test Route
app.get('/api/test', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release(); // Always release the client!
    res.json({ time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: err.message 
    });
  }
});

// Export the app for Vercel Serverless
export default app;