-- Database schema for HayGuard application
-- PostgreSQL

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(500),
    role VARCHAR(50) DEFAULT 'user',
    reset_token VARCHAR(500),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Farms table
CREATE TABLE farms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    size VARCHAR(100),
    owner VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    established VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sensors table
CREATE TABLE sensors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    sensor_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    temperature DECIMAL(5,2),
    moisture DECIMAL(5,2),
    battery_level INTEGER DEFAULT 100,
    bales_monitored INTEGER DEFAULT 0,
    last_reading TIMESTAMP,
    install_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sensor readings table
CREATE TABLE sensor_readings (
    id SERIAL PRIMARY KEY,
    sensor_id INTEGER REFERENCES sensors(id) ON DELETE CASCADE,
    temperature DECIMAL(5,2) NOT NULL,
    moisture DECIMAL(5,2) NOT NULL,
    battery_level INTEGER,
    reading_time TIMESTAMP DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    sensor_id INTEGER REFERENCES sensors(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Team invitations table
CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    invited_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP
);

-- Insert demo user
INSERT INTO users (name, email, password_hash, profile_picture) VALUES 
('Demo User', 'hello@hayguard-app.com', '$2a$10$Iih1p.uKF6QvAn3M2SzlMOLzNWeOs8sqiHcNReRHr1WFyV7Ujgteq', '/default-avatar.png');

-- Insert demo farm
INSERT INTO farms (user_id, name, location, size, owner, phone, email, established, description) VALUES 
(1, 'Springfield Farm', 'Illinois, USA', '500 acres', 'John Smith', '+1 (555) 123-4567', 'john.smith@springfield.farm', '1985', 'Family-owned farm specializing in hay production and livestock feed.');

-- Insert demo sensors
INSERT INTO sensors (user_id, name, location, bales_monitored, temperature, moisture, battery_level) VALUES 
(1, 'North Field Sensor A', 'North Field A', 156, 24.5, 15.2, 87),
(1, 'South Field Sensor B', 'South Field B', 89, 78.2, 18.5, 45),
(1, 'East Field Sensor C', 'East Field C', 203, 22.1, 14.8, 92);
