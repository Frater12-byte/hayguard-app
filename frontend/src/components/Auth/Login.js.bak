import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDemoLogin = () => {
    setCredentials({
      email: 'demo@hayguard.com',
      password: 'demo123'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (credentials.email === 'demo@hayguard.com' && credentials.password === 'demo123') {
        const result = await onLogin(credentials.email, credentials.password);
        if (!result.success) {
          setError(result.error);
        }
      } else {
        setError('Invalid email or password. Use demo@hayguard.com / demo123 for demo access.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // Registration logic would go here
    setError('Registration feature coming soon. Use demo account for now.');
  };

  if (showRegister) {
    return (
      <div className="login-container">
        <div className="login-split">
          <div className="login-left">
            <div className="login-branding">
              <img src="/logo.png" alt="HayGuard" className="login-logo-proper" />
              <p className="tagline">Smart hay monitoring for modern farms</p>
            </div>

            <div className="features-section">
              <h2>Join the Future of Farming</h2>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon">🌡️</div>
                  <div className="feature-content">
                    <h3>Temperature Monitoring</h3>
                    <p>Real-time alerts prevent spontaneous combustion</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">💧</div>
                  <div className="feature-content">
                    <h3>Moisture Detection</h3>
                    <p>Optimal moisture levels ensure hay quality</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">📊</div>
                  <div className="feature-content">
                    <h3>Analytics Dashboard</h3>
                    <p>Comprehensive insights into storage conditions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="login-right">
            <div className="login-form-container">
              <form onSubmit={handleRegister} className="login-form">
                <h2>Create Your Account</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                  <label htmlFor="farmName">Farm Name</label>
                  <input
                    id="farmName"
                    type="text"
                    placeholder="Enter your farm name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    required
                  />
                </div>

                <button type="submit" className="login-btn">
                  Create Account
                </button>
              </form>

              <div className="login-footer">
                <p>Already have an account?</p>
                <button 
                  type="button" 
                  className="switch-form-btn"
                  onClick={() => setShowRegister(false)}
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-split">
        <div className="login-left">
          <div className="login-branding">
            <img src="/logo.png" alt="HayGuard" className="login-logo-proper" />
            <p className="tagline">Smart hay monitoring for modern farms</p>
          </div>

          <div className="features-section">
            <h2>Protect Your Harvest</h2>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">🌡️</div>
                <div className="feature-content">
                  <h3>Temperature Monitoring</h3>
                  <p>Real-time alerts prevent spontaneous combustion and quality loss</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">💧</div>
                <div className="feature-content">
                  <h3>Moisture Detection</h3>
                  <p>Optimal moisture levels ensure hay quality and prevent mold</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <div className="feature-content">
                  <h3>Analytics Dashboard</h3>
                  <p>Comprehensive insights into your hay storage conditions</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">📱</div>
                <div className="feature-content">
                  <h3>Mobile Alerts</h3>
                  <p>Instant notifications keep you informed wherever you are</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <div className="demo-banner">
              <div className="demo-icon">🎯</div>
              <div className="demo-content">
                <h3>Try the Demo</h3>
                <p>Experience HayGuard with our demo account</p>
                <div className="demo-credentials">
                  <div><strong>Email:</strong> demo@hayguard.com</div>
                  <div><strong>Password:</strong> demo123</div>
                </div>
                <button className="demo-fill-btn" onClick={handleDemoLogin}>
                  Use Demo Credentials
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <h2>Sign In to Your Account</h2>
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="login-btn"
                disabled={isLoading || !credentials.email || !credentials.password}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="login-footer">
              <button type="button" className="forgot-link">Forgot your password?</button>
              <div className="register-section">
                <p>Don't have an account?</p>
                <button 
                  type="button" 
                  className="switch-form-btn"
                  onClick={() => setShowRegister(true)}
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
