import React, { useState, useEffect } from 'react';
import './SensorManagement.css';

const SensorManagement = ({ user }) => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSensors([
        { id: 1, name: 'Sensor-A1', location: 'Barn A - Section 1', baleId: 'B001', status: 'active', temperature: 65.2, moisture: 11.5, battery: 85 },
        { id: 2, name: 'Sensor-A2', location: 'Barn A - Section 2', baleId: 'B002', status: 'active', temperature: 72.1, moisture: 15.2, battery: 72 },
        { id: 3, name: 'Sensor-A3', location: 'Barn A - Section 3', baleId: 'B003', status: 'warning', temperature: 78.9, moisture: 13.1, battery: 45 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredSensors = sensors.filter(sensor =>
    sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading sensors...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2>Sensor Management</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search sensors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', width: '300px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredSensors.map(sensor => (
          <div key={sensor.id} style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3>{sensor.name}</h3>
            <p>Location: {sensor.location}</p>
            <p>Bale: {sensor.baleId}</p>
            <p>Temperature: {sensor.temperature}°F</p>
            <p>Moisture: {sensor.moisture}%</p>
            <p>Battery: {sensor.battery}%</p>
            <p>Status: <span style={{ 
              color: sensor.status === 'active' ? '#10b981' : '#f59e0b',
              fontWeight: 'bold'
            }}>{sensor.status}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensorManagement;
