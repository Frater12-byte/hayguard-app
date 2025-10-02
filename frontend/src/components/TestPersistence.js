import React, { useState } from 'react';
import Profile from './Profile/Profile';
import { useUser } from '../contexts/UserContext';

const TestPersistence = () => {
  const { user } = useUser();
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch(currentView) {
      case 'profile':
        return <Profile onBack={() => setCurrentView('dashboard')} />;
      case 'sensors':
        return (
          <div style={{ padding: '20px' }}>
            <h2>Sensors Page</h2>
            <p>User data should persist here:</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            {user.profilePicture && (
              <div>
                <p><strong>Profile Picture:</strong></p>
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                />
              </div>
            )}
            <button onClick={() => setCurrentView('dashboard')}>Back to Dashboard</button>
          </div>
        );
      case 'settings':
        return (
          <div style={{ padding: '20px' }}>
            <h2>Settings Page</h2>
            <p>User data persists here too:</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
            {user.profilePicture && (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
              />
            )}
            <button onClick={() => setCurrentView('dashboard')}>Back to Dashboard</button>
          </div>
        );
      default:
        return (
          <div style={{ padding: '20px' }}>
            <h2>Dashboard</h2>
            <p>Current User: <strong>{user.name}</strong> ({user.role})</p>
            {user.profilePicture && (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                style={{ width: '60px', height: '60px', borderRadius: '50%' }}
              />
            )}
            <div style={{ marginTop: '20px' }}>
              <button onClick={() => setCurrentView('profile')} style={{ margin: '5px' }}>
                Go to Profile
              </button>
              <button onClick={() => setCurrentView('sensors')} style={{ margin: '5px' }}>
                Go to Sensors
              </button>
              <button onClick={() => setCurrentView('settings')} style={{ margin: '5px' }}>
                Go to Settings
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <nav style={{ 
        padding: '10px', 
        backgroundColor: '#f0f0f0', 
        marginBottom: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        <button 
          onClick={() => setCurrentView('dashboard')}
          style={{ 
            backgroundColor: currentView === 'dashboard' ? '#007bff' : '#ccc',
            color: currentView === 'dashboard' ? 'white' : 'black',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setCurrentView('profile')}
          style={{ 
            backgroundColor: currentView === 'profile' ? '#007bff' : '#ccc',
            color: currentView === 'profile' ? 'white' : 'black',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Profile
        </button>
        <button 
          onClick={() => setCurrentView('sensors')}
          style={{ 
            backgroundColor: currentView === 'sensors' ? '#007bff' : '#ccc',
            color: currentView === 'sensors' ? 'white' : 'black',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Sensors
        </button>
        <button 
          onClick={() => setCurrentView('settings')}
          style={{ 
            backgroundColor: currentView === 'settings' ? '#007bff' : '#ccc',
            color: currentView === 'settings' ? 'white' : 'black',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Settings
        </button>
      </nav>
      
      {renderView()}
    </div>
  );
};

export default TestPersistence;
