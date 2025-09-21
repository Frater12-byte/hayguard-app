import React, { useState } from 'react';
import './MyFarm.css';

const MyFarm = () => {
  const [farmData, setFarmData] = useState({
    name: 'Springfield Farm',
    location: 'Illinois, USA',
    size: '500 acres',
    owner: 'John Smith',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@springfield.farm',
    established: '1985',
    description: 'Family-owned farm specializing in hay production and livestock feed.'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({...farmData});
  const [saveStatus, setSaveStatus] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({...farmData});
    setSaveStatus('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({...farmData});
    setSaveStatus('');
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the actual farm data
      setFarmData({...editedData});
      setIsEditing(false);
      setSaveStatus('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="farm-management">
      <div className="farm-header">
        <h1>Farm Information</h1>
        {!isEditing ? (
          <button className="edit-btn" onClick={handleEdit}>
            Edit Details
          </button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button 
              className="save-btn" 
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {saveStatus === 'success' && (
        <div className="status-message success">
          Farm details updated successfully!
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="status-message error">
          Failed to save changes. Please try again.
        </div>
      )}

      <div className="farm-content">
        <div className="farm-overview-card">
          <h2>Farm Overview</h2>
          <div className="farm-details-grid">
            <div className="detail-item">
              <label>Farm Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{farmData.name}</span>
              )}
            </div>

            <div className="detail-item">
              <label>Location:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{farmData.location}</span>
              )}
            </div>

            <div className="detail-item">
              <label>Size:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{farmData.size}</span>
              )}
            </div>

            <div className="detail-item">
              <label>Owner:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.owner}
                  onChange={(e) => handleInputChange('owner', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{farmData.owner}</span>
              )}
            </div>

            <div className="detail-item">
              <label>Phone:</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{farmData.phone}</span>
              )}
            </div>

            <div className="detail-item">
              <label>Email:</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{farmData.email}</span>
              )}
            </div>

            <div className="detail-item">
              <label>Established:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.established}
                  onChange={(e) => handleInputChange('established', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{farmData.established}</span>
              )}
            </div>

            <div className="detail-item full-width">
              <label>Description:</label>
              {isEditing ? (
                <textarea
                  value={editedData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="edit-textarea"
                  rows="3"
                />
              ) : (
                <span>{farmData.description}</span>
              )}
            </div>
          </div>
        </div>

        <div className="farm-stats-card">
          <h2>Farm Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">📡</div>
              <div className="stat-content">
                <div className="stat-number">12</div>
                <div className="stat-label">Active Sensors</div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <div className="stat-number">1,247</div>
                <div className="stat-label">Total Bales</div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">🌡️</div>
              <div className="stat-content">
                <div className="stat-number">23.5°C</div>
                <div className="stat-label">Avg Temperature</div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">💧</div>
              <div className="stat-content">
                <div className="stat-number">14.2%</div>
                <div className="stat-label">Avg Moisture</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyFarm;
