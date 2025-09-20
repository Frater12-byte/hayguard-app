import React, { useState, useEffect } from 'react';

const FarmInfo = ({ user }) => {
  const [farmData, setFarmData] = useState({
    name: 'Sunshine Valley Farm',
    address: '1234 Farm Road, Springfield, IL 62701',
    phone: '(555) 123-4567',
    email: 'contact@sunshinevalley.com',
    owner: 'John Farmer',
    established: '1995',
    totalAcres: '250',
    latitude: 39.7817,
    longitude: -89.6501
  });
  
  const [weather, setWeather] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Simulate weather API call based on coordinates
    if (farmData.latitude && farmData.longitude) {
      setTimeout(() => {
        setWeather({
          temperature: 75,
          humidity: 62,
          condition: 'Partly Cloudy',
          windSpeed: 8,
          pressure: 30.12,
          visibility: 10,
          uvIndex: 6,
          icon: '⛅'
        });
      }, 1000);
    }
  }, [farmData.latitude, farmData.longitude]);

  const handleSave = () => {
    // Here you would save to your backend
    setIsEditing(false);
    alert('Farm information updated successfully!');
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2>Farm Information & Weather</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3>Farm Details</h3>
          {!isEditing ? (
            <div>
              <p><strong>Farm Name:</strong> {farmData.name}</p>
              <p><strong>Address:</strong> {farmData.address}</p>
              <p><strong>Phone:</strong> {farmData.phone}</p>
              <p><strong>Email:</strong> {farmData.email}</p>
              <p><strong>Owner:</strong> {farmData.owner}</p>
              <p><strong>Established:</strong> {farmData.established}</p>
              <p><strong>Total Acres:</strong> {farmData.totalAcres}</p>
              <p><strong>Coordinates:</strong> {farmData.latitude}, {farmData.longitude}</p>
              <button 
                style={{ background: '#f59e0b', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
                onClick={() => setIsEditing(true)}
              >
                Edit Farm Info
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              <input 
                placeholder="Farm Name" 
                value={farmData.name}
                onChange={(e) => setFarmData({...farmData, name: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input 
                placeholder="Address" 
                value={farmData.address}
                onChange={(e) => setFarmData({...farmData, address: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input 
                placeholder="Phone" 
                value={farmData.phone}
                onChange={(e) => setFarmData({...farmData, phone: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input 
                placeholder="Email" 
                value={farmData.email}
                onChange={(e) => setFarmData({...farmData, email: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input 
                  placeholder="Latitude" 
                  value={farmData.latitude}
                  onChange={(e) => setFarmData({...farmData, latitude: parseFloat(e.target.value)})}
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <input 
                  placeholder="Longitude" 
                  value={farmData.longitude}
                  onChange={(e) => setFarmData({...farmData, longitude: parseFloat(e.target.value)})}
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  style={{ background: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
                  onClick={handleSave}
                >
                  Save
                </button>
                <button 
                  style={{ background: '#6b7280', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3>Current Weather</h3>
          {weather ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>{weather.icon}</div>
              <h2 style={{ margin: '0 0 8px 0' }}>{weather.temperature}°F</h2>
              <p
<p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>{weather.condition}</p>
              <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Humidity:</span>
                  <span>{weather.humidity}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Wind:</span>
                  <span>{weather.windSpeed} mph</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pressure:</span>
                  <span>{weather.pressure} in</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Visibility:</span>
                  <span>{weather.visibility} mi</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>UV Index:</span>
                  <span>{weather.uvIndex}</span>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>
                Location: {farmData.latitude}, {farmData.longitude}
              </p>
            </div>
          ) : (
            <p>Loading weather data...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmInfo;
