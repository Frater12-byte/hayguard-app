import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard';
import SensorManagement from './components/Sensors/SensorManagement';
import Reports from './components/Reports/Reports';
import Team from './components/Team/Team';
import Alerts from './components/Alerts/Alerts';
import Profile from './components/Profile/Profile';
import Settings from './components/Settings/Settings';
import MyFarm from './components/Farm/MyFarm';
import Farms from './components/Farms/Farms';
import FarmDetails from './components/Farms/FarmDetails';
import Weather from './components/Weather/Weather';
import Analytics from './components/Analytics/Analytics';
import APIDebugTest from './components/TestPage'; 
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Services
// eslint-disable-next-line no-unused-vars
import { authService } from './services/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setIsAuthenticated(true);
          // Set demo user data
          setUser({
            name: 'Demo User',
            email: 'demo@hayguard.com',
            profilePicture: '/default-avatar.png'
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      // Simulate successful login for demo credentials
      if (email === 'demo@hayguard.com' && password === 'demo123') {
        localStorage.setItem('token', 'demo-token');
        setIsAuthenticated(true);
        setUser({
          name: 'Demo User',
          email: 'demo@hayguard.com',
          profilePicture: '/default-avatar.png'
        });
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/login" replace />
            } 
          />
          
          <Route path="/*" element={
            isAuthenticated ? (
              <div className="app-layout">
                <Sidebar 
                  collapsed={sidebarCollapsed} 
                  onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                  user={user}
                />
                <div className="main-content">
                  <Header onLogout={handleLogout} user={user} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                  <div className="content">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard user={user} />} />
                      <Route path="/sensors" element={<SensorManagement />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/alerts" element={<Alerts />} />
                      <Route path="/profile" element={<Profile user={user} />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/farm-info" element={<MyFarm />} />
                      <Route path="/farms" element={<Farms />} />
                      <Route path="/farms/:id" element={<FarmDetails />} />
                      <Route path="/weather" element={<Weather />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/debug" element={<APIDebugTest />} />                    </Routes>
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
