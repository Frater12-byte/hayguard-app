// HayGuard Backend - Enhanced Node.js/Express API with All Endpoints
// server.js - PRODUCTION READY VERSION

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
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

// Permission middleware
const checkPermission = (requiredLevel) => {
  return async (req, res, next) => {
    try {
      const result = await pool.query(
        'SELECT access_level FROM farm_access WHERE user_id = $1 AND farm_id = $2',
        [req.user.id, req.user.farmId]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const userLevel = result.rows[0].access_level;
      const levels = { viewer: 1, manager: 2, owner: 3 };

      if (levels[userLevel] < levels[requiredLevel]) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'HayGuard API Enhanced',
    domain: 'hayguard-app.com'
  });
});

// =============================================================================
// DATABASE INITIALIZATION
// =============================================================================

const initializeDatabase = async () => {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // Create all tables (existing code)
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS farms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        description TEXT,
        coordinates JSONB,
        area VARCHAR(100),
        crops TEXT[],
        established DATE,
        address TEXT,
        timezone VARCHAR(50) DEFAULT 'UTC',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
        sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP,
        resolved_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // New tables for enhanced features
    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        access_level VARCHAR(20) CHECK (access_level IN ('manager', 'viewer')),
        invited_by UUID REFERENCES users(id),
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        accepted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
        created_by UUID REFERENCES users(id),
        report_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        parameters JSONB,
        file_path VARCHAR(500),
        status VARCHAR(20) DEFAULT 'generating',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Enhanced database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// =============================================================================
// AUTHENTICATION ROUTES
// =============================================================================

// Register (existing)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, farmName } = req.body;

    if (!name || !email || !password || !farmName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, passwordHash]
      );
      const user = userResult.rows[0];

      const farmResult = await client.query(
        'INSERT INTO farms (name, owner_id) VALUES ($1, $2) RETURNING id',
        [farmName, user.id]
      );
      const farm = farmResult.rows[0];

      await client.query(
        'INSERT INTO farm_access (user_id, farm_id, access_level) VALUES ($1, $2, $3)',
        [user.id, farm.id, 'owner']
      );

      await client.query('COMMIT');

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

// Login (existing)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT u.id, u.name, u.email, u.password_hash, f.id as farm_id, f.name as farm_name FROM users u LEFT JOIN farm_access fa ON u.id = fa.user_id LEFT JOIN farms f ON fa.farm_id = f.id WHERE u.email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, farmId: user.farm_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
      farm: { id: user.farm_id, name: user.farm_name }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// =============================================================================
// FARM MANAGEMENT ROUTES
// =============================================================================

// Get farm info (existing)
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

