import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Thermometer, 
  Droplets, 
  Battery, 
  MapPin, 
  Calendar, 
  Edit, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Activity,
  Settings,
  Download,
  Save,
  Plus
} from 'lucide-react';
import './SensorDetails.css';

// Mock detailed sensor data with extended information
const mockSensorDetails = {
  'SENS-001': {
    id: 'SENS-001',
    name: 'Barn A Temperature Sensor',
    location: 'Barn A - Section 1',
    type: 'Temperature & Moisture',
    status: 'online',
    description: 'Primary climate monitoring sensor for hay storage area',
    installDate: '2024-03-15',
    lastMaintenance: '2024-08-20',
    firmware: 'v2.1.3',
    currentReadings: {
      temperature: 22.5,
      moisture: 15.2,
      batteryLevel: 85,
      signalStrength: 92,
      timestamp: '2024-09-29T10:30:00Z'
    },
    optimalRanges: {
      temperature: { min: 18, max: 25 },
      moisture: { min: 12, max: 18 }
    },
    recentReadings: [
      { timestamp: '2024-09-29T10:30:00Z', temperature: 22.5, moisture: 15.2 },
      { timestamp: '2024-09-29T10:00:00Z', temperature: 22.3, moisture: 15.4 },
      { timestamp: '2024-09-29T09:30:00Z', temperature: 22.1, moisture: 15.8 },
      { timestamp: '2024-09-29T09:00:00Z', temperature: 21.9, moisture: 16.1 },
      { timestamp: '2024-09-29T08:30:00Z', temperature: 21.7, moisture: 16.3 },
      { timestamp: '2024-09-29T08:00:00Z', temperature: 21.5, moisture: 16.5 }
    ],
    alerts: [
      {
        id: 1,
        type: 'info',
        message: 'Sensor readings are within optimal range',
        timestamp: '2024-09-29T10:30:00Z'
      }
    ]
  },
  'SENS-002': {
    id: 'SENS-002',
    name: 'Field 1 Moisture Monitor',
    location: 'Field 1 - North Section',
    type: 'Moisture Only',
    status: 'warning',
    description: 'Moisture monitoring for field hay storage',
    installDate: '2024-04-10',
    lastMaintenance: '2024-07-15',
    firmware: 'v2.0.8',
    currentReadings: {
      temperature: null,
      moisture: 19.8,
      batteryLevel: 45,
      signalStrength: 78,
      timestamp: '2024-09-29T10:25:00Z'
    },
    optimalRanges: {
      temperature: null,
      moisture: { min: 10, max: 16 }
    },
    recentReadings: [
      { timestamp: '2024-09-29T10:25:00Z', temperature: null, moisture: 19.8 },
      { timestamp: '2024-09-29T09:55:00Z', temperature: null, moisture: 19.5 },
      { timestamp: '2024-09-29T09:25:00Z', temperature: null, moisture: 19.2 },
      { timestamp: '2024-09-29T08:55:00Z', temperature: null, moisture: 18.9 },
      { timestamp: '2024-09-29T08:25:00Z', temperature: null, moisture: 18.6 },
      { timestamp: '2024-09-29T07:55:00Z', temperature: null, moisture: 18.3 }
    ],
    alerts: [
      {
        id: 2,
        type: 'warning',
        message: 'Moisture level above optimal range (19.8% > 16%)',
        timestamp: '2024-09-29T10:25:00Z'
      },
      {
        id: 3,
        type: 'warning',
        message: 'Battery level low (45%)',
        timestamp: '2024-09-29T09:00:00Z'
      }
    ]
  },
  'SENS-003': {
    id: 'SENS-003',
    name: 'Barn B Climate Monitor',
    location: 'Barn B - Storage Area',
    type: 'Temperature & Moisture',
    status: 'offline',
    description: 'Secondary climate monitoring for additional storage',
    installDate: '2024-02-28',
    lastMaintenance: '2024-06-10',
    firmware: 'v1.9.2',
    currentReadings: {
      temperature: null,
      moisture: null,
      batteryLevel: 12,
      signalStrength: 0,
      timestamp: '2024-09-29T08:15:00Z'
    },
    optimalRanges: {
      temperature: { min: 20, max: 28 },
      moisture: { min: 14, max: 20 }
    },
    recentReadings: [
      { timestamp: '2024-09-29T08:15:00Z', temperature: null, moisture: null },
      { timestamp: '2024-09-29T07:45:00Z', temperature: 24.1, moisture: 17.8 },
      { timestamp: '2024-09-29T07:15:00Z', temperature: 24.0, moisture: 17.9 },
      { timestamp: '2024-09-29T06:45:00Z', temperature: 23.8, moisture: 18.1 },
      { timestamp: '2024-09-29T06:15:00Z', temperature: 23.6, moisture: 18.3 },
      { timestamp: '2024-09-29T05:45:00Z', temperature: 23.4, moisture: 18.5 }
    ],
    alerts: [
      {
        id: 4,
        type: 'error',
        message: 'Sensor offline - no data received',
        timestamp: '2024-09-29T08:15:00Z'
      },
      {
        id: 5,
        type: 'error',
        message: 'Critical battery level (12%)',
        timestamp: '2024-09-29T07:30:00Z'
      }
    ]
  }
};

