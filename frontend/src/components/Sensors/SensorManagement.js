import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../Common/Loading';
import Notification from '../Common/Notification';
import AddSensorModal from './AddSensorModal';
import { sensorService } from '../../services/api/sensorService';

const SensorManagement = () => {
  const [sensorsData, setSensorsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const data = await sensorService.getAllSensors();
        setSensorsData(data);
      } catch (error) {
        setNotification({
          type: 'error',
          message: 'Failed to load sensors. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, []);

  const handleAddSensor = (newSensor) => {
    setSensorsData(prev => ({
      ...prev,
      total: prev.total + 1,
      active: prev.active + 1,
      sensors: [...prev.sensors, newSensor]
    }));
    setNotification({
      type: 'success',
      message: `Sensor ${newSensor.name} added successfully!`
    });
  };

  if (loading) {
    return <Loading message="Loading sensors..." />;
  }

  if (!sensorsData) {
    return (
      <div className="page-container">
        <div className="text-center">
          <p>Failed to load sensor data.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex justify-end" style={{ marginBottom: 'var(--spacing-6)' }}>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add New Sensor
        </button>
      </div>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Sensor Stats - 4 KPI boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-2)' }}>🔧</div>
            <h3 className="heading-3">{sensorsData.total}</h3>
            <p className="text-muted">Total Sensors</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-2)' }}>✅</div>
            <h3 className="heading-3">{sensorsData.active}</h3>
            <p className="text-muted">Active</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-2)' }}>⚠️</div>
            <h3 className="heading-3">{sensorsData.inactive}</h3>
            <p className="text-muted">Offline</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-2)' }}>🔋</div>
            <h3 className="heading-3">
              {Math.round(sensorsData.sensors.reduce((sum, s) => sum + s.batteryLevel, 0) / sensorsData.sensors.length)}%
            </h3>
            <p className="text-muted">Avg Battery</p>
          </div>
        </div>
      </div>

      {/* Sensors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sensorsData.sensors.map(sensor => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>

      <AddSensorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSensor}
      />
    </div>
  );
};

const SensorCard = ({ sensor }) => (
  <div className="card">
    <div className="card-body">
      <div className="flex justify-between items-start mb-4">
        <h3 className="heading-3">{sensor.name}</h3>
        <span className={`status-badge status-${sensor.status}`}>
          {sensor.status.toUpperCase()}
        </span>
      </div>
      
      <p className="text-muted mb-3">📍 {sensor.location}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-small text-muted">Temperature</span>
          <p className="font-weight-600">🌡️ {sensor.temperature.toFixed(2)}°C</p>
        </div>
        <div>
          <span className="text-small text-muted">Moisture</span>
          <p className="font-weight-600">💧 {sensor.moisture.toFixed(2)}%</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <span className="text-small text-muted">Battery Level</span>
        <span className={`font-weight-600 ${sensor.batteryLevel < 20 ? 'text-error' : ''}`}>
          🔋 {sensor.batteryLevel}%
        </span>
      </div>

      <p className="text-xs text-muted mb-4">
        Last update: {new Date(sensor.lastUpdate).toLocaleString()}
      </p>

      <Link to={`/sensors/${sensor.id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
        View Details
      </Link>
    </div>

    <style jsx>{`
      .font-weight-600 {
        font-weight: 600;
      }
      
      .text-error {
        color: var(--error-red);
      }
    `}</style>
  </div>
);

export default SensorManagement;
