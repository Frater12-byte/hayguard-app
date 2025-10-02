// src/components/Header.js
import React from 'react';
import { useUser } from '../contexts/UserContext';
import ProfileDropdown from './ProfileDropdown';
import NotificationDropdown from './NotificationDropdown';
import './Header.css';

const Header = ({ onLogout, onToggleSidebar }) => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="mobile-menu-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>
      
      <div className="header-right">
        <NotificationDropdown />
        
        {/* Key prop forces re-render when picture changes */}
        <ProfileDropdown 
          onLogout={onLogout} 
          key={user?.profilePicture || Date.now()}
        />
      </div>
    </header>
  );
};

export default Header;