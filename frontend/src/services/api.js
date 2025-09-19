// src/services/api.js - Frontend API Integration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('hayguard_token');
    this.baseURL = API_BASE_URL;
  }

  setAuthToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('hayguard_token', token);
    } else {
      localStorage.removeItem('hayguard_token');
    }
  }

  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      
      // Handle auth errors
      if (error.message.includes('Invalid or expired token')) {
        this.logout();
        window.location.href = '/login';
      }
      
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setAuthToken(response.token);
    }
    
    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setAuthToken(response.token);
    }
    
    return response;
  }

  logout() {
    this.setAuthToken(null);
  }

  // Sensor methods
  async getSensors() {
    return this.request('/sensors');
  }

  async addSensor(sensorData) {
    return this.request('/sensors', {
      method: 'POST',
      body: JSON.stringify(sensorData),
    });
  }

  async deleteSensor(sensorId) {
    return this.request(`/sensors/${sensorId}`, {
      method: 'DELETE',
    });
  }

  // Readings methods
  async getHistoricalData(options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/readings/historical?${params}`);
  }

  // Farm methods
  async getFarmInfo() {
    return this.request('/farm');
  }

  // Alerts methods
  async getAlerts() {
    return this.request('/alerts');
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.json();
    } catch (error) {
      throw new Error('API server is not responding');
    }
  }
}

export default new ApiService();