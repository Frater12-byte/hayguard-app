// src/components/Sensors/Sensors.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import dataGenService from '../../services/dataGenerationService';
import './Sensors.css';

const Sensors = () => {
  const navigate = useNavigate();
  
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPairModal, setShowPairModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [notification, setNotification] = useState(null);
  const [qrCode, setQrCode] = useState('');
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for add modal
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'temperature_moisture',
    description: '',
    balesMonitored: 1,
    optimalRanges: {
      temperature: { min: 0, max: 30 },
      moisture: { min: 12, max: 18 }
    }
  });

  // Load sensors on mount
  useEffect(() => {
    loadSensors();
    
    // Listen for sensor updates
    const handleSensorsUpdate = () => {
      loadSensors();
    };
    
    window.addEventListener('sensorsUpdated', handleSensorsUpdate);
    
    return () => {
      window.removeEventListener('sensorsUpdated', handleSensorsUpdate);
    };
  }, []);

  const loadSensors = () => {
    try {
      const sensorsData = dataGenService.getAllSensorsWithCurrentData();
      setSensors(sensorsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading sensors:', error);
      showNotification('Error loading sensors', 'error');
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddSensor = () => {
    setFormData({
      name: '',
      location: '',
      type: 'temperature_moisture',
      description: '',
      balesMonitored: 1,
      optimalRanges: {
        temperature: { min: 0, max: 30 },
        moisture: { min: 12, max: 18 }
      }
    });
    setShowAddModal(true);
  };

  const handleViewDetails = (sensor) => {
    navigate(`/sensors/${sensor.id}`);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    
    try {
      const newSensor = dataGenService.addSensor(formData);
      loadSensors();
      setShowAddModal(false);
      showNotification(`Sensor created with ID: ${newSensor.id}. Please pair it with a physical sensor.`, 'success');
    } catch (error) {
      showNotification('Error adding sensor: ' + error.message, 'error');
    }
  };

  const handlePairSensor = (sensor) => {
    setSelectedSensor(sensor);
    setQrCode('');
    setShowPairModal(true);
  };

  const handleSubmitPair = (e) => {
    e.preventDefault();
    
    if (!qrCode.trim()) {
      showNotification('Please enter a QR code', 'error');
      return;
    }

    try {
      const pairedSensor = dataGenService.pairSensor(selectedSensor.id, qrCode);
      loadSensors();
      setShowPairModal(false);
      setSelectedSensor(null);
      setQrCode('');
      showNotification(`Sensor successfully paired! New ID: ${pairedSensor.id}`, 'success');
    } catch (error) {
      showNotification('Error pairing sensor: ' + error.message, 'error');
    }
  };

  const handleDeleteSensor = async (sensorId) => {
    if (window.confirm('Are you sure you want to delete this sensor?')) {
      try {
        dataGenService.deleteSensor(sensorId);
        loadSensors();
        showNotification('Sensor deleted successfully!', 'success');
      } catch (error) {
        showNotification('Error deleting sensor', 'error');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      online: 'status-badge online',
      offline: 'status-badge offline',
      warning: 'status-badge warning',
      unpaired: 'status-badge unpaired'
    };
    return statusClasses[status] || 'status-badge';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'online':
        return <Wifi size={14} />;
      case 'offline':
        return <WifiOff size={14} />;
      case 'unpaired':
        return <AlertTriangle size={14} />;
      default:
        return null;
    }
  };

  const getBatteryClass = (level) => {
    if (level > 50) return 'battery-high';
    if (level > 20) return 'battery-medium';
    return 'battery-low';
  };

  const formatLastUpdate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Filter sensors
  const filteredSensors = sensors.filter(sensor => {
    const statusMatch = filterStatus === 'all' || sensor.status === filterStatus;
    const typeMatch = filterType === 'all' || sensor.type === filterType;
    const locationMatch = filterLocation === 'all' || (sensor.location && sensor.location.includes(filterLocation));
    const searchMatch = searchTerm === '' || 
      (sensor.name && sensor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sensor.location && sensor.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sensor.id && sensor.id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return statusMatch && typeMatch && locationMatch && searchMatch;
  });

  const uniqueLocations = [...new Set(sensors.map(sensor => sensor.location ? sensor.location.split(' - ')[0] : 'Unknown'))];

  if (loading) {
    return (
      <div className="sensors">
        <div className="sensors-loading">Loading sensors...</div>
      </div>
    );
  }

  return (
    <div className="sensors page-container">
      {/* Notification */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <span>{notification.message}</span>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Compact Filters */}
      <div className="sensors-controls card">
        <div className="controls-main">
          <input
            type="text"
            placeholder="Search sensors by name, location, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select 
            value={filterLocation} 
            onChange={(e) => setFilterLocation(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
          
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="temperature_moisture">Temp & Moisture</option>
            <option value="temperature">Temperature</option>
            <option value="moisture">Moisture</option>
          </select>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="unpaired">Unpaired</option>
            <option value="warning">Warning</option>
          </select>
          
          <button 
            className="btn btn-primary"
            onClick={handleAddSensor}
          >
            + Add Sensor
          </button>

          {/* Test button - Remove in production */}
          <button 
            className="btn btn-secondary"
            onClick={() => {
              dataGenService.generateAllReadings();
              loadSensors();
              showNotification('Generated new readings for paired sensors!', 'info');
            }}
            style={{ marginLeft: '8px' }}
          >
            🔄 Generate Data
          </button>
        </div>
      </div>

      {/* Sensors Grid */}
      <div className="sensors-content">
        <div className="sensors-grid">
          {filteredSensors.length === 0 ? (
            <div className="no-sensors">
              <p>No sensors found</p>
              <p style={{ fontSize: '14px', marginTop: '8px', color: '#6b7280' }}>
                {sensors.length === 0 ? 'Add sensors to start monitoring' : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            filteredSensors.map(sensor => (
              <div key={sensor.id} className={`sensor-card ${sensor.status === 'unpaired' ? 'sensor-unpaired' : ''}`}>
                <div className="sensor-header">
                  <div className="sensor-title">
                    <h4>{sensor.name || 'Unnamed Sensor'}</h4>
                    <span className="sensor-id">{sensor.id}</span>
                  </div>
                  <span className={getStatusBadgeClass(sensor.status)}>
                    {getStatusIcon(sensor.status)}
                    {sensor.status ? sensor.status.toUpperCase() : 'UNKNOWN'}
                  </span>
                </div>
                
                <div className="sensor-location">
                  📍 {sensor.location || 'Unknown location'}
                </div>

                <div className="sensor-bales">
                  📦 Monitoring {sensor.balesMonitored || 0} bales
                </div>
                
                {sensor.status === 'unpaired' ? (
                  <div className="unpaired-notice">
                    <QrCode size={48} style={{ color: '#f59e0b' }} />
                    <p>This sensor needs to be paired with a physical device</p>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handlePairSensor(sensor)}
                    >
                      <QrCode size={16} />
                      Pair Sensor
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="sensor-readings">
                      {sensor.currentTemperature !== null && sensor.currentTemperature !== undefined && (
                        <div className="reading">
                          <span className="reading-label">Temperature</span>
                          <span className="reading-value">{sensor.currentTemperature.toFixed(1)}°C</span>
                        </div>
                      )}
                      {sensor.currentMoisture !== null && sensor.currentMoisture !== undefined && (
                        <div className="reading">
                          <span className="reading-label">Moisture</span>
                          <span className="reading-value">{sensor.currentMoisture.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="sensor-meta">
                      <div className="battery-info">
                        <span className={`battery-indicator ${getBatteryClass(sensor.batteryLevel || 0)}`}>
                          {sensor.isCharging ? '⚡' : '🔋'} {sensor.batteryLevel || 0}%
                          {sensor.isCharging && <span style={{ fontSize: '10px', marginLeft: '4px' }}>(Charging)</span>}
                        </span>
                      </div>
                      <div className="last-update">
                        Updated: {formatLastUpdate(sensor.lastUpdate || new Date())}
                      </div>
                    </div>
                  </>
                )}
                
                <div className="sensor-actions">
                  {sensor.status !== 'unpaired' && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleViewDetails(sensor)}
                    >
                      View Details
                    </button>
                  )}
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteSensor(sensor.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Sensor Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                Add New Sensor
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmitAdd} className="modal-form">
                {/* Basic Information */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="add-name" className="form-label-required">Sensor Name</label>
                    <input
                      type="text"
                      id="add-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Barn A Temperature"
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="add-type" className="form-label-required">Sensor Type</label>
                    <select
                      id="add-type"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      required
                      className="form-input"
                    >
                      <option value="temperature_moisture">Temperature & Moisture</option>
                      <option value="temperature">Temperature Only</option>
                      <option value="moisture">Moisture Only</option>
                    </select>
                  </div>
                </div>

                {/* Location & Bales */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="add-location" className="form-label-required">Location</label>
                    <input
                      type="text"
                      id="add-location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Barn A - Section 2"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="add-bales" className="form-label-required">Bales Monitored</label>
                    <input
                      type="number"
                      id="add-bales"
                      value={formData.balesMonitored}
                      onChange={(e) => setFormData({...formData, balesMonitored: parseInt(e.target.value) || 1})}
                      placeholder="50"
                      min="1"
                      max="1000"
                      required
                      className="form-input"
                    />
                    <span className="form-help">Number of hay bales</span>
                  </div>
                </div>

                {/* Optimal Ranges */}
                <div className="form-section">
                  <h4>Optimal Ranges</h4>
                  
                  {(formData.type === 'temperature' || formData.type === 'temperature_moisture') && (
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="add-temp-min">Min Temperature (°C)</label>
                        <input
                          type="number"
                          id="add-temp-min"
                          value={formData.optimalRanges.temperature.min}
                          onChange={(e) => setFormData({
                            ...formData,
                            optimalRanges: {
                              ...formData.optimalRanges,
                              temperature: {
                                ...formData.optimalRanges.temperature,
                                min: parseFloat(e.target.value) || 0
                              }
                            }
                          })}
                          placeholder="0"
                          className="form-input"
                          step="0.1"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="add-temp-max">Max Temperature (°C)</label>
                        <input
                          type="number"
                          id="add-temp-max"
                          value={formData.optimalRanges.temperature.max}
                          onChange={(e) => setFormData({
                            ...formData,
                            optimalRanges: {
                              ...formData.optimalRanges,
                              temperature: {
                                ...formData.optimalRanges.temperature,
                                max: parseFloat(e.target.value) || 0
                              }
                            }
                          })}
                          placeholder="30"
                          className="form-input"
                          step="0.1"
                        />
                      </div>
                    </div>
                  )}

                  {(formData.type === 'moisture' || formData.type === 'temperature_moisture') && (
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="add-moisture-min">Min Moisture (%)</label>
                        <input
                          type="number"
                          id="add-moisture-min"
                          value={formData.optimalRanges.moisture.min}
                          onChange={(e) => setFormData({
                            ...formData,
                            optimalRanges: {
                              ...formData.optimalRanges,
                              moisture: {
                                ...formData.optimalRanges.moisture,
                                min: parseFloat(e.target.value) || 0
                              }
                            }
                          })}
                          placeholder="12"
                          className="form-input"
                          step="0.1"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="add-moisture-max">Max Moisture (%)</label>
                        <input
                          type="number"
                          id="add-moisture-max"
                          value={formData.optimalRanges.moisture.max}
                          onChange={(e) => setFormData({
                            ...formData,
                            optimalRanges: {
                              ...formData.optimalRanges,
                              moisture: {
                                ...formData.optimalRanges.moisture,
                                max: parseFloat(e.target.value) || 0
                              }
                            }
                          })}
                          placeholder="18"
                          className="form-input"
                          step="0.1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Description (Optional) */}
                <div className="form-row full-width">
                  <div className="form-group">
                    <label htmlFor="add-description">Description (Optional)</label>
                    <textarea
                      id="add-description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Additional notes about this sensor..."
                      className="form-input"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Info Notice */}
                <div className="info-notice">
                  <AlertTriangle size={16} />
                  <span>Sensor will be in "Unpaired" status until physically paired with the device.</span>
                </div>
              </form>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                onClick={handleSubmitAdd}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Sensor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pair Sensor Modal */}
      {showPairModal && selectedSensor && (
        <div className="modal-overlay" onClick={() => setShowPairModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <QrCode size={18} />
                Pair Sensor
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowPairModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmitPair} className="modal-form">
                <div className="pair-info">
                  <div className="pair-sensor-details">
                    <h4>{selectedSensor.name}</h4>
                    <p>Current ID: {selectedSensor.id}</p>
                    <p>Location: {selectedSensor.location}</p>
                  </div>
                  
                  <div className="qr-placeholder">
                    <QrCode size={80} style={{ color: '#F4C430' }} />
                    <p>Scan the QR code on your physical sensor</p>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="qr-code" className="form-label-required">Enter QR Code</label>
                  <input
                    type="text"
                    id="qr-code"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="e.g., QR-ABC123XYZ789"
                    required
                    className="form-input"
                    autoFocus
                  />
                  <span className="form-help">Enter the code from the physical sensor's QR label</span>
                </div>

                <div className="info-notice">
                  <AlertTriangle size={16} />
                  <span>Once paired, the sensor will receive a permanent SENS-xxx ID and begin data collection.</span>
                </div>
              </form>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowPairModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                onClick={handleSubmitPair}
              >
                <QrCode size={16} />
                Pair Sensor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sensors;