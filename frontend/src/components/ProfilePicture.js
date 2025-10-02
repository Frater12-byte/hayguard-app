import React from 'react';
import { useUser } from '../contexts/UserContext';

const ProfilePicture = ({ size = 40, showName = true }) => {
  const { user } = useUser();
  
  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="profile-picture-container" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
      <div 
        className="profile-avatar"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: 'var(--primary-yellow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-brown)',
          fontSize: size > 32 ? 'var(--font-size-lg)' : 'var(--font-size-sm)',
          fontWeight: '600',
          border: '2px solid var(--primary-brown)',
        }}
      >
        {initials}
      </div>
      {showName && (
        <div className="profile-info">
          <p style={{ 
            margin: 0, 
            fontWeight: '500', 
            fontSize: 'var(--font-size-sm)',
            color: 'var(--gray-800)'
          }}>
            {user?.name || 'User'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
