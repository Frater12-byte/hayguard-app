// src/components/Sensors/SensorDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { 
  ArrowLeft, 
  Thermometer, 
  Droplets, 
  Battery, 
  MapPin,
  Download,
  RefreshCw,
  BarChart3,
  Table,
  AlertTriangle,
  Settings,
  Calendar,
  CheckCircle,
  Save,
  X
} from 'lucide-react';

const SensorDetails = () => {
  const { id } = useParams();
  const { sensors, alerts, getSensorHistoricalData, refreshSensorData, updateSensor } = useData();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState('charts');
  const [tempDays, setTempDays] = useState(7);
  const [moistureDays, setMoistureDays] = useState(7);
  const [selectedDays, setSelectedDays] = useState(7);
  const [historicalData, setHistoricalData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [notification, setNotification] = useState(null);

  const sensor = sensors.find(s => s.id === id);
  const sensorAlerts = alerts.filter(a => a.sensorId === id).sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Get latest battery from historical data
  const latestBatteryLevel = historicalData.length > 0 
    ? Math.round(historicalData[historicalData.length - 1].battery)
    : sensor?.batteryLevel || 0;

  // Initialize form data
  useEffect(() => {
    if (sensor) {
      setEditFormData({
        name: sensor.name,
        location: sensor.location,
        balesMonitored: sensor.balesMonitored || 0,
        optimalRanges: sensor.optimalRanges
      });
    }
  }, [sensor?.id]);

  // Load historical data
  useEffect(() => {
    if (sensor) {
      const maxDays = Math.max(tempDays, moistureDays, selectedDays);
      const data = getSensorHistoricalData(sensor.id, maxDays);
      setHistoricalData(data);
    }
  }, [tempDays, moistureDays, selectedDays, sensor?.id, getSensorHistoricalData]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && sensor) {
      const interval = setInterval(() => {
        refreshSensorData();
        const maxDays = Math.max(tempDays, moistureDays, selectedDays);
        const data = getSensorHistoricalData(sensor.id, maxDays);
        setHistoricalData(data);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, sensor, tempDays, moistureDays, selectedDays, refreshSensorData, getSensorHistoricalData]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveSettings = async () => {
    try {
      await updateSensor(sensor.id, editFormData);
      setIsEditing(false);
      showNotification('Sensor settings updated successfully!');
    } catch (error) {
      showNotification('Error updating sensor settings', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditFormData({
      name: sensor.name,
      location: sensor.location,
      balesMonitored: sensor.balesMonitored || 0,
      optimalRanges: sensor.optimalRanges
    });
    setIsEditing(false);
  };

  const handleExportData = () => {
    if (!historicalData || historicalData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Date', 'Time', 'Temperature (°C)', 'Moisture (%)', 'Battery (%)', 'Status'];
    const csvRows = [
      headers.join(','),
      ...historicalData.map(row => {
        const date = new Date(row.timestamp);
        return [
          date.toLocaleDateString(),
          date.toLocaleTimeString(),
          row.temperature !== null ? row.temperature : 'N/A',
          row.moisture !== null ? row.moisture : 'N/A',
          row.battery,
          'Online'
        ].join(',');
      })
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `sensor_${sensor.id}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simple Chart Component
  const SimpleChart = ({ data, type, days, onDaysChange, optimalRange }) => {
    const now = new Date();
    const cutoffDate = new Date(now - days * 24 * 60 * 60 * 1000);
    
    const filteredData = data
      .filter(d => {
        const value = type === 'temperature' ? d.temperature : d.moisture;
        const recordDate = new Date(d.timestamp);
        return value !== null && recordDate >= cutoffDate;
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const allValues = data
      .filter(d => (type === 'temperature' ? d.temperature : d.moisture) !== null)
      .map(d => type === 'temperature' ? d.temperature : d.moisture);
    
    const dataMax = Math.max(...allValues);
    const dataMin = Math.min(...allValues);
    const range = dataMax - dataMin;
    
    const chartMax = dataMax + (range * 0.15);
    const chartMin = Math.max(0, dataMin - (range * 0.15));

    if (filteredData.length === 0) {
      return (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>{type === 'temperature' ? 'Temperature (°C)' : 'Moisture (%)'}</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => onDaysChange(7)} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: days === 7 ? '#F4C430' : 'white', color: days === 7 ? '#8B4513' : '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>7 Days</button>
              <button onClick={() => onDaysChange(14)} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: days === 14 ? '#F4C430' : 'white', color: days === 14 ? '#8B4513' : '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>14 Days</button>
              <button onClick={() => onDaysChange(30)} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: days === 30 ? '#F4C430' : 'white', color: days === 30 ? '#8B4513' : '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>30 Days</button>
            </div>
          </div>
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
            No data available for this period
          </div>
        </div>
      );
    }

    const aggregateData = (data, targetPoints = 20) => {
      if (data.length <= targetPoints) return data;
      
      const interval = Math.ceil(data.length / targetPoints);
      const aggregated = [];
      
      for (let i = 0; i < data.length; i += interval) {
        const chunk = data.slice(i, Math.min(i + interval, data.length));
        const values = chunk.map(d => type === 'temperature' ? d.temperature : d.moisture);
        
        const weightedSum = values.reduce((sum, v, idx) => {
          const weight = 1 - Math.abs(idx - values.length / 2) / (values.length / 2);
          return sum + v * weight;
        }, 0);
        const weightSum = values.reduce((sum, _, idx) => {
          const weight = 1 - Math.abs(idx - values.length / 2) / (values.length / 2);
          return sum + weight;
        }, 0);
        const avgValue = weightedSum / weightSum;
        
        aggregated.push({
          timestamp: chunk[Math.floor(chunk.length / 2)].timestamp,
          [type]: avgValue,
          battery: chunk[0].battery
        });
      }
      
      return aggregated;
    };

    const displayData = aggregateData(filteredData, 20);

    const createSmoothPath = () => {
      if (displayData.length < 2) return '';
      
      const points = displayData.map((d, i) => {
        const value = type === 'temperature' ? d.temperature : d.moisture;
        const x = 60 + (i / (displayData.length - 1)) * 1120;
        const y = 40 + ((chartMax - value) / (chartMax - chartMin)) * 280;
        return { x, y };
      });

      let path = `M ${points[0].x} ${points[0].y}`;
      
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        const cp1x = current.x + (next.x - current.x) / 3;
        const cp2x = current.x + 2 * (next.x - current.x) / 3;
        path += ` C ${cp1x} ${current.y}, ${cp2x} ${next.y}, ${next.x} ${next.y}`;
      }
      
      return path;
    };

    const optimalRangeTop = optimalRange ? 40 + ((chartMax - optimalRange.max) / (chartMax - chartMin)) * 280 : 0;
    const optimalRangeHeight = optimalRange ? ((optimalRange.max - optimalRange.min) / (chartMax - chartMin)) * 280 : 0;
    const xAxisY = 320;
    const adjustedHeight = Math.min(optimalRangeHeight, xAxisY - optimalRangeTop);

    return (
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #FFF8EB' }}>
          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>{type === 'temperature' ? 'Temperature (°C)' : 'Moisture (%)'}</h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => onDaysChange(7)} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: days === 7 ? '#F4C430' : 'white', color: days === 7 ? '#8B4513' : '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>7 Days</button>
            <button onClick={() => onDaysChange(14)} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: days === 14 ? '#F4C430' : 'white', color: days === 14 ? '#8B4513' : '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>14 Days</button>
            <button onClick={() => onDaysChange(30)} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: days === 30 ? '#F4C430' : 'white', color: days === 30 ? '#8B4513' : '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>30 Days</button>
          </div>
        </div>

        {optimalRange && (
          <div style={{ marginBottom: '16px', fontSize: '14px', color: '#8B4513', fontWeight: 600 }}>
            Optimal Range: {optimalRange.min}{type === 'temperature' ? '°C' : '%'} - {optimalRange.max}{type === 'temperature' ? '°C' : '%'}
          </div>
        )}

        <div style={{ width: '100%', margin: '20px 0', background: '#FFF8EB', borderRadius: '8px', padding: '10px' }}>
          <svg viewBox="0 0 1200 400" style={{ width: '100%', height: 'auto' }}>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <line key={i} x1="60" y1={40 + i * 56} x2="1180" y2={40 + i * 56} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
            ))}

            {[0, 1, 2, 3, 4, 5].map(i => {
              const value = chartMax - ((chartMax - chartMin) / 5) * i;
              return (
                <text key={i} x="50" y={44 + i * 56} textAnchor="end" fontSize="14" fill="#000000" fontWeight="600">
                  {value.toFixed(1)}
                </text>
              );
            })}

            {optimalRange && adjustedHeight > 0 && (
              <>
                <rect x="60" y={optimalRangeTop} width="1120" height={adjustedHeight} fill="rgba(16, 185, 129, 0.15)" stroke="none" />
                <line x1="60" y1={optimalRangeTop} x2="1180" y2={optimalRangeTop} stroke="#10b981" strokeWidth="2" />
                {(optimalRangeTop + adjustedHeight) <= xAxisY && (
                  <line x1="60" y1={optimalRangeTop + adjustedHeight} x2="1180" y2={optimalRangeTop + adjustedHeight} stroke="#10b981" strokeWidth="2" />
                )}
              </>
            )}

            <path d={createSmoothPath()} fill="none" stroke={type === 'temperature' ? '#f59e0b' : '#3b82f6'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {displayData.map((d, i) => {
              const value = type === 'temperature' ? d.temperature : d.moisture;
              const x = 60 + (i / (displayData.length - 1)) * 1120;
              const y = 40 + ((chartMax - value) / (chartMax - chartMin)) * 280;
              const outOfRange = optimalRange && (value > optimalRange.max || value < optimalRange.min);
              
              return (
                <circle key={i} cx={x} cy={y} r="5" fill={outOfRange ? '#ef4444' : (type === 'temperature' ? '#f59e0b' : '#3b82f6')} stroke="white" strokeWidth="2" />
              );
            })}

            {displayData.filter((_, i) => i % Math.ceil(displayData.length / 6) === 0).map((d, i) => {
              const originalIndex = displayData.indexOf(d);
              const x = 60 + (originalIndex / (displayData.length - 1)) * 1120;
              return (
                <text key={i} x={x} y="370" textAnchor="middle" fontSize="14" fill="#000000" fontWeight="600">
                  {new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              );
            })}
          </svg>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', background: '#FFF8EB', borderRadius: '8px', fontSize: '14px', color: '#6b7280' }}>
          Y-axis scaled to 15% above max and 15% below min from last 30 days. Data smoothed to {displayData.length} averaged points for clarity.
        </div>
      </div>
    );
  };

  if (!sensor) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <Link to="/sensors" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8B4513', textDecoration: 'none', marginBottom: '20px' }}>
          <ArrowLeft size={16} />
          Back to Sensors
        </Link>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Sensor not found</h2>
          <p>The sensor you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', padding: '16px 20px',
          borderRadius: '8px', background: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', zIndex: 1000, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {notification.message}
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/sensors" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8B4513', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          <ArrowLeft size={16} />
          Back to Sensors
        </Link>
        <button onClick={handleExportData} style={{ padding: '8px 16px', background: '#F4C430', border: 'none', borderRadius: '6px', color: '#8B4513', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
          <Download size={14} />
          Export Data
        </button>
      </div>

      {/* Header - Battery from latest reading */}
      <div style={{ padding: '16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.5rem', margin: '0 0 8px 0' }}>{sensor.name}</h1>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> {sensor.location}</span>
          <span>ID: {sensor.id}</span>
          <span><Battery size={14} style={{ display: 'inline', marginRight: '4px' }} /> {latestBatteryLevel}%</span>
        </div>
      </div>

      {/* Current Readings */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: '0 0 12px 0' }}>Latest Readings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#FFF8EB', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Thermometer size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TEMPERATURE</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', lineHeight: 1 }}>{sensor.currentTemperature?.toFixed(1) || 'N/A'}°C</div>
              </div>
            </div>
            {sensor.optimalRanges?.temperature && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '4px' }}>Optimal Range</div>
                <div style={{ fontSize: '14px', color: '#8B4513', fontWeight: 700 }}>
                  {sensor.optimalRanges.temperature.min}°C - {sensor.optimalRanges.temperature.max}°C
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {sensor.currentTemperature >= sensor.optimalRanges.temperature.min && sensor.currentTemperature <= sensor.optimalRanges.temperature.max 
                    ? '✓ Within optimal range' 
                    : '⚠ Outside optimal range'}
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: '16px', background: '#FFF8EB', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Droplets size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MOISTURE</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', lineHeight: 1 }}>{sensor.currentMoisture?.toFixed(1) || 'N/A'}%</div>
              </div>
            </div>
            {sensor.optimalRanges?.moisture && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '4px' }}>Optimal Range</div>
                <div style={{ fontSize: '14px', color: '#8B4513', fontWeight: 700 }}>
                  {sensor.optimalRanges.moisture.min}% - {sensor.optimalRanges.moisture.max}%
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {sensor.currentMoisture >= sensor.optimalRanges.moisture.min && sensor.currentMoisture <= sensor.optimalRanges.moisture.max 
                    ? '✓ Within optimal range' 
                    : '⚠ Outside optimal range'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {['charts', 'data', 'alerts', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '12px', background: activeTab === tab ? 'white' : '#FFF8EB',
                border: 'none', borderBottom: activeTab === tab ? '2px solid #F4C430' : '2px solid transparent',
                color: activeTab === tab ? '#8B4513' : '#6b7280', fontWeight: 600, cursor: 'pointer',
                textTransform: 'capitalize', fontSize: '14px'
              }}
            >
              {tab === 'charts' && <BarChart3 size={14} style={{ display: 'inline', marginRight: '6px' }} />}
              {tab === 'data' && <Table size={14} style={{ display: 'inline', marginRight: '6px' }} />}
              {tab === 'alerts' && <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px' }} />}
              {tab === 'settings' && <Settings size={14} style={{ display: 'inline', marginRight: '6px' }} />}
              {tab}
              {tab === 'alerts' && ` (${sensorAlerts.length})`}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px' }}>
          {activeTab === 'charts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <SimpleChart
                data={historicalData}
                type="temperature"
                days={tempDays}
                onDaysChange={setTempDays}
                optimalRange={sensor.optimalRanges?.temperature}
              />
              <SimpleChart
                data={historicalData}
                type="moisture"
                days={moistureDays}
                onDaysChange={setMoistureDays}
                optimalRange={sensor.optimalRanges?.moisture}
              />
            </div>
          )}

          {activeTab === 'data' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Data Table (Latest First)</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setSelectedDays(7)} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: selectedDays === 7 ? '#F4C430' : 'white', color: selectedDays === 7 ? '#8B4513' : '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>7 Days</button>
                  <button onClick={() => setSelectedDays(14)} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: selectedDays === 14 ? '#F4C430' : 'white', color: selectedDays === 14 ? '#8B4513' : '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>14 Days</button>
                  <button onClick={() => setSelectedDays(30)} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: selectedDays === 30 ? '#F4C430' : 'white', color: selectedDays === 30 ? '#8B4513' : '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>30 Days</button>
                </div>
              </div>
              
              <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#FFF8EB' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#8B4513', borderBottom: '2px solid #e5e7eb' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#8B4513', borderBottom: '2px solid #e5e7eb' }}>Time</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#8B4513', borderBottom: '2px solid #e5e7eb' }}>Temperature (°C)</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#8B4513', borderBottom: '2px solid #e5e7eb' }}>Moisture (%)</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#8B4513', borderBottom: '2px solid #e5e7eb' }}>Battery (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.slice().reverse().slice(0, 50).map((reading, index) => {
                      const date = new Date(reading.timestamp);
                      return (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937' }}>{date.toLocaleDateString()}</td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937' }}>{date.toLocaleTimeString()}</td>
                          <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600, color: '#f59e0b' }}>
                            {reading.temperature !== null ? `${reading.temperature.toFixed(1)}°C` : 'N/A'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600, color: '#3b82f6' }}>
                            {reading.moisture !== null ? `${reading.moisture.toFixed(1)}%` : 'N/A'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600, color: reading.battery < 20 ? '#ef4444' : '#6b7280' }}>
                            {Math.round(reading.battery)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div style={{ marginTop: '16px', padding: '12px', background: '#FFF8EB', borderRadius: '8px', fontSize: '14px', color: '#6b7280' }}>
                Showing latest 50 readings from the last {selectedDays} days (most recent first). Latest battery: {latestBatteryLevel}%
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700 }}>Alerts for this Sensor</h3>
              {sensorAlerts.length === 0 ? (
                <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#10b981', fontWeight: 600 }}>
                    ✓ No alerts for this sensor
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sensorAlerts.map(alert => (
                    <div key={alert.id} style={{ padding: '16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', borderLeft: `4px solid ${alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#f59e0b' : '#3b82f6'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#f59e0b' : '#3b82f6', color: 'white' }}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#1f2937', marginBottom: '8px' }}>{alert.message}</div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                        <span>Type: {alert.type}</span>
                        <span>Value: {alert.value}{alert.unit}</span>
                        {alert.threshold && <span>Threshold: {alert.threshold}{alert.unit}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Sensor Configuration</h3>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} style={{ padding: '8px 16px', background: '#F4C430', border: 'none', borderRadius: '6px', color: '#8B4513', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Settings size={14} />
                    Edit Settings
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleCancelEdit} style={{ padding: '8px 16px', background: '#6b7280', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <X size={14} />
                      Cancel
                    </button>
                    <button onClick={handleSaveSettings} style={{ padding: '8px 16px', background: '#F4C430', border: 'none', borderRadius: '6px', color: '#8B4513', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Save size={14} />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              {!isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '16px', background: '#FFF8EB', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', border: '1px solid #e5e7eb' }}>
                    <strong style={{ color: '#8B4513' }}>Sensor ID:</strong>
                    <span>{sensor.id}</span>
                  </div>
                  <div style={{ padding: '16px', background: '#FFF8EB', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', border: '1px solid #e5e7eb' }}>
                    <strong style={{ color: '#8B4513' }}>Name:</strong>
                    <span>{sensor.name}</span>
                  </div>
                  <div style={{ padding: '16px', background: '#FFF8EB', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', border: '1px solid #e5e7eb' }}>
                    <strong style={{ color: '#8B4513' }}>Location:</strong>
                    <span>{sensor.location}</span>
                  </div>
                  <div style={{ padding: '16px', background: '#FFF8EB', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', border: '1px solid #e5e7eb' }}>
                    <strong style={{ color: '#8B4513' }}>Bales Monitored:</strong>
                    <span>{sensor.balesMonitored}</span>
                  </div>
                  {sensor.optimalRanges?.temperature && (
                    <div style={{ padding: '16px', background: '#FFF8EB', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', border: '1px solid #e5e7eb' }}>
                      <strong style={{ color: '#8B4513' }}>Temperature Range:</strong>
                      <span>{sensor.optimalRanges.temperature.min}°C - {sensor.optimalRanges.temperature.max}°C</span>
                    </div>
                  )}
                  {sensor.optimalRanges?.moisture && (
                    <div style={{ padding: '16px', background: '#FFF8EB', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', border: '1px solid #e5e7eb' }}>
                      <strong style={{ color: '#8B4513' }}>Moisture Range:</strong>
                      <span>{sensor.optimalRanges.moisture.min}% - {sensor.optimalRanges.moisture.max}%</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#8B4513', fontSize: '14px' }}>Sensor ID (Cannot change)</label>
                    <input type="text" value={sensor.id} disabled style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#f3f4f6', color: '#6b7280', fontSize: '14px' }} />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#8B4513', fontSize: '14px' }}>Sensor Name *</label>
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                      placeholder="Enter sensor name"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#8B4513', fontSize: '14px' }}>Location *</label>
                    <input
                      type="text"
                      value={editFormData.location || ''}
                      onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                      style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                      placeholder="Enter location"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#8B4513', fontSize: '14px' }}>Bales Monitored</label>
                    <input
                      type="number"
                      min="0"
                      value={editFormData.balesMonitored ?? 0}
                      onChange={(e) => setEditFormData({...editFormData, balesMonitored: parseInt(e.target.value) || 0})}
                      style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                    />
                  </div>

                  {sensor.optimalRanges?.temperature && (
                    <div style={{ padding: '20px', background: '#FFF8EB', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <h4 style={{ margin: '0 0 16px 0', color: '#8B4513', fontSize: '16px', fontWeight: 700 }}>Temperature Range (°C)</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Minimum</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editFormData.optimalRanges?.temperature?.min ?? 0}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              optimalRanges: {
                                ...editFormData.optimalRanges,
                                temperature: { ...editFormData.optimalRanges.temperature, min: parseFloat(e.target.value) || 0 }
                              }
                            })}
                            style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Maximum</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editFormData.optimalRanges?.temperature?.max ?? 30}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              optimalRanges: {
                                ...editFormData.optimalRanges,
                                temperature: { ...editFormData.optimalRanges.temperature, max: parseFloat(e.target.value) || 30 }
                              }
                            })}
                            style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {sensor.optimalRanges?.moisture && (
                    <div style={{ padding: '20px', background: '#FFF8EB', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <h4 style={{ margin: '0 0 16px 0', color: '#8B4513', fontSize: '16px', fontWeight: 700 }}>Moisture Range (%)</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Minimum</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editFormData.optimalRanges?.moisture?.min ?? 12}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              optimalRanges: {
                                ...editFormData.optimalRanges,
                                moisture: { ...editFormData.optimalRanges.moisture, min: parseFloat(e.target.value) || 12 }
                              }
                            })}
                            style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Maximum</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editFormData.optimalRanges?.moisture?.max ?? 18}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              optimalRanges: {
                                ...editFormData.optimalRanges,
                                moisture: { ...editFormData.optimalRanges.moisture, max: parseFloat(e.target.value) || 18 }
                              }
                            })}
                            style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '12px', background: 'rgba(244, 196, 48, 0.1)', borderRadius: '8px', fontSize: '14px', color: '#6b7280' }}>
                    <strong>Note:</strong> Changes persist across pages and are saved to localStorage.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SensorDetails;