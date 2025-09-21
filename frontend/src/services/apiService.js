const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async getFarm(farmId) {
    return this.request(`/farms/${farmId}`);
  }

  async updateFarm(farmId, farmData) {
    return this.request(`/farms/${farmId}`, {
      method: 'PUT',
      body: JSON.stringify(farmData)
    });
  }

  async getSensors() {
    return this.request('/sensors');
  }

  async createSensor(sensorData) {
    return this.request('/sensors', {
      method: 'POST',
      body: JSON.stringify(sensorData)
    });
  }

  async getSensorData(sensorId, startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request(`/sensors/${sensorId}/data?${params}`);
  }

  async getAlerts(startDate, endDate, type) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (type) params.append('type', type);
    
    return this.request(`/alerts?${params}`);
  }

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async sendInvitation(email, role) {
    return this.request('/email/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role })
    });
  }

  async resetPassword(email) {
    return this.request('/email/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }
}

export const apiService = new ApiService();