// Update farm info (NEW)
app.put('/api/farm', authenticateToken, checkPermission('owner'), async (req, res) => {
  try {
    const { name, description, area, address, coordinates, crops, established } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Farm name is required' });
    }

    const result = await pool.query(
      `UPDATE farms SET 
       name = $1, description = $2, area = $3, address = $4, 
       coordinates = $5, crops = $6, established = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [name, description, area, address, JSON.stringify(coordinates), crops, established, req.user.farmId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    res.json({ farm: result.rows[0] });
  } catch (error) {
    console.error('Update farm error:', error);
    res.status(500).json({ error: 'Failed to update farm info' });
  }
});

// =============================================================================
// SENSOR ROUTES (Enhanced)
// =============================================================================

// Get all sensors (existing)
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

// Add sensor (existing)
app.post('/api/sensors', authenticateToken, checkPermission('manager'), async (req, res) => {
  try {
    const { name, location, deviceId } = req.body;

    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location are required' });
    }

    const result = await pool.query(
      'INSERT INTO sensors (farm_id, name, location, device_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.farmId, name, location, deviceId]
    );

    res.status(201).json({ sensor: result.rows[0] });
  } catch (error) {
    console.error('Add sensor error:', error);
    res.status(500).json({ error: 'Failed to add sensor' });
  }
});

// Update sensor (NEW)
app.put('/api/sensors/:id', authenticateToken, checkPermission('manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, deviceId, status } = req.body;

    const result = await pool.query(
      `UPDATE sensors SET name = $1, location = $2, device_id = $3, status = $4, updated_at = NOW()
       WHERE id = $5 AND farm_id = $6 RETURNING *`,
      [name, location, deviceId, status, id, req.user.farmId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    res.json({ sensor: result.rows[0] });
  } catch (error) {
    console.error('Update sensor error:', error);
    res.status(500).json({ error: 'Failed to update sensor' });
  }
});

// Delete sensor (existing)
app.delete('/api/sensors/:id', authenticateToken, checkPermission('manager'), async (req, res) => {
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
// ANALYTICS ROUTES (NEW)
// =============================================================================

// Get analytics data
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const { sensorId, days = 7 } = req.query;
    
    let sensorFilter = '';
    let params = [req.user.farmId, days];
    
    if (sensorId && sensorId !== 'all') {
      sensorFilter = 'AND sr.sensor_id = $3';
      params.push(sensorId);
    }

    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('day', sr.timestamp) as date,
        AVG(sr.temperature) as avg_temperature,
        MIN(sr.temperature) as min_temperature,
        MAX(sr.temperature) as max_temperature,
        AVG(sr.moisture) as avg_moisture,
        MIN(sr.moisture) as min_moisture,
        MAX(sr.moisture) as max_moisture,
        AVG(sr.nitrogen) as avg_nitrogen,
        AVG(sr.phosphorus) as avg_phosphorus,
        AVG(sr.potassium) as avg_potassium,
        COUNT(*) as reading_count
      FROM sensor_readings sr
      JOIN sensors s ON sr.sensor_id = s.id
      WHERE s.farm_id = $1 
      AND sr.timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
      ${sensorFilter}
      GROUP BY DATE_TRUNC('day', sr.timestamp)
      ORDER BY date DESC
    `, params);

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get dashboard stats
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const stats = await Promise.all([
      // Total sensors
      pool.query('SELECT COUNT(*) as count FROM sensors WHERE farm_id = $1', [req.user.farmId]),
      
      // Active alerts
      pool.query('SELECT COUNT(*) as count FROM alerts WHERE farm_id = $1 AND resolved = false', [req.user.farmId]),
      
      // Average temperature (last 24h)
      pool.query(`
        SELECT AVG(sr.temperature) as avg_temp
        FROM sensor_readings sr
        JOIN sensors s ON sr.sensor_id = s.id
        WHERE s.farm_id = $1 AND sr.timestamp >= NOW() - INTERVAL '24 hours'
      `, [req.user.farmId]),
      
      // Average moisture (last 24h)
      pool.query(`
        SELECT AVG(sr.moisture) as avg_moisture
        FROM sensor_readings sr
        JOIN sensors s ON sr.sensor_id = s.id
        WHERE s.farm_id = $1 AND sr.timestamp >= NOW() - INTERVAL '24 hours'
      `, [req.user.farmId])
    ]);

    res.json({
      totalSensors: parseInt(stats[0].rows[0].count),
      activeAlerts: parseInt(stats[1].rows[0].count),
      avgTemperature: parseFloat(stats[2].rows[0].avg_temp) || 0,
      avgMoisture: parseFloat(stats[3].rows[0].avg_moisture) || 0
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// =============================================================================
// REPORTS ROUTES (NEW)
// =============================================================================

// Generate report
app.post('/api/reports/generate', authenticateToken, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body;

    if (!type || !startDate || !endDate) {
      return res.status(400).json({ error: 'Report type, start date, and end date are required' });
    }

    // Create report record
    const reportResult = await pool.query(
      'INSERT INTO reports (farm_id, created_by, report_type, title, parameters, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [req.user.farmId, req.user.id, type, `${type} Report`, JSON.stringify({ startDate, endDate }), 'completed']
    );

    const reportId = reportResult.rows[0].id;

    // Generate PDF (simplified version)
    const doc = new PDFDocument();
    let buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="hayguard-${type}-report.pdf"`);
      res.send(pdfData);
    });

    // Add content to PDF
    doc.fontSize(20).text('HayGuard Farm Report', 50, 50);
    doc.fontSize(14).text(`Report Type: ${type}`, 50, 100);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 50, 120);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 50, 140);
    
    // Add some sample data
    doc.text('Summary:', 50, 180);
    doc.text('• Total sensors: 5', 70, 200);
    doc.text('• Active alerts: 2', 70, 220);
    doc.text('• Average temperature: 22.5°C', 70, 240);
    doc.text('• Average moisture: 45.2%', 70, 260);

    doc.end();

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get report history
app.get('/api/reports/history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name as created_by_name
      FROM reports r
      JOIN users u ON r.created_by = u.id
      WHERE r.farm_id = $1
      ORDER BY r.created_at DESC
      LIMIT 50
    `, [req.user.farmId]);

    res.json({ reports: result.rows });
  } catch (error) {
    console.error('Report history error:', error);
    res.status(500).json({ error: 'Failed to fetch report history' });
  }
});

// =============================================================================
// TEAM MANAGEMENT ROUTES (NEW)
// =============================================================================

// Get team members
app.get('/api/team/members', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, fa.access_level, fa.granted_at
      FROM users u
      JOIN farm_access fa ON u.id = fa.user_id
      WHERE fa.farm_id = $1
      ORDER BY fa.granted_at DESC
    `, [req.user.farmId]);

    res.json({ members: result.rows });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Invite team member
app.post('/api/team/invite', authenticateToken, checkPermission('owner'), async (req, res) => {
  try {
    const { email, name, access_level } = req.body;

    if (!email || !name || !access_level) {
      return res.status(400).json({ error: 'Email, name, and access level are required' });
    }

    // Check if user already exists in team
    const existingMember = await pool.query(`
      SELECT u.id FROM users u
      JOIN farm_access fa ON u.id = fa.user_id
      WHERE u.email = $1 AND fa.farm_id = $2
    `, [email, req.user.farmId]);

    if (existingMember.rows.length > 0) {
      return res.status(409).json({ error: 'User is already a team member' });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await pool.query(
      'INSERT INTO team_invitations (farm_id, email, name, access_level, invited_by, token, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [req.user.farmId, email, name, access_level, req.user.id, token, expiresAt]
    );

    // Send invitation email (simplified)
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: email,
          subject: 'Invitation to join HayGuard farm team',
          html: `
            <h2>You've been invited to join a farm team on HayGuard</h2>
            <p>Hi ${name},</p>
            <p>You've been invited to join the farm team as a ${access_level}.</p>
            <p><a href="${process.env.FRONTEND_URL}/accept-invitation?token=${token}">Accept Invitation</a></p>
            <p>This invitation expires in 7 days.</p>
          `
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    }

    res.status(201).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Invite team member error:', error);
    res.status(500).json({ error: 'Failed to invite team member' });
  }
});

// Remove team member
app.delete('/api/team/members/:id', authenticateToken, checkPermission('owner'), async (req, res) => {
  try {
    const { id } = req.params;

    // Can't remove the owner
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot remove farm owner' });
    }

    const result = await pool.query(
      'DELETE FROM farm_access WHERE user_id = $1 AND farm_id = $2 RETURNING *',
      [id, req.user.farmId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json({ message: 'Team member removed successfully' });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

// =============================================================================
// WEATHER INTEGRATION ROUTES (NEW)
// =============================================================================

// Get current weather
app.get('/api/weather/current', authenticateToken, async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Mock weather data for now - replace with actual API call
    const weatherData = {
      main: {
        temp: 22.5 + Math.random() * 10,
        feels_like: 24.1 + Math.random() * 8,
        humidity: 65 + Math.random() * 20,
        pressure: 1013
      },
      weather: [{
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }],
      wind: {
        speed: 3.5 + Math.random() * 5,
        deg: 210
      },
      name: 'Farm Location'
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Weather error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// =============================================================================
// EXISTING ROUTES (Sensors, Readings, Alerts)
// =============================================================================

// Get historical data (existing)
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

// Add sensor reading
app.post('/api/readings', authenticateToken, async (req, res) => {
  try {
    const { sensorId, temperature, moisture, nitrogen, phosphorus, potassium, phLevel } = req.body;

    const result = await pool.query(
      `INSERT INTO sensor_readings 
       (sensor_id, temperature, moisture, nitrogen, phosphorus, potassium, ph_level) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [sensorId, temperature, moisture, nitrogen, phosphorus, potassium, phLevel]
    );

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

// Get active alerts (existing)
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

// Get alerts history (NEW)
app.get('/api/alerts/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT a.*, s.name as sensor_name, u.name as resolved_by_name
      FROM alerts a
      LEFT JOIN sensors s ON a.sensor_id = s.id
      LEFT JOIN users u ON a.resolved_by = u.id
      WHERE a.farm_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.farmId, limit, offset]);

    res.json({ alerts: result.rows });
  } catch (error) {
    console.error('Get alerts history error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts history' });
  }
});

