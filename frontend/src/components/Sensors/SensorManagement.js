import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import './SensorManagement.css';

const SensorManagement = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSensor, setNewSensor] = useState({
    name: '',
    location: '',
    balesMonitored: ''
  });

  // Mock data as fallback
  const mockSensors = [
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
  ];

  // Load sensors from backend on component mount
  useEffect(() => {
    const loadSensors = async () => {
      try {
        setLoading(true);
        const sensorsData = await apiService.getSensors();
        setSensors(sensorsData);
      } catch (error) {
        console.error('Failed to load sensors from backend:', error);
        // Use mock data as fallback
        setSensors(mockSensors);
      } finally {
        setLoading(false);
      }
    };
    loadSensors();
  }, []);

  const handleAddSensor = async (e) => {
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
      lastReading: new Date().toISOString().slice(0, 19).replace('T', ' '),
      balesMonitored: parseInt(newSensor.balesMonitored) || 0,
      installDate: new Date().toISOString().split('T')[0]
    };

    try {
      // Try to save to backend first
      await apiService.createSensor(newSensorData);
      
      // If successful, reload sensors from backend
      const updatedSensors = await apiService.getSensors();
      setSensors(updatedSensors);
      
      // Reset form
      setShowAddForm(false);
      setNewSensor({ name: '', location: '', balesMonitored: '' });
      
      console.log('Sensor added successfully to backend');
    } catch (error) {
      console.error('Failed to add sensor to backend:', error);
      
      // Fallback: Add to local state only
      setSensors([...sensors, newSensorData]);
      setShowAddForm(false);
      setNewSensor({ name: '', location: '', balesMonitored: '' });
      
      alert('Sensor added locally (backend connection failed)');
    }
  };

  const getSensorData = (sensorId) => {
    return [
      { date: '2025-01-15', time: '14:30', temperature: 24.5, moisture: 15.2 },
      { date: '2025-01-15', time: '14:00', temperature: 24.2, moisture: 15.0 },
      { date: '2025-01-15', time: '13:30', temperature: 23.8, moisture: 14.8 },
      { date: '2025-01-15', time: '13:00', temperature: 23.5, moisture: 14.6 },
      { date: '2025-01-15', time: '12:30', temperature: 23.2, moisture: 14.4 },
      { date: '2025-01-15', time: '12:00', temperature: 22.9, moisture: 14.2 },
      { date: '2025-01-15', time: '11:30', temperature: 22.7, moisture: 14.5 },
      { date: '2025-01-15', time: '11:00', temperature: 22.5, moisture: 14.4 }
    ];
  };

  const filteredSensors = sensors.filter(sensor =>
    sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="sensor-management loading">
        <div className="loading-spinner">Loading sensors...</div>
      </div>
    );
  }

  return (
    <div className="sensor-management">
      <div className="sensor-header">
        <h1>Sensor Management</h1>
        <button 
          className="add-sensor-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Sensor
        </button>
      </div>

      <div className="sensor-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search sensors by name, location, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sensor-stats">
          <span className="stat">Total: {sensors.length}</span>
          <span className="stat active">Active: {sensors.filter(s => s.status === 'active').length}</span>
          <span className="stat warning">Warning: {sensors.filter(s => s.status === 'warning').length}</span>
        </div>
      </div>

      <div className="sensors-grid">
        {filteredSensors.map(sensor => (
          <div key={sensor.id} className={`sensor-card ${sensor.status}`}>
            <div className="sensor-card-header">
              <h3>{sensor.name}</h3>
              <span className={`status-badge ${sensor.status}`}>
                {sensor.status}
              </span>
            </div>
            
            <div className="sensor-info">
              <div className="info-item">
                <span className="label">ID:</span>
                <span className="value">{sensor.id}</span>
              </div>
              <div className="info-item">
                <span className="label">Location:</span>
                <span className="value">{sensor.location}</span>
              </div>
              <div className="info-item">
                <span className="label">Temperature:</span>
                <span className="value">{sensor.temperature}°C</span>
              </div>
              <div className="info-item">
                <span className="label">Moisture:</span>
                <span className="value">{sensor.moisture}%</span>
              </div>
              <div className="info-item">
                <span className="label">Battery:</span>
                <span className="value">{sensor.batteryLevel}%</span>
              </div>
              <div className="info-item">
                <span className="label">Bales:</span>
                <span className="value">{sensor.balesMonitored}</span>
              </div>
              <div className="info-item">
                <span className="label">Last Reading:</span>
                <span className="value">{sensor.lastReading}</span>
              </div>
            </div>

            <div className="sensor-actions">
              <button 
                className="btn-secondary"
                onClick={() => setSelectedSensor(sensor)}
              >
                View Details
              </button>
              <button className="btn-primary">Edit</button>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-sensor-modal">
            <div className="modal-header">
              <h2>Add New Sensor</h2>
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
                  <label htmlFor="balesMonitored">Bales Monitored</label>
                  <input
                    id="balesMonitored"
                    type="number"
                    value={newSensor.balesMonitored}
                    onChange={(e) => setNewSensor({...newSensor, balesMonitored: e.target.value})}
                    placeholder="e.g., 150"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Sensor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSensor && (
        <div className="modal-overlay">
          <div className="sensor-details-modal">
            <div className="modal-header">
              <h2>Sensor Details - {selectedSensor.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedSensor(null)}
              >
                ×
              </button>
            </div>
            
            <div className="sensor-details-content">
              <div className="sensor-overview">
                <h3>Overview</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Sensor ID:</span>
                    <span className="value">{selectedSensor.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Location:</span>
                    <span className="value">{selectedSensor.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Install Date:</span>
                    <span className="value">{selectedSensor.installDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`value status ${selectedSensor.status}`}>
                      {selectedSensor.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sensor-readings">
                <h3>Recent Readings</h3>
                <div className="readings-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Temperature</th>
                        <th>Moisture</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSensorData(selectedSensor.id).map((reading, index) => (
                        <tr key={index}>
                          <td>{reading.date}</td>
                          <td>{reading.time}</td>
                          <td>{reading.temperature}°C</td>
                          <td>{reading.moisture}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorManagement;