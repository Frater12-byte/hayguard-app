require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'hayguard-secret-key-2024';

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://hayguard-app.com',
    'https://www.hayguard-app.com'
  ],
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// =============================================================================
// HEALTH & INFO ENDPOINTS
// =============================================================================

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'HayGuard API Enhanced',
      version: '2.1.0'
    });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

app.get('/api', (req, res) => {
  res.json({
    service: 'HayGuard Enhanced API',
    version: '2.1.0',
    features: ['Analytics', 'Reports', 'Team Management', 'Weather Integration'],
    endpoints: {
      auth: '/api/auth/*',
      users: '/api/users/*',
      farms: '/api/farms/*',
      sensors: '/api/sensors/*',
      analytics: '/api/analytics/*',
      reports: '/api/reports/*',
      weather: '/api/weather/*',
      team: '/api/team/*'
    }
  });
});

// =============================================================================
// AUTHENTICATION ENDPOINTS
// =============================================================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await pool.query(
      'INSERT INTO users (email, name, password_hash, email_verified) VALUES ($1, $2, $3, $4) RETURNING id, email, name, created_at',
      [email, name, hashedPassword, false]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT id, email, name, password_hash FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// =============================================================================
// USER ENDPOINTS
// =============================================================================

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT 20');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, phone, email_verified, timezone, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, timezone } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2, timezone = $3, updated_at = NOW() WHERE id = $4 RETURNING id, email, name, phone, timezone',
      [name, phone, timezone, req.user.userId]
    );

    res.json({ message: 'Profile updated successfully', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// =============================================================================
// FARM ENDPOINTS
// =============================================================================

app.get('/api/farms', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, 
        (SELECT COUNT(*) FROM sensors WHERE farm_id = f.id) as sensor_count,
        (SELECT COUNT(*) FROM alerts WHERE farm_id = f.id AND status = 'active') as active_alerts
      FROM farms f 
      WHERE f.owner_id = $1 
      ORDER BY f.created_at DESC
    `, [req.user.userId]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch farms' });
  }
});

app.post('/api/farms', authenticateToken, async (req, res) => {
  try {
    const { name, description, coordinates, area, crops, address } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Farm name is required' });
    }

    const result = await pool.query(
      'INSERT INTO farms (name, owner_id, description, coordinates, area, crops, address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, req.user.userId, description, coordinates, area, crops, address]
    );

    res.status(201).json({
      message: 'Farm created successfully',
      farm: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create farm' });
  }
});

app.get('/api/farms/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM farms WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch farm' });
  }
});

app.put('/api/farms/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, coordinates, area, crops, address } = req.body;

    const result = await pool.query(
      'UPDATE farms SET name = $1, description = $2, coordinates = $3, area = $4, crops = $5, address = $6, updated_at = NOW() WHERE id = $7 AND owner_id = $8 RETURNING *',
      [name, description, coordinates, area, crops, address, req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    res.json({ message: 'Farm updated successfully', farm: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update farm' });
  }
});

app.delete('/api/farms/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM farms WHERE id = $1 AND owner_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    res.json({ message: 'Farm deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete farm' });
  }
});

// =============================================================================
// SENSOR ENDPOINTS
// =============================================================================

app.get('/api/farms/:farmId/sensors', authenticateToken, async (req, res) => {
  try {
    const farmCheck = await pool.query('SELECT id FROM farms WHERE id = $1 AND owner_id = $2', [req.params.farmId, req.user.userId]);
    if (farmCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this farm' });
    }

    const result = await pool.query(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM sensor_readings WHERE sensor_id = s.id AND recorded_at >= NOW() - INTERVAL '24 hours') as readings_24h,
        (SELECT value FROM sensor_readings WHERE sensor_id = s.id ORDER BY recorded_at DESC LIMIT 1) as last_reading
      FROM sensors s 
      WHERE s.farm_id = $1 
      ORDER BY s.created_at DESC
    `, [req.params.farmId]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensors' });
  }
});