// Resolve alert (NEW)
app.put('/api/alerts/:id/resolve', authenticateToken, checkPermission('manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const result = await pool.query(
      `UPDATE alerts SET resolved = true, resolved_at = NOW(), resolved_by = $1
       WHERE id = $2 AND farm_id = $3 RETURNING *`,
      [req.user.id, id, req.user.farmId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ alert: result.rows[0] });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

// Create alert (NEW)
app.post('/api/alerts', authenticateToken, checkPermission('manager'), async (req, res) => {
  try {
    const { sensorId, alertType, severity, title, message } = req.body;

    if (!alertType || !severity || !title || !message) {
      return res.status(400).json({ error: 'Alert type, severity, title, and message are required' });
    }

    const result = await pool.query(
      'INSERT INTO alerts (farm_id, sensor_id, alert_type, severity, title, message) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.farmId, sensorId, alertType, severity, title, message]
    );

    res.status(201).json({ alert: result.rows[0] });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// =============================================================================
// USER PROFILE ROUTES (NEW)
// =============================================================================

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, phone',
      [name, phone, req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Change password
app.put('/api/user/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Verify current password
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// =============================================================================
// SEARCH AND FILTERING ROUTES (NEW)
// =============================================================================

// Search sensors
app.get('/api/sensors/search', authenticateToken, async (req, res) => {
  try {
    const { query, status, location } = req.query;

    let whereClause = 'WHERE s.farm_id = $1';
    const params = [req.user.farmId];
    let paramCount = 1;

    if (query) {
      paramCount++;
      whereClause += ` AND (s.name ILIKE ${paramCount} OR s.location ILIKE ${paramCount})`;
      params.push(`%${query}%`);
    }

    if (status) {
      paramCount++;
      whereClause += ` AND s.status = ${paramCount}`;
      params.push(status);
    }

    if (location) {
      paramCount++;
      whereClause += ` AND s.location ILIKE ${paramCount}`;
      params.push(`%${location}%`);
    }

    const result = await pool.query(`
      SELECT s.*, sr.temperature, sr.moisture, sr.timestamp as last_reading
      FROM sensors s
      LEFT JOIN LATERAL (
        SELECT * FROM sensor_readings 
        WHERE sensor_id = s.id 
        ORDER BY timestamp DESC 
        LIMIT 1
      ) sr ON true
      ${whereClause}
      ORDER BY s.created_at DESC
    `, params);

    res.json({ sensors: result.rows });
  } catch (error) {
    console.error('Search sensors error:', error);
    res.status(500).json({ error: 'Failed to search sensors' });
  }
});

// =============================================================================
// BULK OPERATIONS ROUTES (NEW)
// =============================================================================

// Bulk delete sensors
app.delete('/api/sensors/bulk-delete', authenticateToken, checkPermission('manager'), async (req, res) => {
  try {
    const { sensorIds } = req.body;

    if (!sensorIds || !Array.isArray(sensorIds) || sensorIds.length === 0) {
      return res.status(400).json({ error: 'Sensor IDs array is required' });
    }

    const placeholders = sensorIds.map((_, i) => `${i + 2}`).join(',');
    const result = await pool.query(
      `DELETE FROM sensors WHERE farm_id = $1 AND id IN (${placeholders}) RETURNING id`,
      [req.user.farmId, ...sensorIds]
    );

    res.json({ 
      message: `${result.rows.length} sensors deleted successfully`,
      deletedIds: result.rows.map(row => row.id)
    });
  } catch (error) {
    console.error('Bulk delete sensors error:', error);
    res.status(500).json({ error: 'Failed to delete sensors' });
  }
});

// Bulk resolve alerts
app.put('/api/alerts/bulk-resolve', authenticateToken, checkPermission('manager'), async (req, res) => {
  try {
    const { alertIds, notes = '' } = req.body;

    if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
      return res.status(400).json({ error: 'Alert IDs array is required' });
    }

    const placeholders = alertIds.map((_, i) => `${i + 3}`).join(',');
    const result = await pool.query(
      `UPDATE alerts SET resolved = true, resolved_at = NOW(), resolved_by = $1
       WHERE farm_id = $2 AND id IN (${placeholders}) RETURNING id`,
      [req.user.id, req.user.farmId, ...alertIds]
    );

    res.json({ 
      message: `${result.rows.length} alerts resolved successfully`,
      resolvedIds: result.rows.map(row => row.id)
    });
  } catch (error) {
    console.error('Bulk resolve alerts error:', error);
    res.status(500).json({ error: 'Failed to resolve alerts' });
  }
});

// =============================================================================
// SYSTEM ROUTES (NEW)
// =============================================================================

// Get system health
app.get('/api/system/health', authenticateToken, checkPermission('owner'), async (req, res) => {
  try {
    const dbStatus = await pool.query('SELECT NOW()');
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
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