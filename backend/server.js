// backend/server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Farm Routes
app.get('/api/farms/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM farms WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching farm:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/farms/:id', authenticateToken, async (req, res) => {
  try {
    const { name, location, size, owner, phone, email, established, description } = req.body;
    
    const result = await pool.query(
      `UPDATE farms 
       SET name = $1, location = $2, size = $3, owner = $4, phone = $5, 
           email = $6, established = $7, description = $8, updated_at = NOW()
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [name, location, size, owner, phone, email, established, description, req.params.id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    
    res.json({ success: true, farm: result.rows[0] });
  } catch (error) {
    console.error('Error updating farm:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sensor Routes
app.get('/api/sensors', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sensors WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sensors', authenticateToken, async (req, res) => {
  try {
    const { name, location, balesMonitored } = req.body;
    
    const result = await pool.query(
      `INSERT INTO sensors (name, location, bales_monitored, user_id, status, battery_level, created_at)
       VALUES ($1, $2, $3, $4, 'active', 100, NOW())
       RETURNING *`,
      [name, location, balesMonitored, req.user.userId]
    );
    
    res.json({ success: true, sensor: result.rows[0] });
  } catch (error) {
    console.error('Error creating sensor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sensors/:id/data', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT * FROM sensor_readings 
      WHERE sensor_id = $1 
    `;
    let params = [req.params.id];
    
    if (startDate && endDate) {
      query += ` AND reading_time BETWEEN $2 AND $3`;
      params.push(startDate, endDate);
    }
    
    query += ` ORDER BY reading_time DESC LIMIT 100`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Alert Routes
app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    let query = `
      SELECT a.*, s.name as sensor_name, s.location 
      FROM alerts a
      JOIN sensors s ON a.sensor_id = s.id
      WHERE s.user_id = $1
    `;
    let params = [req.user.userId];
    let paramCount = 1;
    
    if (startDate && endDate) {
      paramCount++;
      query += ` AND a.created_at BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(startDate, endDate);
      paramCount++;
    }
    
    if (type) {
      paramCount++;
      query += ` AND a.type = $${paramCount}`;
      params.push(type);
    }
    
    query += ` ORDER BY a.created_at DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard Data Route
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    // Get active sensors count
    const sensorsResult = await pool.query(
      'SELECT COUNT(*) as count FROM sensors WHERE user_id = $1 AND status = $2',
      [req.user.userId, 'active']
    );
    
    // Get total bales
    const balesResult = await pool.query(
      'SELECT SUM(bales_monitored) as total FROM sensors WHERE user_id = $1',
      [req.user.userId]
    );
    
    // Get critical alerts today
    const alertsResult = await pool.query(
      `SELECT COUNT(*) as count FROM alerts a
       JOIN sensors s ON a.sensor_id = s.id
       WHERE s.user_id = $1 AND a.type = 'critical' 
       AND a.created_at >= CURRENT_DATE`,
      [req.user.userId]
    );
    
    // Get average temperature and moisture
    const avgResult = await pool.query(
      `SELECT 
         AVG(temperature) as avg_temperature,
         AVG(moisture) as avg_moisture
       FROM sensor_readings sr
       JOIN sensors s ON sr.sensor_id = s.id
       WHERE s.user_id = $1 
       AND sr.reading_time >= NOW() - INTERVAL '1 day'`,
      [req.user.userId]
    );
    
    res.json({
      activeSensors: parseInt(sensorsResult.rows[0].count),
      totalBales: parseInt(balesResult.rows[0].total) || 0,
      criticalAlerts: parseInt(alertsResult.rows[0].count),
      avgTemperature: parseFloat(avgResult.rows[0].avg_temperature) || 0,
      avgMoisture: parseFloat(avgResult.rows[0].avg_moisture) || 0,
      systemHealth: 98 // This could be calculated based on sensor status
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email Routes
app.post('/api/email/invite', authenticateToken, async (req, res) => {
  try {
    const { email, role } = req.body;
    
    // Generate invite token
    const inviteToken = jwt.sign(
      { email, role, invitedBy: req.user.userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Save invitation to database
    await pool.query(
      'INSERT INTO invitations (email, role, invited_by, token, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [email, role, req.user.userId, inviteToken]
    );
    
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Invitation to join HayGuard',
      html: `
        <h2>You've been invited to join HayGuard</h2>
        <p>Click the link below to accept your invitation:</p>
        <a href="${process.env.FRONTEND_URL}/accept-invitation?token=${inviteToken}">
          Accept Invitation
        </a>
        <p>This invitation expires in 7 days.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

app.post('/api/email/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { userId: result.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Save reset token
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL \'1 hour\' WHERE email = $2',
      [resetToken, email]
    );
    
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset - HayGuard',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error sending password reset:', error);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'HayGuard Backend API is running', status: 'ok' });
});