app.post('/api/farms/:farmId/sensors', authenticateToken, async (req, res) => {
  try {
    const { name, type, location, configuration } = req.body;

    const farmCheck = await pool.query('SELECT id FROM farms WHERE id = $1 AND owner_id = $2', [req.params.farmId, req.user.userId]);
    if (farmCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this farm' });
    }

    if (!name || !type) {
      return res.status(400).json({ error: 'Sensor name and type are required' });
    }

    const result = await pool.query(
      'INSERT INTO sensors (farm_id, name, type, location, configuration) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.params.farmId, name, type, location, configuration]
    );

    res.status(201).json({
      message: 'Sensor added successfully',
      sensor: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add sensor' });
  }
});

app.get('/api/sensors/:id/readings', authenticateToken, async (req, res) => {
  try {
    const { limit = 100, hours = 24 } = req.query;

    const accessCheck = await pool.query(`
      SELECT s.id FROM sensors s 
      JOIN farms f ON s.farm_id = f.id 
      WHERE s.id = $1 AND f.owner_id = $2
    `, [req.params.id, req.user.userId]);

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this sensor' });
    }

    const result = await pool.query(`
      SELECT * FROM sensor_readings 
      WHERE sensor_id = $1 AND recorded_at >= NOW() - INTERVAL '${hours} hours' 
      ORDER BY recorded_at DESC LIMIT $2
    `, [req.params.id, limit]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensor readings' });
  }
});

app.post('/api/sensors/:id/readings', async (req, res) => {
  try {
    const { value, unit, metadata } = req.body;

    const sensorCheck = await pool.query('SELECT id FROM sensors WHERE id = $1', [req.params.id]);
    if (sensorCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'Sensor value is required' });
    }

    const result = await pool.query(
      'INSERT INTO sensor_readings (sensor_id, value, unit, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, value, unit, metadata]
    );

    res.status(201).json({
      message: 'Sensor reading recorded successfully',
      reading: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record sensor reading' });
  }
});

// =============================================================================
// ANALYTICS ENDPOINTS
// =============================================================================

app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const [farms, sensors, alerts, readings] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM farms WHERE owner_id = $1', [req.user.userId]),
      pool.query('SELECT COUNT(*) FROM sensors s JOIN farms f ON s.farm_id = f.id WHERE f.owner_id = $1', [req.user.userId]),
      pool.query('SELECT COUNT(*) FROM alerts a JOIN farms f ON a.farm_id = f.id WHERE f.owner_id = $1 AND a.status = \'active\'', [req.user.userId]),
      pool.query('SELECT COUNT(*) FROM sensor_readings sr JOIN sensors s ON sr.sensor_id = s.id JOIN farms f ON s.farm_id = f.id WHERE f.owner_id = $1 AND sr.recorded_at >= NOW() - INTERVAL \'24 hours\'', [req.user.userId])
    ]);

    const trendsData = await pool.query(`
      SELECT 
        DATE(sr.recorded_at) as date,
        AVG(sr.value) as avg_value,
        s.type as sensor_type
      FROM sensor_readings sr
      JOIN sensors s ON sr.sensor_id = s.id
      JOIN farms f ON s.farm_id = f.id
      WHERE f.owner_id = $1 AND sr.recorded_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(sr.recorded_at), s.type
      ORDER BY date DESC
    `, [req.user.userId]);

    res.json({
      summary: {
        totalFarms: parseInt(farms.rows[0].count),
        totalSensors: parseInt(sensors.rows[0].count),
        activeAlerts: parseInt(alerts.rows[0].count),
        readingsToday: parseInt(readings.rows[0].count)
      },
      trends: trendsData.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// =============================================================================
// REPORTS ENDPOINTS
// =============================================================================

app.get('/api/reports', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

app.post('/api/reports/generate', authenticateToken, async (req, res) => {
  try {
    const { type, farmId, dateRange } = req.body;

    // Generate report data based on type
    let reportData = {};
    if (type === 'farm-summary') {
      const farmData = await pool.query(
        'SELECT * FROM farms WHERE id = $1 AND owner_id = $2',
        [farmId, req.user.userId]
      );
      reportData = farmData.rows[0];
    }

    const result = await pool.query(
      'INSERT INTO reports (user_id, type, title, data, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.userId, type, `${type} Report`, reportData, 'completed']
    );

    res.status(201).json({
      message: 'Report generated successfully',
      report: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// =============================================================================
// WEATHER ENDPOINTS
// =============================================================================

app.get('/api/weather/:farmId', authenticateToken, async (req, res) => {
  try {
    const farmCheck = await pool.query(
      'SELECT coordinates FROM farms WHERE id = $1 AND owner_id = $2',
      [req.params.farmId, req.user.userId]
    );

    if (farmCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Mock weather data - in production, integrate with weather API
    const weatherData = {
      current: {
        temperature: 22,
        humidity: 65,
        windSpeed: 12,
        condition: 'partly_cloudy'
      },
      forecast: [
        { date: '2025-09-21', high: 25, low: 18, condition: 'sunny' },
        { date: '2025-09-22', high: 23, low: 17, condition: 'cloudy' },
        { date: '2025-09-23', high: 20, low: 15, condition: 'rainy' }
      ]
    };

    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// =============================================================================
// TEAM MANAGEMENT ENDPOINTS
// =============================================================================

app.get('/api/team/invitations', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM team_invitations WHERE invited_by = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team invitations' });
  }
});

app.post('/api/team/invite', authenticateToken, async (req, res) => {
  try {
    const { email, role, farmIds } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    const result = await pool.query(
      'INSERT INTO team_invitations (email, role, farm_ids, invited_by, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email, role, farmIds, req.user.userId, 'pending']
    );

    // Send invitation email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'HayGuard Team Invitation',
        text: `You've been invited to join a HayGuard team as ${role}.`
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
    }

    res.status(201).json({
      message: 'Team invitation sent successfully',
      invitation: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send team invitation' });
  }
});

// =============================================================================
// ALERTS ENDPOINTS
// =============================================================================

app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, f.name as farm_name, s.name as sensor_name
      FROM alerts a
      JOIN farms f ON a.farm_id = f.id
      LEFT JOIN sensors s ON a.sensor_id = s.id
      WHERE f.owner_id = $1
      ORDER BY a.created_at DESC
      LIMIT 50
    `, [req.user.userId]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

app.post('/api/alerts/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const { resolution_notes } = req.body;

    const result = await pool.query(`
      UPDATE alerts SET 
        status = 'resolved', 
        resolved_at = NOW(), 
        resolution_notes = $1
      WHERE id = $2 
      AND farm_id IN (SELECT id FROM farms WHERE owner_id = $3)
      RETURNING *
    `, [resolution_notes, req.params.id, req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({
      message: 'Alert resolved successfully',
      alert: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

const startServer = async () => {
  try {
    console.log('Starting HayGuard Enhanced API server...');
    await pool.query('SELECT NOW()');
    console.log('✅ Enhanced database initialized successfully');
    
    app.listen(port, () => {
      console.log(`🚀 HayGuard Enhanced API server running on port ${port}`);
      console.log(`🌐 Health check: http://localhost:${port}/health`);
      console.log(`📊 API endpoints: http://localhost:${port}/api/*`);
      console.log(`✨ Enhanced features: Analytics, Reports, Team Management, Weather`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();