// src/services/apiService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
};

export const apiService = {
  // Farms API
  farms: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/farms`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/api/farms/${id}`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    },

    create: async (farmData) => {
      const response = await fetch(`${API_BASE_URL}/api/farms`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(farmData)
      });
      return await handleResponse(response);
    },

    update: async (id, farmData) => {
      const response = await fetch(`${API_BASE_URL}/api/farms/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(farmData)
      });
      return await handleResponse(response);
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/api/farms/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    }
  },

  // Analytics API
  analytics: {
    getOverview: async (timeRange = '30d') => {
      const response = await fetch(`${API_BASE_URL}/api/analytics/overview?range=${timeRange}`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    },

    getCropPerformance: async (farmId = null) => {
      const url = farmId 
        ? `${API_BASE_URL}/api/analytics/crop-performance?farmId=${farmId}`
        : `${API_BASE_URL}/api/analytics/crop-performance`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    },

    getYieldTrends: async (period = 'monthly') => {
      const response = await fetch(`${API_BASE_URL}/api/analytics/yield-trends?period=${period}`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    }
  },

  // Weather API
  weather: {
    getCurrent: async (farmId = null) => {
      const url = farmId 
        ? `${API_BASE_URL}/api/weather/current?farmId=${farmId}`
        : `${API_BASE_URL}/api/weather/current`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    },

    getForecast: async (days = 5, farmId = null) => {
      const url = farmId 
        ? `${API_BASE_URL}/api/weather/forecast?days=${days}&farmId=${farmId}`
        : `${API_BASE_URL}/api/weather/forecast?days=${days}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    },

    getAlerts: async () => {
      const response = await fetch(`${API_BASE_URL}/api/weather/alerts`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    }
  },

  // Alerts API
  alerts: {
    getAll: async (status = 'all', type = 'all') => {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (type !== 'all') params.append('type', type);
      
      const response = await fetch(`${API_BASE_URL}/api/alerts?${params}`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    },

    acknowledge: async (alertId) => {
      const response = await fetch(`${API_BASE_URL}/api/alerts/${alertId}/acknowledge`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    },

    resolve: async (alertId) => {
      const response = await fetch(`${API_BASE_URL}/api/alerts/${alertId}/resolve`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    },

    create: async (alertData) => {
      const response = await fetch(`${API_BASE_URL}/api/alerts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(alertData)
      });
      return await handleResponse(response);
    }
  },

  // Reports API
  reports: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    },

    generate: async (reportType, parameters = {}) => {
      const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type: reportType, parameters })
      });
      return await handleResponse(response);
    },

    download: async (reportId) => {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/download`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  },

  // Team API
  team: {
    getMembers: async () => {
      const response = await fetch(`${API_BASE_URL}/api/team/members`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    },

    getMember: async (memberId) => {
      const response = await fetch(`${API_BASE_URL}/api/team/members/${memberId}`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    },

    addMember: async (memberData) => {
      const response = await fetch(`${API_BASE_URL}/api/team/members`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(memberData)
      });
      return await handleResponse(response);
    },

    updateMember: async (memberId, memberData) => {
      const response = await fetch(`${API_BASE_URL}/api/team/members/${memberId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(memberData)
      });
      return await handleResponse(response);
    },

    removeMember: async (memberId) => {
      const response = await fetch(`${API_BASE_URL}/api/team/members/${memberId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    }
  },

  // Equipment/Irrigation API
  equipment: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/equipment`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    },

    getStatus: async (equipmentId) => {
      const response = await fetch(`${API_BASE_URL}/api/equipment/${equipmentId}/status`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    },

    updateStatus: async (equipmentId, status) => {
      const response = await fetch(`${API_BASE_URL}/api/equipment/${equipmentId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      return await handleResponse(response);
    }
  }
};