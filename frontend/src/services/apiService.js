// apiService.js - Complete API service for all data fetching
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiService {
  async makeRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Farm Management
  async getFarmInfo() {
    return this.makeRequest('/api/farm/info');
  }

  async updateFarmInfo(farmData) {
    return this.makeRequest('/api/farm/info', {
      method: 'PUT',
      body: JSON.stringify(farmData),
    });
  }

  // Sensors
  async getSensors() {
    return this.makeRequest('/api/sensors');
  }

  async getSensorById(id) {
    return this.makeRequest(`/api/sensors/${id}`);
  }

  async createSensor(sensorData) {
    return this.makeRequest('/api/sensors', {
      method: 'POST',
      body: JSON.stringify(sensorData),
    });
  }

  async updateSensor(id, sensorData) {
    return this.makeRequest(`/api/sensors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sensorData),
    });
  }

  async deleteSensor(id) {
    return this.makeRequest(`/api/sensors/${id}`, {
      method: 'DELETE',
    });
  }

  // Alerts
  async getAlerts(filters = {}) {
    const params = new URLSearchParams();
    
    // Default to last 7 days
    if (!filters.startDate) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filters.startDate = sevenDaysAgo.toISOString();
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    return this.makeRequest(`/api/alerts?${params}`);
  }

  async acknowledgeAlert(alertId) {
    return this.makeRequest(`/api/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });
  }

  async resolveAlert(alertId) {
    return this.makeRequest(`/api/alerts/${alertId}/resolve`, {
      method: 'POST',
    });
  }

  // Team Management
  async getUsers() {
    return this.makeRequest('/api/users');
  }

  async createUser(userData) {
    return this.makeRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.makeRequest(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.makeRequest(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  async resetUserPassword(id, newPassword) {
    return this.makeRequest(`/api/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password: newPassword }),
    });
  }

  // Mock data fallbacks (remove these when all your APIs are ready)
  async getMockSensors() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: [
        {
          id: 1,
          name: 'Sensor A1',
          location: 'Field 1',
          type: 'temperature_moisture',
          status: 'active',
          battery: 87,
          temperature: 23.45,
          moisture: 12.67,
          lastReading: new Date().toISOString(),
          minTemperature: 18.2,
          maxTemperature: 31.8,
          minMoisture: 8.5,
          maxMoisture: 18.9
        },
        {
          id: 2,
          name: 'Sensor B2',
          location: 'Field 2',
          type: 'temperature_moisture',
          status: 'active',
          battery: 92,
          temperature: 28.92,
          moisture: 15.23,
          lastReading: new Date().toISOString(),
          minTemperature: 19.1,
          maxTemperature: 33.2,
          minMoisture: 11.2,
          maxMoisture: 21.5
        },
        {
          id: 3,
          name: 'Sensor C3',
          location: 'Field 3',
          type: 'temperature_moisture',
          status: 'warning',
          battery: 45,
          temperature: 31.78,
          moisture: 18.45,
          lastReading: new Date().toISOString(),
          minTemperature: 20.3,
          maxTemperature: 35.1,
          minMoisture: 13.8,
          maxMoisture: 24.2
        }
      ]
    };
  }

  // Use real API or fallback to mock data
  async getSensorsData() {
    try {
      return await this.getSensors();
    } catch (error) {
      console.warn('Using mock sensor data:', error.message);
      return await this.getMockSensors();
    }
  }
}

export default new ApiService();
