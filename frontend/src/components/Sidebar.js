import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ collapsed, onToggle, user }) => {
  const location = useLocation();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { id: 'sensors', label: 'Sensor Management', path: '/sensors', icon: '📡' },
    { id: 'reports', label: 'Reports', path: '/reports', icon: '📋' },
    { id: 'team', label: 'Team', path: '/team', icon: '👥' },
    { id: 'alerts', label: 'Alerts', path: '/alerts', icon: '⚠️' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img src={collapsed ? "/default-avatar.png" : "/logo.png"} alt="HayGuard" className="sidebar-logo" />
        
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map(item => (
          <Link 
            data-tooltip={item.label}
            key={item.id}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <Link 
          data-tooltip="Farm Information" 
          to="/farm-info" 
          className="farm-info-widget"
        >
          <div className="farm-icon">🏡</div>
          {!collapsed && (
            <div className="farm-details">
              <h4>My Farm</h4>
              <p>Springfield Farm</p>
              <p>Illinois, USA</p>
              <span className="farm-link">View Details</span>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;