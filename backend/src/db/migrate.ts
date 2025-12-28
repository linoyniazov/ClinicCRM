import dotenv from 'dotenv';
dotenv.config();

import pool from '../db';

async function run() {
  console.log('Running DB migration...');
  try {
    // Ensure connection works
    await pool.query('SELECT 1');

    // Add medical_info column if not exists
    await pool.query(
      "ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_info JSONB DEFAULT '{}'::jsonb;"
    );

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
