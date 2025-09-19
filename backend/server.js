// HayGuard Backend - Complete Node.js/Express API
// server.js - PRODUCTION READY VERSION

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://hayguard-app.com',
    'https://www.hayguard-app.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'HayGuard API',
    domain: 'hayguard-app.com'
  });
});

// =============================================================================
// DATABASE INITIALIZATION
// =============================================================================

const initializeDatabase = async () => {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Farms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS farms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        coordinates JSONB,
        area VARCHAR(100),
        crops TEXT[],
        established DATE,
        timezone VARCHAR(50) DEFAULT 'UTC',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Farm access table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS farm_access (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
        access_level VARCHAR(20) CHECK (access_level IN ('owner', 'manager', 'viewer')),
        granted_by UUID REFERENCES users(id),
        granted_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, farm_id)
      )
    `);

    // Sensors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sensors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        sensor_type VARCHAR(50) DEFAULT 'environmental',
        device_id VARCHAR(100) UNIQUE,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'warning', 'error', 'offline')),
        last_reading_at TIMESTAMP,
        battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
        calibration_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Sensor readings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sensor_readings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
        temperature DECIMAL(5,2),
        moisture DECIMAL(5,2),
        nitrogen DECIMAL(4,2),
        phosphorus DECIMAL(4,2),
        potassium DECIMAL(4,2),
        ph_level DECIMAL(4,2),
        conductivity INTEGER,
        timestamp TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Alerts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
        sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        message TEXT NOT NULL,
        resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP,
        resolved_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// =============================================================================
// AUTHENTICATION ROUTES
// =============================================================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, farmName } = req.body;

    if (!name || !email || !password || !farmName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create user
      const userResult = await client.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, passwordHash]
      );
      const user = userResult.rows[0];

      // Create farm
      const farmResult = await client.query(
        'INSERT INTO farms (name, owner_id) VALUES ($1, $2) RETURNING id',
        [farmName, user.id]
      );
      const farm = farmResult.rows[0];

      // Grant farm access
      await client.query(
        'INSERT INTO farm_access (user_id, farm_id, access_level) VALUES ($1, $2, $3)',
        [user.id, farm.id, 'owner']
      );

      await client.query('COMMIT');

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, farmId: farm.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: { id: user.id, name: user.name, email: user.email },
        farm: { id: farm.id, name: farmName }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user
    const result = await pool.query(
      'SELECT u.id, u.name, u.email, u.password_hash, f.id as farm_id, f.name as farm_name FROM users u LEFT JOIN farm_access fa ON u.id = fa.user_id LEFT JOIN farms f ON fa.farm_id = f.id WHERE u.email = $1 AND fa.access_level = $2',
      [email, 'owner']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, farmId: user.farm_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      },
      farm: { 
        id: user.farm_id, 
        name: user.farm_name 
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// =============================================================================
// SENSOR ROUTES
// =============================================================================

// Get all sensors for a farm
app.get('/api/sensors', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, sr.temperature, sr.moisture, sr.nitrogen, sr.phosphorus, sr.potassium, sr.timestamp as last_reading
      FROM sensors s
      LEFT JOIN LATERAL (
        SELECT * FROM sensor_readings 
        WHERE sensor_id = s.id 
        ORDER BY timestamp DESC 
        LIMIT 1
      ) sr ON true
      WHERE s.farm_id = $1
      ORDER BY s.created_at DESC
    `, [req.user.farmId]);

    const sensors = result.rows.map(sensor => ({
      id: sensor.id,
      name: sensor.name,
      location: sensor.location,
      status: sensor.status,
      lastUpdate: sensor.last_reading || sensor.updated_at,
      moisture: sensor.moisture || 0,
      temperature: sensor.temperature || 0,
      chemicals: {
        nitrogen: sensor.nitrogen || 0,
        phosphorus: sensor.phosphorus || 0,
        potassium: sensor.potassium || 0
      }
    }));

    res.json({ sensors });
  } catch (error) {
    console.error('Get sensors error:', error);
    res.status(500).json({ error: 'Failed to fetch sensors' });
  }
});

