const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        // If API fails, allow demo login
        if (email === 'hello@hayguard-app.com' && password === '7JppT8xv1xGVG8fR') {
          const demoData = {
            token: 'demo-token-' + Date.now(),
            user: {
              id: 1,
              name: 'Demo Fra',
              email: 'hello@hayguard-app.com',
              role: 'admin'
            }
          };
          
          localStorage.setItem('token', demoData.token);
          localStorage.setItem('user', JSON.stringify(demoData.user));
          return demoData;
        }
        
        throw new Error('Invalid credentials');
      }
      
      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  }
};