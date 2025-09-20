import React, { useState, useEffect } from 'react';

const Alerts = ({ user }) => {
  const [alertSettings, setAlertSettings] = useState({
    temperature: { critical: 80, warning: 75, ok: [60, 70] },
    moisture: { critical: 18, warning: 15, ok: [8, 12] }
  });
  
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    // Simulate active alerts
    setActiveAlerts([
      { id: 1, sensor: 'Sensor-A3', type: 'temperature', value: 78.9, level: 'critical', time: '10 min ago' },
      { id: 2, sensor: 'Sensor-B7', type: 'moisture', value: 19.2, level: 'critical', time: '25 min ago' },
      { id: 3, sensor: 'Sensor-C2', type: 'temperature', value: 76.1, level: 'warning', time: '45 min ago' }
    ]);
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h2>Alert Management</h2>
      
      <div style={{ marginBottom: '32px' }}>
        <h3>Alert Thresholds</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h4>Temperature Alerts</h4>
            <div style={{ marginBottom: '12px' }}>
              <label>Critical (°F): </label>
              <input 
                type="number" 
                value={alertSettings.temperature.critical}
                onChange={(e) => setAlertSettings({
                  ...alertSettings,
                  temperature: { ...alertSettings.temperature, critical: parseInt(e.target.value) }
                })}
                style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label>Warning (°F): </label>
              <input 
                type="number" 
                value={alertSettings.temperature.warning}
                onChange={(e) => setAlertSettings({
                  ...alertSettings,
                  temperature: { ...alertSettings.temperature, warning: parseInt(e.target.value) }
                })}
                style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <p>OK Range: {alertSettings.temperature.ok[0]}°F - {alertSettings.temperature.ok[1]}°F</p>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h4>Moisture Alerts</h4>
            <div style={{ marginBottom: '12px' }}>
              <label>Critical (%): </label>
              <input 
                type="number" 
                value={alertSettings.moisture.critical}
                onChange={(e) => setAlertSettings({
                  ...alertSettings,
                  moisture: { ...alertSettings.moisture, critical: parseInt(e.target.value) }
                })}
                style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label>Warning (%): </label>
              <input 
                type="number" 
                value={alertSettings.moisture.warning}
                onChange={(e) => setAlertSettings({
                  ...alertSettings,
                  moisture: { ...alertSettings.moisture, warning: parseInt(e.target.value) }
                })}
                style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <p>OK Range: {alertSettings.moisture.ok[0]}% - {alertSettings.moisture.ok[1]}%</p>
          </div>
        </div>
      </div>

      <div>
        <h3>Active Alerts</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {activeAlerts.map(alert => (
            <div key={alert.id} style={{ 
              background: alert.level === 'critical' ? '#fef2f2' : '#fef3c7',
              border: `1px solid ${alert.level === 'critical' ? '#ef4444' : '#f59e0b'}`,
              padding: '16px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>{alert.sensor}</strong> - {alert.type} alert
                <p>Value: {alert.value}{alert.type === 'temperature' ? '°F' : '%'} ({alert.level})</p>
              </div>
              <span>{alert.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
