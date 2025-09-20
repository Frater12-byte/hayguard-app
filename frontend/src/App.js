import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SensorManagement from './components/Sensors/SensorManagement';
import Reports from './components/Reports/Reports';
import Team from './components/Team/Team';
import FarmInfo from './components/Farm/FarmInfo';
import Alerts from './components/Alerts/Alerts';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Demo user for MVP testing
  const demoUser = {
    id: 1,
    name: 'John Farmer',
    email: 'john@hayguard.com',
    role: 'Admin',
    permissions: ['read', 'write', 'admin']
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <Router>
      <div className="app">
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          user={demoUser}
        />
        
        <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Header 
            user={demoUser}
            onLogout={handleLogout}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard user={demoUser} />} />
              <Route path="/sensors" element={<SensorManagement user={demoUser} />} />
              <Route path="/reports" element={<Reports user={demoUser} />} />
              <Route path="/team" element={<Team user={demoUser} />} />
              <Route path="/farm" element={<FarmInfo user={demoUser} />} />
              <Route path="/alerts" element={<Alerts user={demoUser} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;