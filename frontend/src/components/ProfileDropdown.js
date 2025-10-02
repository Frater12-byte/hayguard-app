// src/components/ProfileDropdown.js
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { User, LogOut, ChevronDown } from 'lucide-react';
import './ProfileDropdown.css';

const ProfileDropdown = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const dropdownRef = useRef(null);

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

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Farm Owner';
      case 'manager': return 'Farm Manager';
      case 'worker': return 'Worker';
      default: return 'Farm Owner';
    }
  };

  if (!user) return null;

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button 
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <div className="profile-avatar">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} />
          ) : (
            <span className="avatar-initial">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
          )}
        </div>
        <span className="profile-name-desktop">{user.name}</span>
        <ChevronDown 
          size={16} 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <div className="dropdown-avatar">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} />
              ) : (
                <span className="avatar-initial-large">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
            <div className="user-info">
              <p className="user-name">{user.name || 'User'}</p>
              <p className="user-email">{user.email || 'user@example.com'}</p>
              <p className="user-role">{getRoleLabel(user.role)}</p>
            </div>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <div className="dropdown-items">
            <Link 
              to="/my-profile" 
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <User size={18} />
              <span>My Profile</span>
            </Link>
            
            <button 
              className="dropdown-item logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;