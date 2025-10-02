import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, Thermometer, Shield, Cloud, Droplets, Wind, MapPin, AlertCircle, Plus } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { sensors, alerts, farmInfo } = useData();
  const [selectedSensor, setSelectedSensor] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [timePeriod, setTimePeriod] = useState('14');
  const [weatherView, setWeatherView] = useState('forecast');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const hasGeolocation = farmInfo?.location?.latitude && farmInfo?.location?.longitude;

  // Check if there are any paired/live sensors
  const hasPairedSensors = sensors && sensors.length > 0 && sensors.some(s => s.status !== 'unpaired');

  // Calculate System Health
  const calculateSystemHealth = () => {
    if (!sensors || sensors.length === 0) return { score: 0, breakdown: {} };

    const avgBattery = sensors.reduce((sum, s) => sum + (s.batteryLevel || 0), 0) / sensors.length;
    const batteryScore = (avgBattery / 100) * 40;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentAlerts = alerts?.filter(a => 
      new Date(a.timestamp) > sevenDaysAgo && !a.resolved
    ).length || 0;
    const alertScore = Math.max(0, 30 - (recentAlerts * 3));

    const totalBales = sensors.reduce((sum, s) => sum + (s.balesMonitored || 0), 0);
    const sensorCount = sensors.length;
    const balesPerSensor = totalBales / sensorCount;
    let ratioScore = 0;
    if (balesPerSensor >= 3 && balesPerSensor <= 5) {
      ratioScore = 30;
    } else if (balesPerSensor < 3) {
      ratioScore = 30 * (balesPerSensor / 3);
    } else {
      ratioScore = Math.max(0, 30 - ((balesPerSensor - 5) * 3));
    }

    return {
      score: Math.round(batteryScore + alertScore + ratioScore),
      breakdown: {
        battery: Math.round(avgBattery),
        batteryScore: Math.round(batteryScore),
        alerts: recentAlerts,
        alertScore: Math.round(alertScore),
        balesPerSensor: balesPerSensor.toFixed(1),
        ratioScore: Math.round(ratioScore)
      }
    };
  };

  const systemHealth = calculateSystemHealth();

  // Calculate KPIs
  const sensorsDeployed = sensors?.length || 0;
  
  const criticalAlertsLast48h = alerts?.filter(alert => {
    if (alert.resolved) return false;
    const alertTime = new Date(alert.timestamp);
    const now = new Date();
    const hoursDiff = (now - alertTime) / (1000 * 60 * 60);
    return alert.severity === 'critical' && hoursDiff <= 48;
  }).length || 0;

  const balesMonitored = sensors?.reduce((sum, sensor) => {
    return sum + (sensor.balesMonitored || 0);
  }, 0) || 0;

  // Get available sensors based on location filter
  const getAvailableSensors = () => {
    if (!sensors) return [];
    if (selectedLocation === 'all') return sensors;
    return sensors.filter(s => s.location === selectedLocation);
  };

  // Get available locations based on sensor filter
  const getAvailableLocations = () => {
    if (!sensors) return [];
    if (selectedSensor === 'all') {
      return [...new Set(sensors.map(s => s.location).filter(Boolean))];
    }
    const sensor = sensors.find(s => s.id === selectedSensor);
    return sensor ? [sensor.location] : [];
  };

  const availableSensors = getAvailableSensors();
  const availableLocations = getAvailableLocations();

  // Handle location change - reset sensor if it's not in the new location
  const handleLocationChange = (newLocation) => {
    setSelectedLocation(newLocation);
    if (newLocation !== 'all' && selectedSensor !== 'all') {
      const sensor = sensors?.find(s => s.id === selectedSensor);
      if (sensor && sensor.location !== newLocation) {
        setSelectedSensor('all');
      }
    }
  };

  // Handle sensor change - auto-set location to that sensor's location
  const handleSensorChange = (newSensorId) => {
    setSelectedSensor(newSensorId);
    if (newSensorId !== 'all') {
      const sensor = sensors?.find(s => s.id === newSensorId);
      if (sensor) {
        setSelectedLocation(sensor.location);
      }
    }
  };

  const getFilteredSensors = () => {
    let filtered = sensors || [];
    
    if (selectedSensor !== 'all') {
      filtered = filtered.filter(s => s.id === selectedSensor);
    }
    
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(s => s.location === selectedLocation);
    }
    
    return filtered;
  };

  const filteredSensors = getFilteredSensors();

  // Generate Temperature Chart Data
  const generateTempChartData = () => {
    const days = parseInt(timePeriod);
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const avgTemp = filteredSensors.length > 0
        ? filteredSensors.reduce((sum, s) => sum + (s.currentTemperature || 20), 0) / filteredSensors.length
        : 20;
      
      const seasonalEffect = Math.sin((i / days) * Math.PI) * 3;
      const dailyVariation = (Math.random() - 0.5) * 4;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        temperature: parseFloat((avgTemp + seasonalEffect + dailyVariation).toFixed(1))
      });
    }
    
    return data;
  };

  // Generate Moisture Chart Data
  const generateMoistureChartData = () => {
    const days = parseInt(timePeriod);
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const avgMoisture = filteredSensors.length > 0
        ? filteredSensors.reduce((sum, s) => sum + (s.currentMoisture || 15), 0) / filteredSensors.length
        : 15;
      
      const trend = (i / days) * 0.5;
      const dailyVariation = (Math.random() - 0.5) * 2;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        moisture: parseFloat((avgMoisture - trend + dailyVariation).toFixed(1))
      });
    }
    
    return data;
  };

  const tempChartData = generateTempChartData();
  const moistureChartData = generateMoistureChartData();

  // Get Latest Readings
  const getLatestReadings = () => {
    if (!sensors || sensors.length === 0) return [];
    
    const readings = sensors.map(sensor => ({
      sensorId: sensor.id,
      sensorName: sensor.name,
      temperature: sensor.currentTemperature,
      moisture: sensor.currentMoisture,
      timestamp: sensor.lastUpdate || new Date()
    }));
    
    return readings
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  };

  const latestReadings = getLatestReadings();

  // Get Last 24h Alerts
  const getLast24hAlerts = () => {
    if (!alerts || alerts.length === 0) return [];
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return alerts
      .filter(alert => new Date(alert.timestamp) > twentyFourHoursAgo)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  };

  const last24hAlerts = getLast24hAlerts();

  // Weather Data
  const getWeatherData = () => {
    if (!hasGeolocation) return null;
    
    return {
      current: {
        temp: '23°C',
        precipitation: '15%',
        humidity: '65%',
        wind: '12 km/h'
      },
      past: [
        { date: 'Mon', temp: 22, humidity: 60 },
        { date: 'Tue', temp: 24, humidity: 58 },
        { date: 'Wed', temp: 21, humidity: 65 },
        { date: 'Thu', temp: 20, humidity: 70 },
        { date: 'Fri', temp: 22, humidity: 62 },
        { date: 'Sat', temp: 23, humidity: 60 },
        { date: 'Sun', temp: 23, humidity: 63 }
      ],
      forecast: [
        { date: 'Mon', temp: 24, humidity: 62 },
        { date: 'Tue', temp: 26, humidity: 58 },
        { date: 'Wed', temp: 24, humidity: 60 },
        { date: 'Thu', temp: 22, humidity: 68 },
        { date: 'Fri', temp: 23, humidity: 65 },
        { date: 'Sat', temp: 25, humidity: 60 },
        { date: 'Sun', temp: 24, humidity: 62 }
      ]
    };
  };

  const weatherData = getWeatherData();

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMinutes = Math.floor((now - then) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Dynamic Health Status - Returns status object and CSS class
  const getHealthStatus = (score) => {
    if (score >= 80) return { label: 'Excellent', color: '#10b981', cssClass: 'excellent' };
    if (score >= 60) return { label: 'Good', color: '#3b82f6', cssClass: 'good' };
    if (score >= 40) return { label: 'Fair', color: '#f59e0b', cssClass: 'fair' };
    return { label: 'Needs Attention', color: '#ef4444', cssClass: 'poor' };
  };

  const healthStatus = getHealthStatus(systemHealth.score);

  // Empty State Component for Charts
  const ChartEmptyState = ({ title }) => (
    <div className="chart-empty-state">
      <Thermometer size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
      <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '18px' }}>No Sensor Data Available</h3>
      <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '14px' }}>
        Add and pair your first sensor to start monitoring {title.toLowerCase()}
      </p>
      <button 
        className="btn-primary"
        onClick={() => navigate('/sensors')}
      >
        <Plus size={16} />
        Add First Sensor
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* System Health Banner - Dynamic Color Classes */}
      <div className={`system-health-banner ${healthStatus.cssClass}`}>
        <div className="system-health-content">
          <div className="system-health-icon">
            <Shield size={36} />
          </div>
          <div className="system-health-info">
            <div className="system-health-label">System Health Score</div>
            <div className="system-health-value">{systemHealth.score}%</div>
            <div className="system-health-breakdown">
              <span className="health-factor">
                <Activity size={14} /> Battery: {systemHealth.breakdown.battery}%
              </span>
              <span className="health-factor">
                <AlertTriangle size={14} /> Alerts (7d): {systemHealth.breakdown.alerts}
              </span>
              <span className="health-factor">
                <Thermometer size={14} /> Coverage: {systemHealth.breakdown.balesPerSensor} bales/sensor
              </span>
            </div>
          </div>
        </div>
        <div className="health-status-indicator">
          <div 
            className="health-status-badge"
            style={{ backgroundColor: healthStatus.color }}
          >
            {healthStatus.label}
          </div>
          <div className="health-meter">
            <div 
              className="health-meter-fill" 
              style={{ 
                width: `${systemHealth.score}%`,
                backgroundColor: healthStatus.color
              }}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" onClick={() => navigate('/sensors')}>
          <div className="kpi-header">
            <span className="kpi-label">Sensors Deployed</span>
            <span className="kpi-icon">
              <Thermometer size={24} />
            </span>
          </div>
          <div className="kpi-value">{sensorsDeployed}</div>
          <div className="kpi-subtitle">
            {sensors?.filter(s => s.status === 'online').length || 0} Active
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/alerts')}>
          <div className="kpi-header">
            <span className="kpi-label">Critical Alerts (48h)</span>
            <span className="kpi-icon">
              <AlertTriangle size={24} />
            </span>
          </div>
          <div className="kpi-value">{criticalAlertsLast48h}</div>
          <div className="kpi-subtitle">Requires attention</div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/sensors')}>
          <div className="kpi-header">
            <span className="kpi-label">Bales Monitored</span>
            <span className="kpi-icon">
              <Activity size={24} />
            </span>
          </div>
          <div className="kpi-value">{balesMonitored.toLocaleString()}</div>
          <div className="kpi-subtitle">Total tracked</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Column */}
        <div>
          {/* Temperature Trend Chart */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Bale Temperature Trend (°C)</h2>
            </div>
            <div className="section-body">
              {!hasPairedSensors ? (
                <ChartEmptyState title="Bale Temperature" />
              ) : (
                <>
                  <div className="chart-filters">
                    <div className="filter-group">
                      <select
                        className="filter-select"
                        value={selectedSensor}
                        onChange={(e) => handleSensorChange(e.target.value)}
                      >
                        <option value="all">All Sensors (Average)</option>
                        {availableSensors?.map(sensor => (
                          <option key={sensor.id} value={sensor.id}>
                            {sensor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <select
                        className="filter-select"
                        value={selectedLocation}
                        onChange={(e) => handleLocationChange(e.target.value)}
                      >
                        <option value="all">All Locations</option>
                        {availableLocations.map(location => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <select
                        className="filter-select"
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value)}
                      >
                        <option value="7">Last 7 Days</option>
                        <option value="14">Last 14 Days</option>
                        <option value="30">Last 30 Days</option>
                      </select>
                    </div>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tempChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                          domain={['dataMin - 2', 'dataMax + 2']}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px'
                          }}
                          formatter={(value) => [`${value.toFixed(1)}°C`, 'Temperature']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="temperature" 
                          stroke="#f59e0b" 
                          strokeWidth={3}
                          name="Temperature (°C)"
                          dot={{ fill: '#f59e0b', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Moisture Trend Chart */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Bale Moisture Trend (%)</h2>
            </div>
            <div className="section-body">
              {!hasPairedSensors ? (
                <ChartEmptyState title="Bale Moisture" />
              ) : (
                <>
                  <div className="chart-filters">
                    <div className="filter-group">
                      <select
                        className="filter-select"
                        value={selectedSensor}
                        onChange={(e) => handleSensorChange(e.target.value)}
                      >
                        <option value="all">All Sensors (Average)</option>
                        {availableSensors?.map(sensor => (
                          <option key={sensor.id} value={sensor.id}>
                            {sensor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <select
                        className="filter-select"
                        value={selectedLocation}
                        onChange={(e) => handleLocationChange(e.target.value)}
                      >
                        <option value="all">All Locations</option>
                        {availableLocations.map(location => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <select
                        className="filter-select"
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value)}
                      >
                        <option value="7">Last 7 Days</option>
                        <option value="14">Last 14 Days</option>
                        <option value="30">Last 30 Days</option>
                      </select>
                    </div>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moistureChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                          domain={['dataMin - 1', 'dataMax + 1']}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px'
                          }}
                          formatter={(value) => [`${value.toFixed(1)}%`, 'Moisture']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="moisture" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          name="Moisture (%)"
                          dot={{ fill: '#3b82f6', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Latest Sensor Readings */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Latest Bale Readings</h2>
            </div>
            <div className="section-body">
              {latestReadings.length === 0 ? (
                <div className="empty-state">
                  <p>No sensor readings available</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    Add sensors to start monitoring your bales
                  </p>
                </div>
              ) : (
                <table className="readings-table">
                  <thead>
                    <tr>
                      <th>Sensor Name</th>
                      <th>Temperature</th>
                      <th>Moisture</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestReadings.map((reading, index) => (
                      <tr key={index}>
                        <td className="reading-sensor-name-cell" data-label="Sensor">
                          {reading.sensorName}
                        </td>
                        <td className="reading-temp-cell" data-label="Temperature">
                          {reading.temperature?.toFixed(1) || 'N/A'}°C
                        </td>
                        <td className="reading-moisture-cell" data-label="Moisture">
                          {reading.moisture?.toFixed(1) || 'N/A'}%
                        </td>
                        <td className="reading-time-cell" data-label="Timestamp">
                          {formatTimeAgo(reading.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Weather Conditions */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Farm Weather Conditions</h2>
            </div>
            <div className="section-body">
              {!hasGeolocation ? (
                <div className="weather-no-location">
                  <MapPin size={48} className="no-location-icon" />
                  <h3>No Location Set</h3>
                  <p>Please set your farm's geolocation coordinates to view weather data.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => navigate('/my-farm')}
                  >
                    <MapPin size={16} />
                    Set Farm Location
                  </button>
                </div>
              ) : (
                <>
                  <div className="current-weather-stats">
                    <div className="weather-stat-large">
                      <Thermometer size={20} className="weather-icon" />
                      <div className="weather-stat-content">
                        <div className="weather-stat-label">Temperature</div>
                        <div className="weather-stat-value-large">{weatherData.current.temp}</div>
                      </div>
                    </div>
                    <div className="weather-stat-large">
                      <Cloud size={20} className="weather-icon" />
                      <div className="weather-stat-content">
                        <div className="weather-stat-label">Precipitation</div>
                        <div className="weather-stat-value-large">{weatherData.current.precipitation}</div>
                      </div>
                    </div>
                    <div className="weather-stat-large">
                      <Droplets size={20} className="weather-icon" />
                      <div className="weather-stat-content">
                        <div className="weather-stat-label">Humidity</div>
                        <div className="weather-stat-value-large">{weatherData.current.humidity}</div>
                      </div>
                    </div>
                    <div className="weather-stat-large">
                      <Wind size={20} className="weather-icon" />
                      <div className="weather-stat-content">
                        <div className="weather-stat-label">Wind</div>
                        <div className="weather-stat-value-large">{weatherData.current.wind}</div>
                      </div>
                    </div>
                  </div>

                  <div className="weather-header">
                    <div className="weather-type-toggle">
                      <button
                        className={`weather-toggle-btn ${weatherView === 'past' ? 'active' : ''}`}
                        onClick={() => setWeatherView('past')}
                      >
                        Past (7d)
                      </button>
                      <button
                        className={`weather-toggle-btn ${weatherView === 'forecast' ? 'active' : ''}`}
                        onClick={() => setWeatherView('forecast')}
                      >
                        Forecast (7d)
                      </button>
                    </div>
                  </div>

                  <div className="weather-forecast-detailed">
                    <table className="weather-table">
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Temp (°C)</th>
                          <th>Humidity (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(weatherView === 'past' ? weatherData.past : weatherData.forecast).map((day, index) => (
                          <tr key={index}>
                            <td>{day.date}</td>
                            <td className="temp-value">{day.temp}°C</td>
                            <td className="humidity-value">{day.humidity}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Alerts (24h)</h2>
            </div>
            <div className="section-body">
              {last24hAlerts.length === 0 ? (
                <div className="empty-state">
                  <AlertCircle size={48} style={{ color: '#10b981', marginBottom: '12px' }} />
                  <p style={{ fontWeight: '600', color: '#10b981' }}>All Clear!</p>
                  <p style={{ fontSize: '14px', marginTop: '4px' }}>No alerts in the past 24 hours</p>
                </div>
              ) : (
                <div className="alerts-list">
                  {last24hAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`alert-item-mini ${alert.severity}`}
                      onClick={() => navigate('/alerts')}
                    >
                      <div className="alert-mini-header">
                        <span className={`alert-mini-severity ${alert.severity}`}>
                          {alert.severity}
                        </span>
                        <span className="alert-mini-time">
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                      </div>
                      <div className="alert-mini-message">
                        {alert.message}
                      </div>
                      <div className="alert-mini-sensor">
                        {alert.sensorName} • {alert.sensorId}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;