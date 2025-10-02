import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { MapPin, Edit2, Save, X, Cloud, Droplets, Wind, Eye, Calendar, Users, Sprout } from 'lucide-react';
import './MyFarm.css';

const MyFarm = () => {
  const { farmInfo, updateFarmInfo, sensors } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState(farmInfo);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [teamMemberCount, setTeamMemberCount] = useState(0);

  // Load team member count from Team section's localStorage
  useEffect(() => {
    const loadTeamMemberCount = () => {
      try {
        const stored = localStorage.getItem('hayguard_team_members');
        if (stored) {
          const teamMembers = JSON.parse(stored);
          const activeMembers = teamMembers.filter(m => m.status === 'active');
          setTeamMemberCount(activeMembers.length);
        }
      } catch (error) {
        console.error('Error loading team member count:', error);
        setTeamMemberCount(0);
      }
    };

    loadTeamMemberCount();

    // Listen for team updates
    const handleTeamUpdate = () => {
      loadTeamMemberCount();
    };

    window.addEventListener('teamMembersUpdated', handleTeamUpdate);
    
    // Poll for changes every 2 seconds
    const interval = setInterval(loadTeamMemberCount, 2000);

    return () => {
      window.removeEventListener('teamMembersUpdated', handleTeamUpdate);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setFormData(farmInfo);
    if (farmInfo.location?.latitude && farmInfo.location?.longitude) {
      fetchWeather(farmInfo.location.latitude, farmInfo.location.longitude);
    }
  }, [farmInfo]);

  const showNotification = (message, type = 'success') => {
    if (!message) {
      console.error('Notification called without message');
      return;
    }
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchWeather = async (lat, lon) => {
    setTimeout(() => {
      setWeather({
        temperature: 22,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 8,
        visibility: '10 miles',
        icon: '⛅'
      });
    }, 500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      let processedValue = value;
      if ((child === 'latitude' || child === 'longitude') && value !== '') {
        processedValue = parseFloat(value);
      }
      
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: processedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateFarmInfo(formData);
      
      if (formData.location?.latitude && formData.location?.longitude) {
        fetchWeather(formData.location.latitude, formData.location.longitude);
      }

      setIsEditing(false);
      showNotification('Farm information updated successfully!', 'success');
    } catch (error) {
      console.error('Update error:', error);
      showNotification('Failed to update farm information. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(farmInfo);
    setIsEditing(false);
  };

  const activeSensors = sensors?.filter(s => s.status === 'online').length || 0;
  const totalSensors = sensors?.length || 0;

  if (!farmInfo) {
    return <div className="farm-loading">Loading farm information...</div>;
  }

  return (
    <div className="my-farm-page">
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

      <div className="farm-header">
        <div className="farm-header-info">
          <h1>{farmInfo.name}</h1>
          <div className="farm-header-subtitle">
            <MapPin size={16} />
            <span>{farmInfo.location?.address || 'Location not set'}</span>
          </div>
        </div>
        <div className="farm-header-actions">
          {!isEditing ? (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              <Edit2 size={16} />
              Edit Farm Info
            </button>
          ) : (
            <>
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={loading}
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="btn btn-outline" 
                onClick={handleCancel}
                disabled={loading}
              >
                <X size={16} />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="farm-stats">
        <div className="stat-card">
          <div className="stat-label">Total Acres</div>
          <div className="stat-value">
            <Sprout size={24} style={{ color: 'var(--primary-color)' }} />
            {farmInfo.details?.totalAcres || 0}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Sensors</div>
          <div className="stat-value">
            <span style={{ color: 'var(--success-green)' }}>{activeSensors}</span>
            <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ {totalSensors}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Team Members</div>
          <div className="stat-value">
            <Users size={24} style={{ color: 'var(--primary-color)' }} />
            {teamMemberCount}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Established</div>
          <div className="stat-value">
            <Calendar size={24} style={{ color: 'var(--primary-color)' }} />
            {farmInfo.details?.establishedYear || 'N/A'}
          </div>
        </div>
      </div>

      <div className="farm-content">
        <div className="farm-details-section">
          <div className="section-header">
            <h2>Farm Details</h2>
          </div>
          <div className="section-body">
            {!isEditing ? (
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Farm Name</div>
                  <div className="info-value">{farmInfo.name}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Owner</div>
                  <div className="info-value">{farmInfo.details?.owner || 'Not set'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Manager</div>
                  <div className="info-value">{farmInfo.details?.manager || 'Not set'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Farm Type</div>
                  <div className="info-value">{farmInfo.details?.farmType || 'Not set'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Total Acres</div>
                  <div className="info-value">{farmInfo.details?.totalAcres || 0} acres</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Established Year</div>
                  <div className="info-value">{farmInfo.details?.establishedYear || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Phone</div>
                  <div className="info-value info-value-muted">{farmInfo.details?.phone || 'Not set'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Email</div>
                  <div className="info-value info-value-muted">{farmInfo.details?.email || 'Not set'}</div>
                </div>
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="info-label">Address</div>
                  <div className="info-value info-value-muted">{farmInfo.location?.address || 'Not set'}</div>
                </div>
              </div>
            ) : (
              <form className="farm-edit-form">
                <div className="form-group">
                  <label className="form-label">Farm Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Owner</label>
                    <input
                      type="text"
                      name="details.owner"
                      value={formData.details?.owner || ''}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Manager</label>
                    <input
                      type="text"
                      name="details.manager"
                      value={formData.details?.manager || ''}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Farm Type</label>
                    <input
                      type="text"
                      name="details.farmType"
                      value={formData.details?.farmType || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g., Mixed Crop, Livestock"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Acres</label>
                    <input
                      type="number"
                      name="details.totalAcres"
                      value={formData.details?.totalAcres || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Established Year</label>
                    <input
                      type="number"
                      name="details.establishedYear"
                      value={formData.details?.establishedYear || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="details.phone"
                      value={formData.details?.phone || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="details.email"
                    value={formData.details?.email || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="contact@farm.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location?.address || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="1234 Farm Road, City, State ZIP"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      name="location.latitude"
                      value={formData.location?.latitude || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      step="0.000001"
                      placeholder="40.7128"
                    />
                    <span className="form-help">Used for weather data</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      name="location.longitude"
                      value={formData.location?.longitude || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      step="0.000001"
                      placeholder="-74.0060"
                    />
                    <span className="form-help">Used for weather data</span>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        <div>
          <div className="geolocation-section">
            <div className="section-header">
              <h2>Geolocation</h2>
            </div>
            <div className="map-preview">
              <div className="map-placeholder">
                <MapPin size={48} />
                <p>Map Preview</p>
                {farmInfo.location?.latitude && farmInfo.location?.longitude ? (
                  <p style={{ fontSize: '12px' }}>
                    {parseFloat(farmInfo.location.latitude).toFixed(4)}°, {parseFloat(farmInfo.location.longitude).toFixed(4)}°
                  </p>
                ) : (
                  <p style={{ fontSize: '12px' }}>Add coordinates to see location</p>
                )}
              </div>
            </div>
            <div className="coordinates-display">
              <div className="coordinate-item">
                <div className="coordinate-label">Latitude</div>
                <div className="coordinate-value">
                  {farmInfo.location?.latitude ? parseFloat(farmInfo.location.latitude).toFixed(6) : 'Not set'}
                </div>
              </div>
              <div className="coordinate-item">
                <div className="coordinate-label">Longitude</div>
                <div className="coordinate-value">
                  {farmInfo.location?.longitude ? parseFloat(farmInfo.location.longitude).toFixed(6) : 'Not set'}
                </div>
              </div>
            </div>
          </div>

          {weather && farmInfo.location?.latitude && (
            <div className="weather-widget">
              <div className="section-header">
                <h2>Current Weather</h2>
              </div>
              <div className="weather-current">
                <div style={{ fontSize: '48px' }}>{weather.icon}</div>
                <div className="weather-temp">{weather.temperature}°C</div>
                <div className="weather-condition">{weather.condition}</div>
              </div>
              <div className="weather-details">
                <div className="weather-detail-item">
                  <Droplets size={16} />
                  <span>Humidity: {weather.humidity}%</span>
                </div>
                <div className="weather-detail-item">
                  <Wind size={16} />
                  <span>Wind: {weather.windSpeed} mph</span>
                </div>
                <div className="weather-detail-item">
                  <Eye size={16} />
                  <span>Visibility: {weather.visibility}</span>
                </div>
                <div className="weather-detail-item">
                  <Cloud size={16} />
                  <span>Conditions: {weather.condition}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyFarm;