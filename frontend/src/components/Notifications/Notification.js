import React, { useState, useEffect } from 'react';
import './Notification.css';

const Notification = ({ type, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'i';
      default: return '';
    }
  };

  return (
    <div className={`notification notification-${type} ${isVisible ? 'show' : 'hide'}`}>
      <div className="notification-icon">
        {getIcon()}
      </div>
      <div className="notification-content">
        <p>{message}</p>
      </div>
      <button className="notification-close" onClick={() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }}>
        ✕
      </button>
    </div>
  );
};

export default Notification;
