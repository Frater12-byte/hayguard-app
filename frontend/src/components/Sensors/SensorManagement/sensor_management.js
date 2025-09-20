import React, { useState, useEffect } from 'react';
import './SensorManagement.css';

const SensorManagement = ({ user }) => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    baleId: '',
    type: 'temperature_moisture',
    status: 'active'
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSensors([
        { id: 1, name: 'Sensor-A1', location: 'Barn A - Section 1', baleId: 'B001', type: 'temperature_moisture', status: 'active', temperature: 65.2, moisture: 11.5, battery: 85, lastUpdate: '5 min ago' },
        { id: 2, name: 'Sensor-A2', location: 'Barn A - Section 2', baleId: 'B002', type: 'temperature_moisture', status: 'active', temperature: 72.1, moisture: 15.2, battery: 72, lastUpdate: '7 min ago' },
        { id: 3, name: 'Sensor-A3', location: 'Barn A - Section 3', baleId: 'B003', type: 'temperature_moisture', status: 'warning', temperature: 78.9, moisture: 13.1, battery: 45, lastUpdate: '10 min ago' },
        { id: 4, name: 'Sensor-B1', location: 'Barn B - Section 1', baleId: 'B004', type: 'temperature_moisture', status: 'active', temperature: 64.8, moisture: 10.9, battery: 91, lastUpdate: '12 min ago' },
        { id: 5, name: 'Sensor-B2', location: 'Barn B - Section 2', baleId: 'B005', type: 'temperature_moisture', status: 'inactive', temperature: 0, moisture: 0, battery: 15, lastUpdate: '2 hours ago' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredSensors = sensors.filter(sensor =>
    sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.baleId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSensor = () => {
    const newSensor = {
      id: Date.now(),
      ...formData,
      temperature: 0,
      moisture: 0,
      battery: 100,
      lastUpdate: 'Just now'
    };
    setSensors([...sensors, newSensor]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditSensor = () => {
    setSensors(sensors.map(sensor =>
      sensor.id === selectedSensor.id
        ? { ...sensor, ...formData }
        : sensor
    ));
    setShowEditModal(false);
    resetForm();
  };

  const handleDeleteSensor = (sensorId) => {
    if (window.confirm('Are you sure you want to delete this sensor?')) {
      setSensors(sensors.filter(sensor => sensor.id !== sensorId));
    }
  };

  const openEditModal = (sensor) => {
    setSelectedSensor(sensor);
    setFormData({
      name: sensor.name,
      location: sensor.location,
      baleId: sensor.baleId,
      type: sensor.type,
      status: sensor.status
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      baleId: '',
      type: 'temperature_moisture',
      status: 'active'
    });
    setSelectedSensor(null);
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { class: 'badge-success', text: 'Active' },
      warning: { class: 'badge-warning', text: 'Warning' },
      inactive: { class: 'badge-danger', text: 'Inactive' }
    };
    const statusConfig = config[status] || config.inactive;
    return <span className={`badge ${statusConfig.class}`}>{statusConfig.text}</span>;
  };

  const getBatteryColor = (level) => {
    if (level > 60) return '#10b981';
    if (level > 30) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="sensor-loading">
        <div className="spinner"></div>
        <p>Loading sensors...</p>
      </div>
    );
  }

  return (
    <div className="sensor-management">
      <div className="sensor-header">
        <div className="header-content">
          <h2>Sensor Management</h2>
          <p>Deploy, monitor, and manage hay bale sensors</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Deploy New Sensor
        </button>
      </div>

      <div className="sensor-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search sensors by name, location, or bale ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="sensors-grid">
        {filteredSensors.map(sensor => (
          <div key={sensor.id} className="sensor-card">
            <div className="sensor-card-header">
              <div className="sensor-info">
                <h3>{sensor.name}</h3>
                <p className="sensor-location">{sensor.location}</p>
                <p className="bale-id">Bale: {sensor.baleId}</p>
              </div>
              {getStatusBadge(sensor.status)}
            </div>

            <div className="sensor-readings">
              <div className="reading-item">
                <span className="reading-label">Temperature</span>
                <span className="reading-value">{sensor.temperature}°F</span>
              </div>
              <div className="reading-item">
                <span className="reading-label">Moisture</span>
                <span className="reading-value">{sensor.moisture}%</span>
              </div>
              <div className="reading-item">
                <span className="reading-label">Battery</span>
                <span 
                  className="reading-value"
                  style={{ color: getBatteryColor(sensor.battery) }}
                >
                  {sensor.battery}%
                </span>
              </div>
            </div>

            <div className="sensor-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => openEditModal(sensor)}
              >
                Edit
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDeleteSensor(sensor.id)}
              >
                Delete
              </button>
            </div>

            <div className="sensor-footer">
              <span className="last-update">Last update: {sensor.lastUpdate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Sensor Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Deploy New Sensor</h3>
              <button onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Sensor Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Sensor-C1"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Barn C - Section 1"
                />
              </div>
              <div className="form-group">
                <label>Bale ID</label>
                <input
                  type="text"
                  value={formData.baleId}
                  onChange={(e) => setFormData({...formData, baleId: e.target.value})}
                  placeholder="e.g., B006"
                />
              </div>
              <div className="form-group">
                <label>Sensor Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="temperature_moisture">Temperature & Moisture</option>
                  <option value="temperature_only">Temperature Only</option>
                  <option value="moisture_only">Moisture Only</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddSensor}>
                Deploy Sensor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sensor Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Sensor</h3>
              <button onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Sensor Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Bale ID</label>
                <input
                  type="text"
                  value={formData.baleId}
                  onChange={(e) => setFormData({...formData, baleId: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="warning">Warning</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleEditSensor}>
                Update Sensor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorManagement;