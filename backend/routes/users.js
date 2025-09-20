const express = require('express');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const router = express.Router();

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this is set in your .env
});

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 12);

    // Insert into database
    const result = await pool.query(
      `INSERT INTO users (id, email, password_hash, name, email_verified)
       VALUES (gen_random_uuid(), $1, $2, $3, false)
       RETURNING id, email, name`,
      [email, password_hash, name]
    );

    return res.status(201).json({ message: 'User registered', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