// Edit Sensor Modal Component
const EditSensorModal = ({ sensor, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    tempMin: 18,
    tempMax: 25,
    moistureMin: 12,
    moistureMax: 18
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (sensor && isOpen) {
      setFormData({
        name: sensor.name || '',
        location: sensor.location || '',
        description: sensor.description || '',
        tempMin: sensor.optimalRanges?.temperature?.min || 18,
        tempMax: sensor.optimalRanges?.temperature?.max || 25,
        moistureMin: sensor.optimalRanges?.moisture?.min || 12,
        moistureMax: sensor.optimalRanges?.moisture?.max || 18
      });
    }
  }, [sensor, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Sensor name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (sensor?.optimalRanges?.temperature && formData.tempMin >= formData.tempMax) {
      newErrors.temperature = 'Minimum temperature must be less than maximum';
    }
    
    if (sensor?.optimalRanges?.moisture && formData.moistureMin >= formData.moistureMax) {
      newErrors.moisture = 'Minimum moisture must be less than maximum';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const updatedSensor = {
      ...sensor,
      name: formData.name,
      location: formData.location,
      description: formData.description,
      optimalRanges: {
        temperature: sensor?.optimalRanges?.temperature ? {
          min: Number(formData.tempMin),
          max: Number(formData.tempMax)
        } : null,
        moisture: sensor?.optimalRanges?.moisture ? {
          min: Number(formData.moistureMin),
          max: Number(formData.moistureMax)
        } : null
      }
    };
    
    onSave(updatedSensor);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Edit Sensor</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Sensor Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={errors.location ? 'error' : ''}
              />
              {errors.location && <span className="error-text">{errors.location}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          
          {sensor?.optimalRanges?.temperature && (
            <div className="form-group">
              <label>Optimal Temperature Range (°C)</label>
              <div className="range-inputs">
                <div className="range-input">
                  <label htmlFor="tempMin">Min</label>
                  <input
                    type="number"
                    id="tempMin"
                    name="tempMin"
                    value={formData.tempMin}
                    onChange={handleInputChange}
                    step="0.1"
                  />
                </div>
                <span className="range-separator">to</span>
                <div className="range-input">
                  <label htmlFor="tempMax">Max</label>
                  <input
                    type="number"
                    id="tempMax"
                    name="tempMax"
                    value={formData.tempMax}
                    onChange={handleInputChange}
                    step="0.1"
                  />
                </div>
              </div>
              {errors.temperature && <span className="error-text">{errors.temperature}</span>}
            </div>
          )}
          
          {sensor?.optimalRanges?.moisture && (
            <div className="form-group">
              <label>Optimal Moisture Range (%)</label>
              <div className="range-inputs">
                <div className="range-input">
                  <label htmlFor="moistureMin">Min</label>
                  <input
                    type="number"
                    id="moistureMin"
                    name="moistureMin"
                    value={formData.moistureMin}
                    onChange={handleInputChange}
                    step="0.1"
                  />
                </div>
                <span className="range-separator">to</span>
                <div className="range-input">
                  <label htmlFor="moistureMax">Max</label>
                  <input
                    type="number"
                    id="moistureMax"
                    name="moistureMax"
                    value={formData.moistureMax}
                    onChange={handleInputChange}
                    step="0.1"
                  />
                </div>
              </div>
              {errors.moisture && <span className="error-text">{errors.moisture}</span>}
            </div>
          )}
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ sensor, isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Delete Sensor</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="delete-warning">
            <AlertTriangle className="warning-icon" size={48} />
            <h3>Are you sure you want to delete this sensor?</h3>
            <p>
              This action will permanently delete <strong>{sensor?.name}</strong> and all its historical data. 
              This cannot be undone.
            </p>
          </div>
          
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={onConfirm}>
              <Trash2 size={16} />
              Delete Sensor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SensorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sensor, setSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('readings');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchSensorDetails = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // First check localStorage for updated sensors
      const storedSensors = localStorage.getItem('hayguard_sensors');
      if (storedSensors) {
        const parsedSensors = JSON.parse(storedSensors);
        const foundSensor = parsedSensors.find(s => s.id === id);
        if (foundSensor) {
          setSensor(foundSensor);
          setLoading(false);
          return;
        }
      }
      
      // Fallback to mock data
      const sensorData = mockSensorDetails[id];
      if (sensorData) {
        setSensor(sensorData);
      }
      setLoading(false);
    };

    fetchSensorDetails();
  }, [id]);

  const handleEditSensor = (updatedSensor) => {
    // Update local state
    setSensor(updatedSensor);
    
    // Update localStorage
    const storedSensors = localStorage.getItem('hayguard_sensors');
    let sensors = storedSensors ? JSON.parse(storedSensors) : Object.values(mockSensorDetails);
    
    const sensorIndex = sensors.findIndex(s => s.id === updatedSensor.id);
    if (sensorIndex !== -1) {
      sensors[sensorIndex] = updatedSensor;
    } else {
      sensors.push(updatedSensor);
    }
    
    localStorage.setItem('hayguard_sensors', JSON.stringify(sensors));
    
    // Show success message (you can implement a toast notification)
    alert('Sensor updated successfully!');
  };

  const handleDeleteSensor = () => {
    // Remove from localStorage
    const storedSensors = localStorage.getItem('hayguard_sensors');
    let sensors = storedSensors ? JSON.parse(storedSensors) : Object.values(mockSensorDetails);
    
    sensors = sensors.filter(s => s.id !== sensor.id);
    localStorage.setItem('hayguard_sensors', JSON.stringify(sensors));
    
    // Navigate back to sensors list
    navigate('/sensors');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="status-icon status-online" size={16} />;
      case 'warning':
        return <AlertTriangle className="status-icon status-warning" size={16} />;
      case 'offline':
        return <X className="status-icon status-offline" size={16} />;
      default:
        return <X className="status-icon status-offline" size={16} />;
    }
  };

  const getBatteryColor = (level) => {
    if (level > 60) return 'good';
    if (level > 30) return 'medium';
    return 'low';
  };

  const getSignalColor = (strength) => {
    if (strength > 80) return 'excellent';
    if (strength > 60) return 'good';
    if (strength > 40) return 'fair';
    return 'poor';
  };

  const isInOptimalRange = (value, range) => {
    if (!value || !range) return null;
    return value >= range.min && value <= range.max;
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="sensor-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading sensor details...</p>
        </div>
      </div>
    );
  }

  if (!sensor) {
    return (
      <div className="sensor-details-page">
        <div className="error-container">
          <h2>Sensor Not Found</h2>
          <p>The sensor with ID "{id}" could not be found.</p>
          <Link to="/sensors" className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Sensors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sensor-details-page">
      {/* Compact Header */}
      <div className="page-header">
        <div className="header-top">
          <Link to="/sensors" className="back-link">
            <ArrowLeft size={16} />
            Sensors
          </Link>
          
          <div className="header-actions">
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit size={14} />
              Edit
            </button>
            <button className="btn btn-sm btn-secondary">
              <Download size={14} />
              Export
            </button>
            <button 
              className="btn btn-sm btn-danger"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
        
        <div className="header-info">
          <div className="sensor-title">
            <h1>{sensor.name}</h1>
            <div className="status-badge">
              {getStatusIcon(sensor.status)}
              <span className={`status-text status-${sensor.status}`}>
                {sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="sensor-meta">
            <span className="sensor-id">{sensor.id}</span>
            <div className="sensor-location">
              <MapPin size={14} />
              <span>{sensor.location}</span>
            </div>
            <span className="sensor-type">{sensor.type}</span>
          </div>
        </div>
      </div>

      {/* Compact Readings Grid */}
      <div className="readings-grid">
        {sensor.currentReadings.temperature !== null && (
          <div className="metric-card">
            <div className="metric-icon temperature">
              <Thermometer size={20} />
            </div>
            <div className="metric-content">
              <div className="metric-value">{sensor.currentReadings.temperature.toFixed(1)}°C</div>
              <div className="metric-label">Temperature</div>
              <div className={`metric-status ${
                isInOptimalRange(sensor.currentReadings.temperature, sensor.optimalRanges.temperature) 
                  ? 'optimal' : 'warning'
              }`}>
                {isInOptimalRange(sensor.currentReadings.temperature, sensor.optimalRanges.temperature) 
                  ? 'Optimal' : 'Out of range'}
              </div>
            </div>
          </div>
        )}

        {sensor.currentReadings.moisture !== null && (
          <div className="metric-card">
            <div className="metric-icon moisture">
              <Droplets size={20} />
            </div>
            <div className="metric-content">
              <div className="metric-value">{sensor.currentReadings.moisture.toFixed(1)}%</div>
              <div className="metric-label">Moisture</div>
              <div className={`metric-status ${
                isInOptimalRange(sensor.currentReadings.moisture, sensor.optimalRanges.moisture) 
                  ? 'optimal' : 'warning'
              }`}>
                {isInOptimalRange(sensor.currentReadings.moisture, sensor.optimalRanges.moisture) 
                  ? 'Optimal' : 'Out of range'}
              </div>
            </div>
          </div>
        )}

        <div className="metric-card">
          <div className="metric-icon battery">
            <Battery size={20} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{sensor.currentReadings.batteryLevel}%</div>
            <div className="metric-label">Battery</div>
            <div className={`metric-status ${getBatteryColor(sensor.currentReadings.batteryLevel)}`}>
              {sensor.currentReadings.batteryLevel > 60 ? 'Good' : 
               sensor.currentReadings.batteryLevel > 30 ? 'Medium' : 'Low'}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon signal">
            <Activity size={20} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{sensor.currentReadings.signalStrength}%</div>
            <div className="metric-label">Signal</div>
            <div className={`metric-status ${getSignalColor(sensor.currentReadings.signalStrength)}`}>
              {sensor.currentReadings.signalStrength > 80 ? 'Excellent' :
               sensor.currentReadings.signalStrength > 60 ? 'Good' :
               sensor.currentReadings.signalStrength > 40 ? 'Fair' : 'Poor'}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Tabbed Content */}
      <div className="details-card">
        <div className="tab-nav">
          <button 
            className={`tab-btn ${activeTab === 'readings' ? 'active' : ''}`}
            onClick={() => setActiveTab('readings')}
          >
            Recent Data
          </button>
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Information
          </button>
          <button 
            className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            Alerts ({sensor.alerts.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'readings' && (
            <div className="readings-table">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    {sensor.currentReadings.temperature !== null && <th>Temp (°C)</th>}
                    {sensor.currentReadings.moisture !== null && <th>Moisture (%)</th>}
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sensor.recentReadings.slice(0, 8).map((reading, index) => (
                    <tr key={index}>
                      <td>{formatTime(reading.timestamp)}</td>
                      {sensor.currentReadings.temperature !== null && (
                        <td>{reading.temperature ? reading.temperature.toFixed(1) : '-'}</td>
                      )}
                      {sensor.currentReadings.moisture !== null && (
                        <td>{reading.moisture ? reading.moisture.toFixed(1) : '-'}</td>
                      )}
                      <td>
                        <span className={`status-dot ${reading.temperature !== null || reading.moisture !== null ? 'online' : 'offline'}`}></span>
                        {reading.temperature !== null || reading.moisture !== null ? 'Online' : 'Offline'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="info-grid">
              <div className="info-section">
                <h4>Basic Information</h4>
                <div className="info-list">
                  <div className="info-row">
                    <span>Sensor ID</span>
                    <span>{sensor.id}</span>
                  </div>
                  <div className="info-row">
                    <span>Location</span>
                    <span>{sensor.location}</span>
                  </div>
                  <div className="info-row">
                    <span>Type</span>
                    <span>{sensor.type}</span>
                  </div>
                  <div className="info-row">
                    <span>Description</span>
                    <span>{sensor.description}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>Technical Details</h4>
                <div className="info-list">
                  <div className="info-row">
                    <span>Firmware</span>
                    <span>{sensor.firmware}</span>
                  </div>
                  <div className="info-row">
                    <span>Installed</span>
                    <span>{new Date(sensor.installDate).toLocaleDateString()}</span>
                  </div>
                  <div className="info-row">
                    <span>Maintenance</span>
                    <span>{new Date(sensor.lastMaintenance).toLocaleDateString()}</span>
                  </div>
                  <div className="info-row">
                    <span>Last Update</span>
                    <span>{formatTime(sensor.currentReadings.timestamp)}</span>
                  </div>
                </div>
              </div>

              {(sensor.optimalRanges.temperature || sensor.optimalRanges.moisture) && (
                <div className="info-section">
                  <h4>Optimal Ranges</h4>
                  <div className="ranges-grid">
                    {sensor.optimalRanges.temperature && (
                      <div className="range-item">
                        <span>Temperature</span>
                        <span>{sensor.optimalRanges.temperature.min}°C - {sensor.optimalRanges.temperature.max}°C</span>
                      </div>
                    )}
                    {sensor.optimalRanges.moisture && (
                      <div className="range-item">
                        <span>Moisture</span>
                        <span>{sensor.optimalRanges.moisture.min}% - {sensor.optimalRanges.moisture.max}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="alerts-list">
              {sensor.alerts.map(alert => (
                <div key={alert.id} className={`alert-item alert-${alert.type}`}>
                  <div className="alert-icon">
                    {alert.type === 'error' && <X size={16} />}
                    {alert.type === 'warning' && <AlertTriangle size={16} />}
                    {alert.type === 'info' && <CheckCircle size={16} />}
                  </div>
                  <div className="alert-content">
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-time">{formatDateTime(alert.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditSensorModal
        sensor={sensor}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSensor}
      />

      <DeleteConfirmModal
        sensor={sensor}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSensor}
      />
    </div>
  );
};

export default SensorDetails;