import React from 'react';

const Settings = ({ user }) => {
  return (
    <div className="settings">
      <h1>Settings</h1>
      <p>Settings panel coming soon...</p>
      {user && <p>Welcome, {user.name || user.email}!</p>}
    </div>
  );
};

export default Settings;
