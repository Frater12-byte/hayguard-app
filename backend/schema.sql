-- HayGuard Database Schema
-- Production PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email_verified BOOLEAN DEFAULT FALSE,
    profile_image_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- FARMS TABLE
-- =====================================================
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
);

-- Create index for owner lookups
CREATE INDEX IF NOT EXISTS idx_farms_owner ON farms(owner_id);

-- =====================================================
-- FARM ACCESS PERMISSIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS farm_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    access_level VARCHAR(20) CHECK (access_level IN ('owner', 'manager', 'viewer')),
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    UNIQUE(user_id, farm_id)
);

-- Create indexes for access lookups
CREATE INDEX IF NOT EXISTS idx_farm_access_user ON farm_access(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_access_farm ON farm_access(farm_id);

-- =====================================================
-- SENSORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    coordinates JSONB,
    sensor_type VARCHAR(50) DEFAULT 'environmental',
    device_id VARCHAR(100) UNIQUE,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    firmware_version VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'warning', 'error', 'offline', 'maintenance')),
    last_reading_at TIMESTAMP,
    battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
    signal_strength INTEGER CHECK (signal_strength >= -120 AND signal_strength <= 0),
    calibration_date DATE,
    maintenance_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for sensor lookups
CREATE INDEX IF NOT EXISTS idx_sensors_farm ON sensors(farm_id);
CREATE INDEX IF NOT EXISTS idx_sensors_device ON sensors(device_id);
CREATE INDEX IF NOT EXISTS idx_sensors_status ON sensors(status);

-- =====================================================
-- SENSOR READINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    moisture DECIMAL(5,2),
    nitrogen DECIMAL(6,2),
    phosphorus DECIMAL(6,2),
    potassium DECIMAL(6,2),
    ph_level DECIMAL(4,2),
    conductivity INTEGER,
    organic_matter DECIMAL(5,2),
    rainfall DECIMAL(6,2),
    wind_speed DECIMAL(5,2),
    wind_direction INTEGER,
    atmospheric_pressure DECIMAL(7,2),
    light_intensity INTEGER,
    battery_voltage DECIMAL(4,2),
    timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient time-series queries
CREATE INDEX IF NOT EXISTS idx_readings_sensor_time ON sensor_readings(sensor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON sensor_readings(timestamp DESC);

-- =====================================================
-- ALERTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    threshold_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for alert queries
CREATE INDEX IF NOT EXISTS idx_alerts_farm ON alerts(farm_id);
CREATE INDEX IF NOT EXISTS idx_alerts_sensor ON alerts(sensor_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);

-- =====================================================
-- ALERT RULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    parameter VARCHAR(50) NOT NULL,
    condition VARCHAR(20) NOT NULL,
    threshold_min DECIMAL(10,2),
    threshold_max DECIMAL(10,2),
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    enabled BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for rule evaluation
CREATE INDEX IF NOT EXISTS idx_alert_rules_farm ON alert_rules(farm_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_sensor ON alert_rules(sensor_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules(enabled);

-- =====================================================
-- NOTIFICATION PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_frequency VARCHAR(20) DEFAULT 'immediate',
    severity_threshold VARCHAR(20) DEFAULT 'medium',
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, farm_id)
);

-- =====================================================
-- SYSTEM LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for log queries
CREATE INDEX IF NOT EXISTS idx_logs_farm ON system_logs(farm_id);
CREATE INDEX IF NOT EXISTS idx_logs_user ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created ON system_logs(created_at DESC);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for current sensor status with latest readings
CREATE OR REPLACE VIEW sensor_status AS
SELECT 
    s.*,
    sr.temperature,
    sr.moisture,
    sr.ph_level,
    sr.timestamp as last_reading_time,
    CASE 
        WHEN sr.timestamp < NOW() - INTERVAL '1 hour' THEN 'stale'
        WHEN sr.timestamp IS NULL THEN 'no_data'
        ELSE 'current'
    END as data_freshness
FROM sensors s
LEFT JOIN LATERAL (
    SELECT * FROM sensor_readings 
    WHERE sensor_id = s.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) sr ON true;

-- View for active alerts with sensor info
CREATE OR REPLACE VIEW active_alerts AS
SELECT 
    a.*,
    s.name as sensor_name,
    s.location as sensor_location,
    f.name as farm_name
FROM alerts a
JOIN sensors s ON a.sensor_id = s.id
JOIN farms f ON a.farm_id = f.id
WHERE a.resolved = FALSE
ORDER BY a.created_at DESC;

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply update triggers to relevant tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_farms_updated_at ON farms;
CREATE TRIGGER update_farms_updated_at 
    BEFORE UPDATE ON farms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sensors_updated_at ON sensors;
CREATE TRIGGER update_sensors_updated_at 
    BEFORE UPDATE ON sensors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();