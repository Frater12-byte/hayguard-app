import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  // Quick API test - remove after debugging
  const testAPI = async () => {
    console.log("Testing API connection...");
    try {
      const response = await fetch("https://hayguard-app-backend.vercel.app");
      const data = await response.json();
      console.log("Backend health check:", data);
    } catch (error) {
      console.log("Backend connection failed:", error);
    }
  };
  
  React.useEffect(() => {
    testAPI();
  }, []);  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [alerts, setAlerts] = useState([]);
  const [kpiData, setKpiData] = useState({
    activeSensors: 0,
    criticalAlerts: 0,
    totalBales: 0,
    avgTemperature: 0,
    avgMoisture: 0,
    systemHealth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch dashboard stats
        const stats = await apiService.getDashboardStats();
        setKpiData(stats);
        
        // Fetch recent alerts
        const alertsData = await apiService.getAlerts();
        setAlerts(alertsData);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
        // Keep mock data as fallback for development
        setKpiData({
          activeSensors: 12,
          criticalAlerts: 3,
          totalBales: 1247,
          avgTemperature: 23.5,
          avgMoisture: 14.2,
          systemHealth: 98
        });
        setAlerts([
          {
            id: 1,
            type: 'temperature',
            message: 'High temperature detected in Barn A',
            timestamp: '2024-01-15T10:30:00Z',
            severity: 'critical'
          },
          {
            id: 2,
            type: 'moisture',
            message: 'Moisture level rising in Section B',
            timestamp: '2024-01-15T09:15:00Z',
            severity: 'warning'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch alerts when date changes
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const startDate = selectedDate;
        const endDate = selectedDate;
        const alertsData = await apiService.getAlerts(startDate, endDate);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchAlerts();
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>HayGuard Dashboard</h1>
        <div className="date-selector">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>⚠️ Using demo data - API connection failed: {error}</p>
        </div>
      )}

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-value">{kpiData.activeSensors}</div>
          <div className="kpi-label">Active Sensors</div>
        </div>
        <div className="kpi-card critical">
          <div className="kpi-value">{kpiData.criticalAlerts}</div>
          <div className="kpi-label">Critical Alerts</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{kpiData.totalBales}</div>
          <div className="kpi-label">Total Bales</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{kpiData.avgTemperature}°C</div>
          <div className="kpi-label">Avg Temperature</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{kpiData.avgMoisture}%</div>
          <div className="kpi-label">Avg Moisture</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{kpiData.systemHealth}%</div>
          <div className="kpi-label">System Health</div>
        </div>
      </div>

      <div className="alerts-section">
        <h2>Recent Alerts</h2>
        <div className="alerts-list">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div key={alert.id} className={`alert-item ${alert.severity}`}>
                <div className="alert-type">{alert.type}</div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-timestamp">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="no-alerts">No alerts for selected date</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;