// Add new sensor
app.post('/api/sensors', authenticateToken, async (req, res) => {
  try {
    const { name, location, deviceId } = req.body;

    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location are required' });
    }

    const result = await pool.query(
      'INSERT INTO sensors (farm_id, name, location, device_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.farmId, name, location, deviceId]
    );

    const sensor = result.rows[0];
    res.status(201).json({ sensor });
  } catch (error) {
    console.error('Add sensor error:', error);
    res.status(500).json({ error: 'Failed to add sensor' });
  }
});

// Delete sensor
app.delete('/api/sensors/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM sensors WHERE id = $1 AND farm_id = $2 RETURNING id',
      [id, req.user.farmId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    res.json({ message: 'Sensor deleted successfully' });
  } catch (error) {
    console.error('Delete sensor error:', error);
    res.status(500).json({ error: 'Failed to delete sensor' });
  }
});

// =============================================================================
// SENSOR READINGS ROUTES
// =============================================================================

// Get historical data for charts
app.get('/api/readings/historical', authenticateToken, async (req, res) => {
  try {
    const { sensorId, hours = 24 } = req.query;

    let query = `
      SELECT 
        DATE_TRUNC('hour', timestamp) as time,
        AVG(temperature) as temperature,
        AVG(moisture) as moisture
      FROM sensor_readings sr
      JOIN sensors s ON sr.sensor_id = s.id
      WHERE s.farm_id = $1 
      AND timestamp >= NOW() - INTERVAL '${parseInt(hours)} hours'
    `;
    
    const params = [req.user.farmId];

    if (sensorId) {
      query += ' AND sr.sensor_id = $2';
      params.push(sensorId);
    }

    query += ' GROUP BY DATE_TRUNC(\'hour\', timestamp) ORDER BY time';

    const result = await pool.query(query, params);

    const data = result.rows.map(row => ({
      time: new Date(row.time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      temperature: parseFloat(row.temperature) || 0,
      moisture: parseFloat(row.moisture) || 0
    }));

    res.json({ data });
  } catch (error) {
    console.error('Get historical data error:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Add sensor reading (for IoT devices)
app.post('/api/readings', authenticateToken, async (req, res) => {
  try {
    const { sensorId, temperature, moisture, nitrogen, phosphorus, potassium, phLevel } = req.body;

    const result = await pool.query(
      `INSERT INTO sensor_readings 
       (sensor_id, temperature, moisture, nitrogen, phosphorus, potassium, ph_level) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [sensorId, temperature, moisture, nitrogen, phosphorus, potassium, phLevel]
    );

    // Update sensor last reading timestamp
    await pool.query(
      'UPDATE sensors SET last_reading_at = NOW() WHERE id = $1',
      [sensorId]
    );

    res.status(201).json({ reading: result.rows[0] });
  } catch (error) {
    console.error('Add reading error:', error);
    res.status(500).json({ error: 'Failed to add reading' });
  }
});

// =============================================================================
// FARM ROUTES
// =============================================================================

// Get farm info
app.get('/api/farm', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM farms WHERE id = $1',
      [req.user.farmId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    res.json({ farm: result.rows[0] });
  } catch (error) {
    console.error('Get farm error:', error);
    res.status(500).json({ error: 'Failed to fetch farm info' });
  }
});

// =============================================================================
// ALERTS ROUTES
// =============================================================================

// Get active alerts
app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, s.name as sensor_name
      FROM alerts a
      LEFT JOIN sensors s ON a.sensor_id = s.id
      WHERE a.farm_id = $1 AND a.resolved = false
      ORDER BY a.created_at DESC
    `, [req.user.farmId]);

    res.json({ alerts: result.rows });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`🚀 HayGuard API server running on port ${port}`);
      console.log(`🌐 Health check: http://localhost:${port}/health`);
      console.log(`📊 API endpoints: http://localhost:${port}/api/*`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();