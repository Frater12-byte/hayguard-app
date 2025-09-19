// src/services/api.js - Enhanced API Integration
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

  // ===== AUTHENTICATION METHODS =====
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

  // ===== SENSOR METHODS =====
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

  async updateSensor(sensorId, sensorData) {
    return this.request(`/sensors/${sensorId}`, {
      method: 'PUT',
      body: JSON.stringify(sensorData),
    });
  }

  // ===== READINGS METHODS =====
  async getHistoricalData(options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/readings/historical?${params}`);
  }

  async addReading(readingData) {
    return this.request('/readings', {
      method: 'POST',
      body: JSON.stringify(readingData),
    });
  }

  // ===== FARM METHODS =====
  async getFarmInfo() {
    return this.request('/farm');
  }

  async updateFarm(farmData) {
    return this.request('/farm', {
      method: 'PUT',
      body: JSON.stringify(farmData),
    });
  }

  async getFarmSettings() {
    return this.request('/farm/settings');
  }

  async updateFarmSettings(settings) {
    return this.request('/farm/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // ===== ALERTS METHODS =====
  async getAlerts() {
    return this.request('/alerts');
  }

  async getAlertsHistory(options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/alerts/history?${params}`);
  }

  async resolveAlert(alertId, notes = '') {
    return this.request(`/alerts/${alertId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  }

  async createAlert(alertData) {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  // ===== ANALYTICS METHODS =====
  async getAnalyticsData(options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/analytics?${params}`);
  }

  async getDashboardStats() {
    return this.request('/analytics/dashboard');
  }

  async getSensorTrends(sensorId, options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/analytics/sensor/${sensorId}/trends?${params}`);
  }

  async getTemperatureTrends(options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/analytics/temperature?${params}`);
  }

  async getMoistureTrends(options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/analytics/moisture?${params}`);
  }

  async getChemicalAnalysis(options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/analytics/chemicals?${params}`);
  }

  // ===== REPORTS METHODS =====
  async generateReport(reportOptions) {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(reportOptions),
      headers: {
        'Accept': 'application/pdf',
      },
    });
  }

  async getReportHistory() {
    return this.request('/reports/history');
  }

  async downloadReport(reportId) {
    const response = await fetch(`${this.baseURL}/reports/${reportId}/download`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download report');
    }
    
    return response.blob();
  }

  async exportData(options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/export/data?${params}`, {
      headers: {
        'Accept': 'application/json, text/csv',
      },
    });
  }

  // ===== TEAM MANAGEMENT METHODS =====
  async getTeamMembers() {
    return this.request('/team/members');
  }

  async inviteTeamMember(inviteData) {
    return this.request('/team/invite', {
      method: 'POST',
      body: JSON.stringify(inviteData),
    });
  }

  async removeTeamMember(memberId) {
    return this.request(`/team/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  async updateTeamMember(memberId, memberData) {
    return this.request(`/team/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  async getTeamMemberPermissions(memberId) {
    return this.request(`/team/members/${memberId}/permissions`);
  }

  async updateTeamMemberPermissions(memberId, permissions) {
    return this.request(`/team/members/${memberId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(permissions),
    });
  }

  async acceptInvitation(inviteToken) {
    return this.request('/team/accept-invitation', {
      method: 'POST',
      body: JSON.stringify({ token: inviteToken }),
    });
  }

  async getPendingInvitations() {
    return this.request('/team/invitations/pending');
  }

  async cancelInvitation(invitationId) {
    return this.request(`/team/invitations/${invitationId}`, {
      method: 'DELETE',
    });
  }

  // ===== USER PROFILE METHODS =====
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.request('/user/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async updateNotificationSettings(settings) {
    return this.request('/user/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getNotificationSettings() {
    return this.request('/user/notifications');
  }

  // ===== WEATHER INTEGRATION METHODS =====
  async getCurrentWeather(lat, lng) {
    const params = new URLSearchParams({ lat, lng });
    return this.request(`/weather/current?${params}`);
  }

  async getWeatherForecast(lat, lng, days = 5) {
    const params = new URLSearchParams({ lat, lng, days });
    return this.request(`/weather/forecast?${params}`);
  }

  async getWeatherHistory(lat, lng, startDate, endDate) {
    const params = new URLSearchParams({ lat, lng, startDate, endDate });
    return this.request(`/weather/history?${params}`);
  }

  // ===== ALERT RULES METHODS =====
  async getAlertRules() {
    return this.request('/alert-rules');
  }

  async createAlertRule(ruleData) {
    return this.request('/alert-rules', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    });
  }

  async updateAlertRule(ruleId, ruleData) {
    return this.request(`/alert-rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(ruleData),
    });
  }

  async deleteAlertRule(ruleId) {
    return this.request(`/alert-rules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  async toggleAlertRule(ruleId, enabled) {
    return this.request(`/alert-rules/${ruleId}/toggle`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    });
  }

  // ===== SYSTEM METHODS =====
  async getSystemLogs(options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/system/logs?${params}`);
  }

  async getSystemHealth() {
    return this.request('/system/health');
  }

  async getApiStatistics() {
    return this.request('/system/stats');
  }

  // ===== BACKUP & MAINTENANCE METHODS =====
  async createBackup() {
    return this.request('/system/backup', {
      method: 'POST',
    });
  }

  async getBackupHistory() {
    return this.request('/system/backup/history');
  }

  async downloadBackup(backupId) {
    const response = await fetch(`${this.baseURL}/system/backup/${backupId}/download`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download backup');
    }
    
    return response.blob();
  }

  // ===== BULK OPERATIONS =====
  async bulkDeleteSensors(sensorIds) {
    return this.request('/sensors/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ sensorIds }),
    });
  }

  async bulkUpdateSensors(updates) {
    return this.request('/sensors/bulk-update', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async bulkResolveAlerts(alertIds, notes = '') {
    return this.request('/alerts/bulk-resolve', {
      method: 'PUT',
      body: JSON.stringify({ alertIds, notes }),
    });
  }

  // ===== SEARCH & FILTERING =====
  async searchSensors(query, filters = {}) {
    const params = new URLSearchParams({ query, ...filters });
    return this.request(`/sensors/search?${params}`);
  }

  async filterReadings(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/readings/filter?${params}`);
  }

  async searchAlerts(query, filters = {}) {
    const params = new URLSearchParams({ query, ...filters });
    return this.request(`/alerts/search?${params}`);
  }

  // ===== INTEGRATION METHODS =====
  async connectExternalService(serviceType, credentials) {
    return this.request('/integrations/connect', {
      method: 'POST',
      body: JSON.stringify({ serviceType, credentials }),
    });
  }

  async disconnectExternalService(serviceType) {
    return this.request(`/integrations/${serviceType}/disconnect`, {
      method: 'DELETE',
    });
  }

  async getIntegrationStatus() {
    return this.request('/integrations/status');
  }

  async syncExternalData(serviceType) {
    return this.request(`/integrations/${serviceType}/sync`, {
      method: 'POST',
    });
  }

  // ===== UTILITY METHODS =====
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.json();
    } catch (error) {
      throw new Error('API server is not responding');
    }
  }

  async validateCoordinates(lat, lng) {
    const params = new URLSearchParams({ lat, lng });
    return this.request(`/utils/validate-coordinates?${params}`);
  }

  async geocodeAddress(address) {
    const params = new URLSearchParams({ address });
    return this.request(`/utils/geocode?${params}`);
  }

  async reverseGeocode(lat, lng) {
    const params = new URLSearchParams({ lat, lng });
    return this.request(`/utils/reverse-geocode?${params}`);
  }

  // ===== ERROR HANDLING HELPER =====
  handleApiError(error) {
    console.error('API Error:', error);
    
    if (error.message.includes('Network')) {
      return 'Network connection error. Please check your internet connection.';
    }
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      this.logout();
      return 'Session expired. Please log in again.';
    }
    
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return 'You do not have permission to perform this action.';
    }
    
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return 'The requested resource was not found.';
    }
    
    if (error.message.includes('500') || error.message.includes('Server Error')) {
      return 'Server error. Please try again later.';
    }
    
    return error.message || 'An unexpected error occurred.';
  }

  // ===== MOCK DATA METHODS (for development) =====
  getMockSensorData(sensorId, days = 7) {
    const now = new Date();
    const data = [];
    
    for (let i = days * 24; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        temperature: Math.round((20 + Math.random() * 15) * 10) / 10,
        moisture: Math.round((30 + Math.random() * 40) * 10) / 10,
        timestamp: time.toISOString()
      });
    }
    
    return { data };
  }

  getMockWeatherData() {
    return {
      main: {
        temp: 22.5,
        feels_like: 24.1,
        humidity: 65,
        pressure: 1013
      },
      weather: [{
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }],
      wind: {
        speed: 3.5,
        deg: 210
      },
      name: 'Farm Location'
    };
  }
}

export default new ApiService();