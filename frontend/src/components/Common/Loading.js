import React from 'react';

const Loading = ({ message = 'Loading...', size = 'medium' }) => {
  const sizeClasses = {
    small: 'loading-container-sm',
    medium: 'loading-container',
    large: 'loading-container-lg'
  };

  return (
    <div className={sizeClasses[size]}>
      <div className="loading-spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default Loading;
