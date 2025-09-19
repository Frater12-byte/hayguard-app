// src/App.js - Enhanced HayGuard Application
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Services
import apiService from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

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

  const renderMainContent = () => {
    if (!user) return null;

    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <Analytics />;
      case 'reports':
        return <Reports />;
      case 'team':
        return <TeamManagement />;
      case 'settings':
        return <FarmSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Router>
      <div className="App">
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
            element={
              user ? (
                <>
                  <Navbar 
                    onLogout={handleLogout} 
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                  />
                  {renderMainContent()}
                </>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

// Enhanced Navbar Component
const Navbar = ({ onLogout, activeSection, setActiveSection }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h1>🌾 HayGuard</h1>
          <span>Smart Farm Monitoring</span>
        </div>

        <div className="nav-menu">
          <button 
            className={`nav-link ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-link ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveSection('analytics')}
          >
            📈 Analytics
          </button>
          <button 
            className={`nav-link ${activeSection === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveSection('reports')}
          >
            📋 Reports
          </button>
          <button 
            className={`nav-link ${activeSection === 'team' ? 'active' : ''}`}
            onClick={() => setActiveSection('team')}
          >
            👥 Team
          </button>
          <button 
            className={`nav-link ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
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

// Dashboard Component (existing)
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
      loadDashboardData();
    } catch (error) {
      alert('Failed to add sensor: ' + error.message);
    }
  };

  const handleDeleteSensor = async (sensorId) => {
    if (window.confirm('Are you sure you want to delete this sensor?')) {
      try {
        await apiService.deleteSensor(sensorId);
        loadDashboardData();
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

// Farm Settings Component
const FarmSettings = () => {
  const [farmData, setFarmData] = useState({
    name: '',
    description: '',
    area: '',
    address: '',
    coordinates: { lat: '', lng: '' },
    crops: [],
    established: ''
  });
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFarmData();
  }, []);

  const loadFarmData = async () => {
    try {
      const response = await apiService.getFarmInfo();
      const farm = response.farm;
      setFarmData({
        name: farm.name || '',
        description: farm.description || '',
        area: farm.area || '',
        address: farm.address || '',
        coordinates: farm.coordinates || { lat: '', lng: '' },
        crops: farm.crops || [],
        established: farm.established || ''
      });
      
      // Load weather if coordinates exist
      if (farm.coordinates && farm.coordinates.lat && farm.coordinates.lng) {
        loadWeatherData(farm.coordinates.lat, farm.coordinates.lng);
      }
    } catch (error) {
      console.error('Failed to load farm data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherData = async (lat, lng) => {
    try {
      // Using OpenWeatherMap API (free tier)
      const API_KEY = 'your-openweather-api-key'; // You'll need to get this
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Failed to load weather:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updateFarm(farmData);
      alert('Farm settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCoordinateChange = (field, value) => {
    const newCoordinates = { ...farmData.coordinates, [field]: value };
    setFarmData({ ...farmData, coordinates: newCoordinates });
    
    // Auto-load weather when both coordinates are set
    if (newCoordinates.lat && newCoordinates.lng) {
      loadWeatherData(newCoordinates.lat, newCoordinates.lng);
    }
  };

  if (loading) {
    return <div className="loading">Loading farm settings...</div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>🏡 Farm Settings</h1>
      </div>

      <div className="settings-grid">
        <div className="settings-panel">
          <h2>🌾 Basic Information</h2>
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

// Keep all existing components (SensorCard, SensorChart, AlertPanel, AddSensorModal)
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

export default App;">
            <label>Farm Name *</label>
            <input
              type="text"
              value={farmData.name}
              onChange={(e) => setFarmData({ ...farmData, name: e.target.value })}
              placeholder="Enter farm name"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={farmData.description}
              onChange={(e) => setFarmData({ ...farmData, description: e.target.value })}
              placeholder="Describe your farm..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Farm Area</label>
            <input
              type="text"
              value={farmData.area}
              onChange={(e) => setFarmData({ ...farmData, area: e.target.value })}
              placeholder="e.g., 150 acres, 60 hectares"
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={farmData.address}
              onChange={(e) => setFarmData({ ...farmData, address: e.target.value })}
              placeholder="Farm address"
            />
          </div>

          <div className="form-group">
            <label>Established Date</label>
            <input
              type="date"
              value={farmData.established}
              onChange={(e) => setFarmData({ ...farmData, established: e.target.value })}
            />
          </div>
        </div>

        <div className="settings-panel">
          <h2>📍 Location & Weather</h2>
          <div className="coordinates-group">
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                step="any"
                value={farmData.coordinates.lat}
                onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                placeholder="e.g., 40.7128"
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                step="any"
                value={farmData.coordinates.lng}
                onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                placeholder="e.g., -74.0060"
              />
            </div>
          </div>

          {weather && (
            <div className="weather-widget">
              <h3>🌤️ Current Weather</h3>
              <div className="weather-info">
                <div className="weather-main">
                  <span className="temperature">{Math.round(weather.main.temp)}°C</span>
                  <span className="description">{weather.weather[0].description}</span>
                </div>
                <div className="weather-details">
                  <div>💧 Humidity: {weather.main.humidity}%</div>
                  <div>💨 Wind: {weather.wind.speed} m/s</div>
                  <div>🌡️ Feels like: {Math.round(weather.main.feels_like)}°C</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="settings-actions">
        <button 
          className="btn btn-primary" 
          onClick={handleSave}
          disabled={saving || !farmData.name}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

// Analytics Component
const Analytics = () => {
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState('all');
  const [timeRange, setTimeRange] = useState(7); // days
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [selectedSensor, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [sensorsResponse, analyticsResponse] = await Promise.all([
        apiService.getSensors(),
        apiService.getAnalyticsData({ sensorId: selectedSensor, days: timeRange })
      ]);
      
      setSensors(sensorsResponse.sensors || []);
      setAnalyticsData(analyticsResponse);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📈 Analytics</h1>
        <div className="analytics-controls">
          <select 
            value={selectedSensor} 
            onChange={(e) => setSelectedSensor(e.target.value)}
          >
            <option value="all">All Sensors</option>
            {sensors.map(sensor => (
              <option key={sensor.id} value={sensor.id}>{sensor.name}</option>
            ))}
          </select>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
          >
            <option value={1}>Last 24 Hours</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 3 Months</option>
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>🌡️ Temperature Trends</h3>
          <div className="chart-placeholder">
            {/* Chart implementation would go here */}
            <p>Temperature chart for selected period</p>
          </div>
        </div>

        <div className="analytics-card">
          <h3>💧 Moisture Levels</h3>
          <div className="chart-placeholder">
            <p>Moisture chart for selected period</p>
          </div>
        </div>

        <div className="analytics-card">
          <h3>🧪 Soil Chemistry</h3>
          <div className="chemistry-stats">
            <div className="stat">
              <span className="label">Average Nitrogen:</span>
              <span className="value">45.2 ppm</span>
            </div>
            <div className="stat">
              <span className="label">Average Phosphorus:</span>
              <span className="value">23.1 ppm</span>
            </div>
            <div className="stat">
              <span className="label">Average Potassium:</span>
              <span className="value">67.8 ppm</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>📊 Summary Statistics</h3>
          <div className="summary-stats">
            <div className="stat-group">
              <h4>This Week</h4>
              <div className="stat">Avg Temperature: 22.5°C</div>
              <div className="stat">Avg Moisture: 45.2%</div>
              <div className="stat">Active Sensors: {sensors.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reports Component
const Reports = () => {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await apiService.generateReport({
        type: reportType,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hayguard-${reportType}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to generate report: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>📋 Reports</h1>
      </div>

      <div className="reports-controls">
        <div className="form-group">
          <label>Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="summary">Farm Summary</option>
            <option value="sensors">Sensor Performance</option>
            <option value="alerts">Alerts History</option>
            <option value="trends">Data Trends</option>
          </select>
        </div>

        <div className="date-range-group">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={generateReport}
          disabled={generating}
        >
          {generating ? 'Generating...' : '📄 Generate Report'}
        </button>
      </div>

      <div className="reports-preview">
        <h3>Report Preview</h3>
        <div className="preview-content">
          <p>Report Type: <strong>{reportType}</strong></p>
          <p>Date Range: <strong>{dateRange.start} to {dateRange.end}</strong></p>
          <p>This report will include sensor data, alerts, and analytics for the selected period.</p>
        </div>
      </div>
    </div>
  );
};

// Team Management Component  
const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const response = await apiService.getTeamMembers();
      setTeamMembers(response.members || []);
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (inviteData) => {
    try {
      await apiService.inviteTeamMember(inviteData);
      setShowInviteModal(false);
      loadTeamMembers();
      alert('Team member invited successfully!');
    } catch (error) {
      alert('Failed to invite member: ' + error.message);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await apiService.removeTeamMember(memberId);
        loadTeamMembers();
      } catch (error) {
        alert('Failed to remove member: ' + error.message);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading team members...</div>;
  }

  return (
    <div className="team-container">
      <div className="team-header">
        <h1>👥 Team Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowInviteModal(true)}
        >
          + Invite Member
        </button>
      </div>

      <div className="team-grid">
        {teamMembers.map(member => (
          <div key={member.id} className="team-member-card">
            <div className="member-info">
              <h3>{member.name}</h3>
              <p>{member.email}</p>
              <span className={`role-badge ${member.access_level}`}>
                {member.access_level}
              </span>
            </div>
            <div className="member-actions">
              <button 
                className="btn-secondary"
                onClick={() => handleRemoveMember(member.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {teamMembers.length === 0 && (
          <div className="empty-state">
            <h3>No team members yet</h3>
            <p>Invite team members to collaborate on your farm monitoring.</p>
          </div>
        )}
      </div>

      {showInviteModal && (
        <InviteMemberModal 
          onSubmit={handleInviteMember}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
};

// Invite Member Modal
const InviteMemberModal = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    access_level: 'viewer'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setFormData({ email: '', name: '', access_level: 'viewer' });
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
          <h2>Invite Team Member</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="colleague@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Smith"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Access Level</label>
            <select
              name="access_level"
              value={formData.access_level}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="viewer">Viewer - Can view data only</option>
              <option value="manager">Manager - Can view and manage sensors</option>
            </select>
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
              disabled={loading || !formData.email || !formData.name}
            >
              {loading ? 'Inviting...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Keep existing components (Login, Register, SensorCard, etc.)
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

          <div className="form-group