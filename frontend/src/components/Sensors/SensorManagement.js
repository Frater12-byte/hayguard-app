import React, { useState } from 'react';
import './SensorManagement.css';

const SensorManagement = () => {
  const [sensors, setSensors] = useState([
    {
      id: 'HB-2024-001',
      name: 'North Field Sensor A',
      location: 'North Field A',
      status: 'active',
      temperature: 24.5,
      moisture: 15.2,
      batteryLevel: 87,
      lastReading: '2025-01-15 14:30:22',
      balesMonitored: 156,
      installDate: '2024-03-15'
    },
    {
      id: 'HB-2024-002',
      name: 'South Field Sensor B',
      location: 'South Field B',
      status: 'warning',
      temperature: 78.2,
      moisture: 18.5,
      batteryLevel: 45,
      lastReading: '2025-01-15 14:28:15',
      balesMonitored: 89,
      installDate: '2024-04-02'
    },
    {
      id: 'HB-2024-003',
      name: 'East Field Sensor C',
      location: 'East Field C',
      status: 'active',
      temperature: 22.1,
      moisture: 14.8,
      batteryLevel: 92,
      lastReading: '2025-01-15 14:31:05',
      balesMonitored: 203,
      installDate: '2024-05-20'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSensor, setNewSensor] = useState({
    name: '',
    location: '',
    balesMonitored: ''
  });

  // Filter sensors based on search term
  const filteredSensors = sensors.filter(sensor =>
    sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock historical data for selected sensor
  const getHistoricalData = (sensorId) => {
    return [
      { date: '2025-01-15', time: '14:30', temperature: 24.5, moisture: 15.2 },
      { date: '2025-01-15', time: '14:00', temperature: 24.1, moisture: 15.0 },
      { date: '2025-01-15', time: '13:30', temperature: 23.8, moisture: 14.9 },
      { date: '2025-01-15', time: '13:00', temperature: 23.5, moisture: 14.8 },
      { date: '2025-01-15', time: '12:30', temperature: 23.2, moisture: 14.7 },
      { date: '2025-01-15', time: '12:00', temperature: 22.9, moisture: 14.6 },
      { date: '2025-01-15', time: '11:30', temperature: 22.7, moisture: 14.5 },
      { date: '2025-01-15', time: '11:00', temperature: 22.5, moisture: 14.4 }
    ];
  };

  const handleAddSensor = (e) => {
    e.preventDefault();
    const sensorId = `HB-2024-${String(sensors.length + 1).padStart(3, '0')}`;
    const newSensorData = {
      id: sensorId,
      name: newSensor.name,
      location: newSensor.location,
      status: 'active',
      temperature: 22.0,
      moisture: 14.0,
      batteryLevel: 100,
      lastReading: new Date().toISOString().replace('T', ' ').slice(0, 19),
      balesMonitored: parseInt(newSensor.balesMonitored),
      installDate: new Date().toISOString().split('T')[0]
    };
    
    setSensors([...sensors, newSensorData]);
    setNewSensor({ name: '', location: '', balesMonitored: '' });
    setShowAddForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'warning': return '#ffc107';
      case 'critical': return '#dc3545';
      case 'offline': return '#6c757d';
      default: return '#6c757d';
    }
  };

  if (selectedSensor) {
    const historicalData = getHistoricalData(selectedSensor.id);
    
    return (
      <div className="sensor-management">
        <div className="sensor-detail-header">
          <button 
            className="back-btn"
            onClick={() => setSelectedSensor(null)}
          >
            ← Back to Sensors
          </button>
          <h1>Sensor Details: {selectedSensor.name}</h1>
        </div>

        <div className="sensor-detail-grid">
          <div className="sensor-info-card">
            <h3>Sensor Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Sensor ID:</label>
                <span>{selectedSensor.id}</span>
              </div>
              <div className="info-item">
                <label>Location:</label>
                <span>{selectedSensor.location}</span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(selectedSensor.status) }}
                >
                  {selectedSensor.status.toUpperCase()}
                </span>
              </div>
              <div className="info-item">
                <label>Bales Monitored:</label>
                <span>{selectedSensor.balesMonitored}</span>
              </div>
              <div className="info-item">
                <label>Install Date:</label>
                <span>{selectedSensor.installDate}</span>
              </div>
              <div className="info-item">
                <label>Battery Level:</label>
                <span>{selectedSensor.batteryLevel}%</span>
              </div>
            </div>
          </div>

          <div className="current-readings-card">
            <h3>Current Readings</h3>
            <div className="readings-grid">
              <div className="reading-item">
                <div className="reading-icon">🌡️</div>
                <div className="reading-content">
                  <div className="reading-value">{selectedSensor.temperature}°C</div>
                  <div className="reading-label">Temperature</div>
                </div>
              </div>
              <div className="reading-item">
                <div className="reading-icon">💧</div>
                <div className="reading-content">
                  <div className="reading-value">{selectedSensor.moisture}%</div>
                  <div className="reading-label">Moisture</div>
                </div>
              </div>
            </div>
            <div className="last-reading">
              Last reading: {selectedSensor.lastReading}
            </div>
          </div>
        </div>

        <div className="historical-data-section">
          <h3>Historical Data (Last 8 Readings)</h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Temperature (°C)</th>
                  <th>Moisture (%)</th>
                </tr>
              </thead>
              <tbody>
                {historicalData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.date}</td>
                    <td>{data.time}</td>
                    <td>{data.temperature}</td>
                    <td>{data.moisture}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sensor-management">
      <div className="sensor-header">
        <h1>Sensor Management</h1>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search sensors by name, ID, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className="add-sensor-btn"
            onClick={() => setShowAddForm(true)}
          >
            + Add New Sensor
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="add-sensor-form">
          <div className="form-header">
            <h3>Add New Sensor</h3>
            <button 
              className="close-btn"
              onClick={() => setShowAddForm(false)}
            >
              ×
            </button>
          </div>
          <form onSubmit={handleAddSensor}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="sensorName">Sensor Name</label>
                <input
                  id="sensorName"
                  type="text"
                  value={newSensor.name}
                  onChange={(e) => setNewSensor({...newSensor, name: e.target.value})}
                  placeholder="e.g., North Field Sensor D"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="sensorLocation">Location</label>
                <input
                  id="sensorLocation"
                  type="text"
                  value={newSensor.location}
                  onChange={(e) => setNewSensor({...newSensor, location: e.target.value})}
                  placeholder="e.g., North Field D"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="balesMonitored">Number of Bales to Monitor</label>
                <input
                  id="balesMonitored"
                  type="number"
                  value={newSensor.balesMonitored}
                  onChange={(e) => setNewSensor({...newSensor, balesMonitored: e.target.value})}
                  placeholder="e.g., 150"
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Add Sensor
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="sensors-grid">
        {filteredSensors.map(sensor => (
          <div key={sensor.id} className="sensor-card">
            <div className="sensor-card-header">
              <div className="sensor-title">
                <h3>{sensor.name}</h3>
                <span className="sensor-id">{sensor.id}</span>
              </div>
              <div 
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(sensor.status) }}
              ></div>
            </div>
            
            <div className="sensor-location">
              📍 {sensor.location}
            </div>
            
            <div className="sensor-readings">
              <div className="reading">
                <span className="reading-label">Temperature</span>
                <span className="reading-value">{sensor.temperature}°C</span>
              </div>
              <div className="reading">
                <span className="reading-label">Moisture</span>
                <span className="reading-value">{sensor.moisture}%</span>
              </div>
              <div className="reading">
                <span className="reading-label">Battery</span>
                <span className="reading-value">{sensor.batteryLevel}%</span>
              </div>
              <div className="reading">
                <span className="reading-label">Bales</span>
                <span className="reading-value">{sensor.balesMonitored}</span>
              </div>
            </div>
            
            <div className="sensor-footer">
              <div className="last-reading">
                Last: {sensor.lastReading}
              </div>
              <button 
                className="view-details-btn"
                onClick={() => setSelectedSensor(sensor)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSensors.length === 0 && searchTerm && (
        <div className="no-results">
          <p>No sensors found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default SensorManagement;
