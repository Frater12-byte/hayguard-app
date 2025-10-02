// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import './Sidebar.css';

// Simple SVG Icons to avoid external dependencies
const Icons = {
  LayoutDashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  ),
  MapPin: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  Thermometer: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  FileText: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14,2 14,8 20,8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10,9 9,9 8,9"></polyline>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  ),
  X: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15,18 9,12 15,6"></polyline>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9,18 15,12 9,6"></polyline>
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  )
};

// HayGuard Logo Component
const HayGuardLogo = ({ collapsed }) => (
  <div className={`hayguard-logo ${collapsed ? 'collapsed' : ''}`}>
    {collapsed ? (
      <div className="logo-avatar">
        <img 
          src="/default-avatar.png" 
          alt="User Avatar"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
          }}
        />
      </div>
    ) : (
      <>
        <img 
          src="/logo.png" 
          alt="HayGuard" 
          className="logo-image"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div className="logo-text-fallback" style={{ display: 'none' }}>
          <span className="logo-hay">HAY</span>
          <span className="logo-guard">GUARD</span>
        </div>
      </>
    )}
  </div>
);

const Sidebar = ({ collapsed, onToggle, user }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Get farm info from DataContext
  const { farmInfo } = useData();
  const [currentFarmInfo, setCurrentFarmInfo] = useState(farmInfo);

  // Sync farm info from context
  useEffect(() => {
    setCurrentFarmInfo(farmInfo);
  }, [farmInfo]);

  // Listen for farm info updates
  useEffect(() => {
    const handleFarmInfoUpdate = (event) => {
      setCurrentFarmInfo(event.detail);
    };

    window.addEventListener('farmInfoUpdated', handleFarmInfoUpdate);
    return () => window.removeEventListener('farmInfoUpdated', handleFarmInfoUpdate);
  }, []);

  // Keyboard shortcut for sidebar toggle
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        onToggle();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onToggle]);

  // Only 5 essential navigation items
  const navigationItems = [
    {
      path: '/dashboard',
      icon: 'LayoutDashboard',
      label: 'Dashboard'
    },
    {
      path: '/sensors',
      icon: 'Thermometer',
      label: 'Sensors'
    },
    {
      path: '/reports',
      icon: 'FileText',
      label: 'Reports'
    },
    {
      path: '/alerts',
      icon: 'AlertTriangle',
      label: 'Alerts'
    },
    {
      path: '/team',
      icon: 'Users',
      label: 'Team'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || 
           (path === '/dashboard' && location.pathname === '/');
  };

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const NavigationItem = ({ item }) => {
    const IconComponent = Icons[item.icon];
    
    return (
      <Link
        to={item.path}
        className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
        onClick={closeMobile}
        title={collapsed ? item.label : ''}
        data-tooltip={collapsed ? item.label : ''}
      >
        <div className="nav-item-content">
          <div className="nav-icon">
            <IconComponent />
          </div>
          {!collapsed && (
            <div className="nav-text">
              <span className="nav-label">{item.label}</span>
            </div>
          )}
        </div>
        {isActive(item.path) && <div className="active-indicator" />}
      </Link>
    );
  };

  const handleSidebarClick = (e) => {
    if (collapsed && e.target.closest('.sidebar') && !e.target.closest('.nav-item')) {
      onToggle();
    }
  };

  // Extract city/state from full address
  const getShortLocation = (address) => {
    if (!address) return 'Location not set';
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts.slice(-2).join(',').trim();
    }
    return address;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button className="mobile-menu-button" onClick={toggleMobile}>
        <Icons.Menu />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={closeMobile} />
      )}

      {/* Sidebar */}
      <aside 
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        onClick={handleSidebarClick}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-container">
            <HayGuardLogo collapsed={collapsed} />
          </div>
          
          {/* Desktop Toggle Button */}
          <button 
            className="sidebar-toggle" 
            onClick={onToggle}
            title={collapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
          >
            {collapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
          </button>

          {/* Mobile Close */}
          <button className="sidebar-close mobile-only" onClick={closeMobile}>
            <Icons.X />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            {navigationItems.map((item, index) => (
              <NavigationItem key={index} item={item} />
            ))}
          </div>
        </nav>

        {/* Farm Info Footer - Now with dynamic data */}
        {!collapsed && (
          <div className="sidebar-footer">
            <Link to="/my-farm" className="farm-profile-link">
              <div className="farm-profile-info">
                <div className="farm-profile-avatar">
                  <Icons.MapPin />
                </div>
                <div className="farm-profile-details">
                  <span className="farm-profile-name">
                    {currentFarmInfo?.name || 'Greenfield Farm'}
                  </span>
                  <span className="farm-profile-location">
                    {getShortLocation(currentFarmInfo?.location?.address)}
                  </span>
                  <span className="farm-profile-action">View My Farm Profile →</span>
                </div>
              </div>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;