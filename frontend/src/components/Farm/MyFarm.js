import React, { useState, useEffect } from 'react';
import Loading from '../Common/Loading';
import Notification from '../Common/Notification';

const MyFarm = () => {
  const [farmData, setFarmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setFarmData({
        name: 'Greenfield Farm',
        owner: 'John Smith',
        location: {
          address: '1234 Farm Road',
          city: 'Greenville',
          state: 'Texas',
          zipCode: '75401',
          country: 'United States',
          coordinates: { lat: 32.7767, lng: -96.7970 }
        },
        details: {
          totalAcres: 150,
          cultivatedAcres: 120,
          establishedYear: 2010,
          farmType: 'Crop Production',
          primaryCrops: ['Wheat', 'Corn', 'Soybeans'],
          certifications: ['Organic', 'Non-GMO']
        },
        contact: {
          phone: '+1 (555) 123-4567',
          email: 'info@greenfieldfarm.com',
          website: 'www.greenfieldfarm.com'
        }
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleSave = () => {
    setNotification({
      type: 'success',
      message: 'Farm information updated successfully!'
    });
    setEditMode(false);
  };

  if (loading) {
    return <Loading message="Loading farm information..." />;
  }

  return (
    <div className="page-container">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex justify-end" style={{ marginBottom: 'var(--spacing-6)' }}>
        {editMode ? (
          <div className="flex gap-3">
            <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>
            ✏️ Edit Farm Info
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Farm Overview */}
        <div className="lg:col-span-2">
          <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
            <div className="card-header">
              <h2 className="heading-2">Farm Overview</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <InfoField
                  label="Farm Name"
                  value={farmData.name}
                  editMode={editMode}
                />
                <InfoField
                  label="Owner"
                  value={farmData.owner}
                  editMode={editMode}
                />
                <InfoField
                  label="Farm Type"
                  value={farmData.details.farmType}
                  editMode={editMode}
                />
                <InfoField
                  label="Established"
                  value={farmData.details.establishedYear}
                  editMode={editMode}
                />
                <InfoField
                  label="Total Acres"
                  value={`${farmData.details.totalAcres} acres`}
                  editMode={editMode}
                />
                <InfoField
                  label="Cultivated Acres"
                  value={`${farmData.details.cultivatedAcres} acres`}
                  editMode={editMode}
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="heading-2">Location</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <InfoField
                  label="Address"
                  value={farmData.location.address}
                  editMode={editMode}
                  fullWidth
                />
                <InfoField
                  label="City"
                  value={farmData.location.city}
                  editMode={editMode}
                />
                <InfoField
                  label="State"
                  value={farmData.location.state}
                  editMode={editMode}
                />
                <InfoField
                  label="ZIP Code"
                  value={farmData.location.zipCode}
                  editMode={editMode}
                />
                <InfoField
                  label="Coordinates"
                  value={`${farmData.location.coordinates.lat.toFixed(4)}, ${farmData.location.coordinates.lng.toFixed(4)}`}
                  editMode={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div>
          {/* Quick Stats */}
          <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
            <div className="card-header">
              <h3 className="heading-3">Quick Stats</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-small">Total Sensors</span>
                  <span className="font-weight-600">15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-small">Active Monitoring</span>
                  <span className="font-weight-600">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-small">Bales Monitored</span>
                  <span className="font-weight-600">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-small">Farm Age</span>
                  <span className="font-weight-600">{new Date().getFullYear() - farmData.details.establishedYear} years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="heading-3">Contact Information</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <span className="text-small text-muted">Phone</span>
                  <p className="font-weight-600">{farmData.contact.phone}</p>
                </div>
                <div>
                  <span className="text-small text-muted">Email</span>
                  <p className="font-weight-600">{farmData.contact.email}</p>
                </div>
                <div>
                  <span className="text-small text-muted">Website</span>
                  <p className="font-weight-600">{farmData.contact.website}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="card">
            <div className="card-header">
              <h3 className="heading-3">Certifications</h3>
            </div>
            <div className="card-body">
              <div className="flex flex-wrap gap-2">
                {farmData.details.certifications.map(cert => (
                  <span key={cert} className="status-badge status-active">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .font-weight-600 {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

const InfoField = ({ label, value, editMode, fullWidth = false }) => (
  <div className={`form-group ${fullWidth ? 'md:col-span-2' : ''}`}>
    <label className="form-label">{label}</label>
    {editMode ? (
      <input
        type="text"
        defaultValue={value}
        className="form-input"
      />
    ) : (
      <p className="info-value">{value}</p>
    )}

    <style jsx>{`
      .info-value {
        padding: var(--spacing-3);
        background: var(--gray-50);
        border-radius: var(--border-radius-md);
        border: 1px solid var(--gray-200);
        color: var(--gray-900);
        font-weight: 500;
      }
    `}</style>
  </div>
);

export default MyFarm;
