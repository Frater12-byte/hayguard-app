import React from 'react';

const Notification = ({ type = 'success', message, onClose }) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ⓘ'
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-icon">
        {icons[type]}
      </div>
      <div className="notification-content">
        <p>{message}</p>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="notification-close"
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            marginLeft: 'auto',
            opacity: 0.7
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Notification;
