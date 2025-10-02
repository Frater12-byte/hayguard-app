// src/components/Alerts/Alerts.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { 
  AlertTriangle, 
  Droplets, 
  ThermometerSun, 
  Battery,
  CheckCircle,
  Download,
  Filter,
  ExternalLink,
  Clock
} from 'lucide-react';
import './Alerts.css';

const Alerts = () => {
  const { alerts, markAlertResolved } = useData();
  const [timeFilter, setTimeFilter] = useState(24);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getAlertIcon = (type) => {
    const iconProps = { size: 16 };
    const icons = {
      temperature: <ThermometerSun {...iconProps} />,
      moisture: <Droplets {...iconProps} />,
      battery: <Battery {...iconProps} />
    };
    return icons[type] || <AlertTriangle {...iconProps} />;
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isWithinTimeFilter = (timestamp) => {
    const now = new Date();
    const alertDate = new Date(timestamp);
    const hoursDiff = (now - alertDate) / (1000 * 60 * 60);
    return hoursDiff <= timeFilter;
  };

  const filteredAlerts = alerts
    .filter(alert => {
      const timeMatch = isWithinTimeFilter(alert.timestamp);
      const severityMatch = filterSeverity === 'all' || alert.severity === filterSeverity;
      const statusMatch = filterStatus === 'all' || 
        (filterStatus === 'active' && !alert.resolved) ||
        (filterStatus === 'resolved' && alert.resolved);
      return timeMatch && severityMatch && statusMatch;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const exportReport = () => {
    const reportHeader = `
========================================
     HAYGUARD ALERTS REPORT
========================================

Generated: ${new Date().toLocaleString()}
Farm: Greenfield Farm
Time Period: Last ${timeFilter} hours

SUMMARY
--------
Total Alerts: ${filteredAlerts.length}
Active Alerts: ${filteredAlerts.filter(a => !a.resolved).length}
Resolved Alerts: ${filteredAlerts.filter(a => a.resolved).length}

BREAKDOWN BY SEVERITY
---------------------
Critical: ${filteredAlerts.filter(a => a.severity === 'critical').length}
Warning: ${filteredAlerts.filter(a => a.severity === 'warning').length}
Info: ${filteredAlerts.filter(a => a.severity === 'info').length}

========================================
           DETAILED ALERTS
========================================
`;

    const alertsContent = filteredAlerts.map((alert, index) => {
      const dt = formatDateTime(alert.timestamp);
      return `
Alert #${index + 1}
${'-'.repeat(40)}
Date: ${dt.date} at ${dt.time}
Sensor: ${alert.sensorName}
Sensor ID: ${alert.sensorId}
Type: ${alert.type}
Severity: ${alert.severity.toUpperCase()}

Message: ${alert.message}

Current Value: ${alert.value}${alert.unit}
Threshold: ${alert.threshold}${alert.unit}
Status: ${alert.resolved ? 'RESOLVED' : 'ACTIVE'}

`;
    }).join('\n');

    const reportFooter = `
========================================
           END OF REPORT
========================================

This report was generated automatically by HayGuard
Farm Monitoring System.
`;

    const fullReport = reportHeader + alertsContent + reportFooter;
    const blob = new Blob([fullReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HayGuard-Alerts-${timeFilter}h-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Alerts report exported successfully!');
  };

  const handleResolve = (alertId) => {
    markAlertResolved(alertId);
    showNotification('Alert marked as resolved');
  };

  const clearFilters = () => {
    setFilterSeverity('all');
    setFilterStatus('all');
    setTimeFilter(24);
  };

  return (
    <div className="alerts-page-improved">
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

      {/* Unified Filters Row - No Labels */}
      <div className="alerts-controls">
        <div className="controls-main">
          <div className="time-buttons">
            <button
              className={`btn-time ${timeFilter === 24 ? 'active' : ''}`}
              onClick={() => setTimeFilter(24)}
            >
              <Clock size={14} /> 24h
            </button>
            <button
              className={`btn-time ${timeFilter === 48 ? 'active' : ''}`}
              onClick={() => setTimeFilter(48)}
            >
              <Clock size={14} /> 48h
            </button>
            <button
              className={`btn-time ${timeFilter === 72 ? 'active' : ''}`}
              onClick={() => setTimeFilter(72)}
            >
              <Clock size={14} /> 72h
            </button>
          </div>

          <select 
            className="filter-select"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
          </select>

          <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
            <Filter size={14} />
            Clear
          </button>

          <button className="btn btn-primary btn-sm" onClick={exportReport}>
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card critical">
          <div className="summary-value">
            {filteredAlerts.filter(a => a.severity === 'critical' && !a.resolved).length}
          </div>
          <div className="summary-label">Critical Active</div>
        </div>
        <div className="summary-card warning">
          <div className="summary-value">
            {filteredAlerts.filter(a => a.severity === 'warning' && !a.resolved).length}
          </div>
          <div className="summary-label">Warning Active</div>
        </div>
        <div className="summary-card info">
          <div className="summary-value">
            {filteredAlerts.filter(a => a.severity === 'info' && !a.resolved).length}
          </div>
          <div className="summary-label">Info Active</div>
        </div>
        <div className="summary-card resolved">
          <div className="summary-value">
            {filteredAlerts.filter(a => a.resolved).length}
          </div>
          <div className="summary-label">Resolved</div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="alerts-table-container">
        <div className="table-header">
          <div className="header-cell">Date/Time</div>
          <div className="header-cell">Type</div>
          <div className="header-cell">Sensor</div>
          <div className="header-cell">Severity</div>
          <div className="header-cell">Value</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>

        <div className="table-body">
          {filteredAlerts.length === 0 ? (
            <div className="no-alerts">
              <p>No alerts found for the selected time period and filters.</p>
              <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const dt = formatDateTime(alert.timestamp);
              return (
                <div 
                  key={alert.id}
                  className={`alert-row ${alert.severity} ${alert.resolved ? 'resolved' : ''}`}
                >
                  <div className="cell cell-datetime" data-label="Date/Time">
                    <div className="cell-date">{dt.date}</div>
                    <div className="cell-time">{dt.time}</div>
                  </div>

                  <div className="cell" data-label="Type">
                    <div className="cell-type">
                      {getAlertIcon(alert.type)}
                    </div>
                  </div>

                  <div className="cell" data-label="Sensor">
                    <div className="cell-sensor">{alert.sensorName}</div>
                    <div className="cell-sensor-id">{alert.sensorId}</div>
                  </div>

                  <div className="cell" data-label="Severity">
                    <span className={`severity-badge ${alert.severity}`}>
                      {alert.severity}
                    </span>
                  </div>

                  <div className="cell" data-label="Value">
                    <div className="cell-value">
                      {alert.value}{alert.unit}
                    </div>
                    <div className="cell-threshold">
                      Threshold: {alert.threshold}{alert.unit}
                    </div>
                  </div>

                  <div className="cell" data-label="Status">
                    <span className={`status-badge ${alert.resolved ? 'resolved' : 'active'}`}>
                      {alert.resolved ? (
                        <>
                          <CheckCircle size={12} />
                          Resolved
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={12} />
                          Active
                        </>
                      )}
                    </span>
                  </div>

                  <div className="cell cell-actions">
                    <Link 
                      to={`/sensors/${alert.sensorId}`}
                      className="btn-view"
                    >
                      <ExternalLink size={12} />
                      View
                    </Link>
                    {!alert.resolved && (
                      <button 
                        className="btn-resolve"
                        onClick={() => handleResolve(alert.id)}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;