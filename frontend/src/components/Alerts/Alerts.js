import React, { useState } from 'react';

const Alerts = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [alerts] = useState([
    {
      id: 1,
      type: 'critical',
      title: 'High Temperature Alert',
      message: 'Sensor HB-2024-002 detected 29.5°C in South Field B',
      sensor: 'HB-2024-002',
      location: 'South Field B',
      timestamp: '2024-09-21T14:05:00Z',
      value: 29.5,
      unit: '°C',
      threshold: 25.0,
      status: 'active',
      gravity: 'Critical - Immediate Action Required'
    },
    {
      id: 2,
      type: 'critical',
      title: 'Moisture Level Critical',
      message: 'Sensor HB-2024-001 shows moisture at 18.2% in North Field A',
      sensor: 'HB-2024-001',
      location: 'North Field A',
      timestamp: '2024-09-21T13:45:00Z',
      value: 18.2,
      unit: '%',
      threshold: 15.0,
      status: 'active',
      gravity: 'Critical - Risk of Combustion'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Temperature Rising',
      message: 'Sensor HB-2024-003 temperature increasing rapidly',
      sensor: 'HB-2024-003',
      location: 'East Field C',
      timestamp: '2024-09-21T13:20:00Z',
      value: 23.8,
      unit: '°C',
      threshold: 25.0,
      status: 'monitoring',
      gravity: 'Warning - Monitor Closely'
    },
    {
      id: 4,
      type: 'warning',
      title: 'Sensor Battery Low',
      message: 'Sensor HB-2024-004 battery level at 15%',
      sensor: 'HB-2024-004',
      location: 'West Field D',
      timestamp: '2024-09-21T12:30:00Z',
      value: 15,
      unit: '%',
      threshold: 20,
      status: 'maintenance',
      gravity: 'Warning - Maintenance Required'
    },
    {
      id: 5,
      type: 'info',
      title: 'Sensor Deployed',
      message: 'New sensor SENS-005 successfully deployed and operational',
      sensor: 'SENS-005',
      location: 'Central Barn',
      timestamp: '2024-09-21T11:00:00Z',
      value: null,
      unit: '',
      threshold: null,
      status: 'resolved',
      gravity: 'Info - Normal Activity'
    },
    {
      id: 6,
      type: 'info',
      title: 'System Update',
      message: 'Firmware update completed successfully on 8 sensors',
      sensor: 'Multiple',
      location: 'All Fields',
      timestamp: '2024-09-21T09:15:00Z',
      value: null,
      unit: '',
      threshold: null,
      status: 'resolved',
      gravity: 'Info - System Maintenance'
    }
  ]);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return alertTime.toLocaleDateString();
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#ef4444';
      case 'monitoring': return '#f59e0b';
      case 'maintenance': return '#8b5cf6';
      case 'resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusBackground = (status) => {
    switch (status) {
      case 'active': return '#fef2f2';
      case 'monitoring': return '#fffbeb';
      case 'maintenance': return '#faf5ff';
      case 'resolved': return '#f0fdf4';
      default: return '#f8fafc';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (selectedFilter === 'all') return true;
    return alert.type === selectedFilter;
  });

  const alertCounts = {
    all: alerts.length,
    critical: alerts.filter(a => a.type === 'critical').length,
    warning: alerts.filter(a => a.type === 'warning').length,
    info: alerts.filter(a => a.type === 'info').length
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1>Alert Management</h1>
        <p style={{ color: '#6b7280' }}>Monitor and manage farm alerts and notifications</p>
      </div>

      {/* Alert Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px' }}>
            {alertCounts.all}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Total Alerts</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>
            {alertCounts.critical}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Critical</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
            {alertCounts.warning}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Warning</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
            {alertCounts.info}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Info</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'all', label: 'All Alerts', count: alertCounts.all },
              { key: 'critical', label: 'Critical', count: alertCounts.critical },
              { key: 'warning', label: 'Warning', count: alertCounts.warning },
              { key: 'info', label: 'Info', count: alertCounts.info }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                style={{
                  padding: '8px 16px',
                  border: selectedFilter === filter.key ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '20px',
                  background: selectedFilter === filter.key ? '#eff6ff' : 'white',
                  color: selectedFilter === filter.key ? '#1e40af' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {filter.label}
                <span style={{
                  background: selectedFilter === filter.key ? '#3b82f6' : '#e5e7eb',
                  color: selectedFilter === filter.key ? 'white' : '#6b7280',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
          <h2 style={{ margin: '0' }}>
            {selectedFilter === 'all' ? 'All Alerts' : `${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Alerts`} 
            ({filteredAlerts.length})
          </h2>
        </div>
        
        {filteredAlerts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>No alerts found</h3>
            <p style={{ color: '#9ca3af' }}>No alerts match the current filter.</p>
          </div>
        ) : (
          <div>
            {filteredAlerts.map(alert => (
              <div key={alert.id} style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid #f3f4f6',
                borderLeft: `4px solid ${alert.type === 'critical' ? '#ef4444' : alert.type === 'warning' ? '#f59e0b' : '#3b82f6'}`,
                background: alert.type === 'critical' ? '#fef2f2' : alert.type === 'warning' ? '#fffbeb' : '#eff6ff',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0px)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{getAlertIcon(alert.type)}</span>
                      <div>
                        <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                          {alert.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                          <span style={{ 
                            background: getStatusBackground(alert.status),
                            color: getStatusColor(alert.status),
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {alert.status}
                          </span>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>
                            {getTimeAgo(alert.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ margin: '0', color: '#374151', fontSize: '14px', marginBottom: '8px' }}>
                        {alert.message}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '14px', color: '#6b7280' }}>
                        <div><strong>Sensor:</strong> {alert.sensor}</div>
                        <div><strong>Location:</strong> {alert.location}</div>
                        {alert.value !== null && (
                          <div><strong>Current Value:</strong> {alert.value} {alert.unit}</div>
                        )}
                        {alert.threshold !== null && (
                          <div><strong>Threshold:</strong> {alert.threshold} {alert.unit}</div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: '12px', 
                      background: 'rgba(255, 255, 255, 0.7)', 
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: alert.type === 'critical' ? '#dc2626' : alert.type === 'warning' ? '#d97706' : '#2563eb'
                    }}>
                      <strong>Priority:</strong> {alert.gravity}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
                    <button style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      View Details
                    </button>
                    {alert.status === 'active' && (
                      <button style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;