// src/App.js - Main React Application
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Services
import apiService from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hayguard_token');
    if (token) {
      // Validate token and get user info
      apiService.getFarmInfo()
        .then(() => {
          setUser({ token });
        })
        .catch(() => {
          localStorage.removeItem('hayguard_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading HayGuard...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar onLogout={handleLogout} />}
        
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" /> : <Register onRegister={handleLogin} />} 
          />
          <Route 
            path="/" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

// src/components/Dashboard.js
const Dashboard = () => {
  const [sensors, setSensors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [sensorsResponse, alertsResponse] = await Promise.all([
        apiService.getSensors(),
        apiService.getAlerts()
      ]);
      
      setSensors(sensorsResponse.sensors || []);
      setAlerts(alertsResponse.alerts || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSensor = async (sensorData) => {
    try {
      await apiService.addSensor(sensorData);
      setShowAddModal(false);
      loadDashboardData(); // Refresh data
    } catch (error) {
      alert('Failed to add sensor: ' + error.message);
    }
  };

  const handleDeleteSensor = async (sensorId) => {
    if (window.confirm('Are you sure you want to delete this sensor?')) {
      try {
        await apiService.deleteSensor(sensorId);
        loadDashboardData(); // Refresh data
      } catch (error) {
        alert('Failed to delete sensor: ' + error.message);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Farm Dashboard</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add Sensor
        </button>
      </div>

      <AlertPanel alerts={alerts} />

      <div className="sensors-grid">
        {sensors.map(sensor => (
          <SensorCard 
            key={sensor.id}
            sensor={sensor}
            onSelect={() => setSelectedSensor(sensor)}
            onDelete={() => handleDeleteSensor(sensor.id)}
          />
        ))}
        
        {sensors.length === 0 && (
          <div className="empty-state">
            <h3>No sensors found</h3>
            <p>Add your first sensor to start monitoring your farm.</p>
          </div>
        )}
      </div>

      {selectedSensor && (
        <SensorChart 
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
        />
      )}

      {showAddModal && (
        <AddSensorModal 
          onSubmit={handleAddSensor}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

// src/components/Login.js
const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.login(formData);
      onLogin(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo">
          <h1>HayGuard</h1>
          <p>Smart Farm Monitoring</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <a href="/register">Sign up</a>
        </p>
      </div>
    </div>
  );
};

// src/components/Register.js
const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    farmName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        farmName: formData.farmName
      });
      onRegister(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo">
          <h1>HayGuard</h1>
          <p>Smart Farm Monitoring</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Farm Name</label>
            <input
              type="text"
              name="farmName"
              value={formData.farmName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
};

// src/components/SensorCard.js
const SensorCard = ({ sensor, onSelect, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      active: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      offline: '#6b7280'
    };
    return colors[status] || colors.offline;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="sensor-card" onClick={onSelect}>
      <div className="sensor-header">
        <h3>{sensor.name}</h3>
        <div 
          className="status-indicator"
          style={{ backgroundColor: getStatusColor(sensor.status) }}
        >
          {sensor.status}
        </div>
      </div>
      
      <div className="sensor-location">
        📍 {sensor.location}
      </div>

      <div className="sensor-readings">
        <div className="reading">
          <span className="reading-label">Temperature:</span>
          <span className="reading-value">{sensor.temperature}°C</span>
        </div>
        
        <div className="reading">
          <span className="reading-label">Moisture:</span>
          <span className="reading-value">{sensor.moisture}%</span>
        </div>

        <div className="chemicals">
          <div className="chemical">
            <span>N: {sensor.chemicals.nitrogen}</span>
          </div>
          <div className="chemical">
            <span>P: {sensor.chemicals.phosphorus}</span>
          </div>
          <div className="chemical">
            <span>K: {sensor.chemicals.potassium}</span>
          </div>
        </div>
      </div>

      <div className="sensor-footer">
        <small>Last update: {formatDate(sensor.lastUpdate)}</small>
        <button 
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(sensor.id);
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

// src/components/SensorChart.js
const SensorChart = ({ sensor, onClose }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(24);

  useEffect(() => {
    loadChartData();
  }, [sensor.id, timeRange]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getHistoricalData({
        sensorId: sensor.id,
        hours: timeRange
      });
      setChartData(response.data || []);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chart-modal-overlay" onClick={onClose}>
      <div className="chart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chart-header">
          <h2>{sensor.name} - Historical Data</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="time-range-selector">
          <button 
            className={timeRange === 6 ? 'active' : ''}
            onClick={() => setTimeRange(6)}
          >
            6H
          </button>
          <button 
            className={timeRange === 24 ? 'active' : ''}
            onClick={() => setTimeRange(24)}
          >
            24H
          </button>
          <button 
            className={timeRange === 168 ? 'active' : ''}
            onClick={() => setTimeRange(168)}
          >
            7D
          </button>
        </div>

        {loading ? (
          <div className="chart-loading">Loading chart data...</div>
        ) : (
          <div className="simple-chart">
            <div className="chart-legend">
              <span className="legend-item temp">Temperature</span>
              <span className="legend-item moisture">Moisture</span>
            </div>
            
            <div className="chart-container">
              {chartData.length > 0 ? (
                <div className="chart-data">
                  {chartData.map((point, index) => (
                    <div key={index} className="data-point">
                      <div className="time">{point.time}</div>
                      <div className="values">
                        <span className="temp">{point.temperature}°C</span>
                        <span className="moisture">{point.moisture}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No historical data available</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// src/components/AlertPanel.js
const AlertPanel = ({ alerts }) => {
  const getSeverityColor = (severity) => {
    const colors = {
      low: '#3b82f6',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🚨',
      critical: '🔥'
    };
    return icons[severity] || icons.medium;
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="alert-panel no-alerts">
        <h2>✅ All systems normal</h2>
        <p>No active alerts</p>
      </div>
    );
  }

  return (
    <div className="alert-panel">
      <h2>🚨 Active Alerts ({alerts.length})</h2>
      
      <div className="alerts-list">
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            className="alert-item"
            style={{ borderLeftColor: getSeverityColor(alert.severity) }}
          >
            <div className="alert-header">
              <span className="alert-icon">
                {getSeverityIcon(alert.severity)}
              </span>
              <span className="alert-title">{alert.alert_type}</span>
              <span 
                className="alert-severity"
                style={{ color: getSeverityColor(alert.severity) }}
              >
                {alert.severity.toUpperCase()}
              </span>
            </div>
            
            <div className="alert-message">
              {alert.message}
            </div>
            
            <div className="alert-details">
              <span>Sensor: {alert.sensor_name}</span>
              <span>{new Date(alert.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// src/components/AddSensorModal.js
const AddSensorModal = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    deviceId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setFormData({ name: '', location: '', deviceId: '' });
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Sensor</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Sensor Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., North Field Sensor"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., North Field, Section A"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Device ID</label>
            <input
              type="text"
              name="deviceId"
              value={formData.deviceId}
              onChange={handleChange}
              placeholder="e.g., HG-001"
              disabled={loading}
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !formData.name || !formData.location}
            >
              {loading ? 'Adding...' : 'Add Sensor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// src/components/Navbar.js
const Navbar = ({ onLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h1>🌾 HayGuard</h1>
          <span>Smart Farm Monitoring</span>
        </div>

        <div className="nav-menu">
          <button className="nav-link active">
            📊 Dashboard
          </button>
          <button className="nav-link">
            ⚙️ Settings
          </button>
          <button className="nav-link logout" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default App;