// src/components/NotificationDropdown.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, AlertCircle, Info, ArrowRight, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { alerts } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get unresolved alerts only, sorted by most recent
  const activeAlerts = alerts
    .filter(alert => !alert.resolved)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5); // Show max 5 in dropdown

  const unreadCount = activeAlerts.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle size={18} className="alert-icon critical" />;
      case 'warning':
        return <AlertCircle size={18} className="alert-icon warning" />;
      default:
        return <Info size={18} className="alert-icon info" />;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - alertTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays}d ago`;
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/alerts');
  };

  const handleAlertClick = (alertId) => {
    setIsOpen(false);
    navigate('/alerts', { state: { highlightAlert: alertId } });
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef}>
      <button 
        className={`notification-bell ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <>
            <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            <div className="notification-pulse"></div>
          </>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown-menu">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="notification-count">{unreadCount} new</span>
            )}
          </div>

          <div className="notification-list">
            {activeAlerts.length > 0 ? (
              activeAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`notification-item severity-${alert.severity}`}
                  onClick={() => handleAlertClick(alert.id)}
                >
                  <div className="notification-icon-wrapper">
                    {getAlertIcon(alert.severity)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {alert.sensorName}
                    </div>
                    <div className="notification-message">
                      {alert.message}
                    </div>
                    <div className="notification-time">
                      {getTimeAgo(alert.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="notification-empty">
                <Bell size={40} />
                <p>No new notifications</p>
                <span>You're all caught up!</span>
              </div>
            )}
          </div>

          {activeAlerts.length > 0 && (
            <div className="notification-footer">
              <button 
                className="view-all-btn"
                onClick={handleViewAll}
              >
                View All Alerts
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;