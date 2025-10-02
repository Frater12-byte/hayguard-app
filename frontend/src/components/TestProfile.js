import React from 'react';
import { UserProvider } from '../contexts/UserContext';
import TestPersistence from './TestPersistence';

const TestProfile = () => {
  return (
    <UserProvider>
      <div>
        <h1 style={{ textAlign: 'center', color: '#333' }}>
          HayGuard - Profile Test with Persistence
        </h1>
        <TestPersistence />
      </div>
    </UserProvider>
  );
};

export default TestProfile;
