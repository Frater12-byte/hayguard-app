// src/services/userService.js
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
      // Unauthorized - token might be expired
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
};

export const userService = {
  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Get user preferences
  getPreferences: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/preferences`, {
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get preferences error:', error);
      throw error;
    }
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/preferences`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  },

  // Upload profile avatar
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/avatar`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  },

  // Delete user account
  deleteAccount: async (password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/account`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password })
      });
      
      if (response.ok) {
        localStorage.removeItem('token');
      }
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  },

  // Get user activity log
  getActivityLog: async (limit = 50, offset = 0) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/activity?limit=${limit}&offset=${offset}`,
        {
          headers: getAuthHeaders()
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get activity log error:', error);
      throw error;
    }
  },

  // Get user notifications
  getNotifications: async (limit = 20, offset = 0) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/notifications?limit=${limit}&offset=${offset}`,
        {
          headers: getAuthHeaders()
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Mark notification read error:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/notifications/read-all`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      throw error;
    }
  },

  // Export user data
  exportUserData: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/export`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'user-data-export.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true, message: 'Data exported successfully' };
    } catch (error) {
      console.error('Export user data error:', error);
      throw error;
    }
  },

  // Get user dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/dashboard-stats`, {
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/notification-settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Update notification settings error:', error);
      throw error;
    }
  },

  // Enable/disable two-factor authentication
  updateTwoFactorAuth: async (enabled, code = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/two-factor`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ enabled, code })
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Update 2FA error:', error);
      throw error;
    }
  },

  // Generate API key for user
  generateApiKey: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/api-key`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Generate API key error:', error);
      throw error;
    }
  },

  // Revoke API key
  revokeApiKey: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/api-key`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Revoke API key error:', error);
      throw error;
    }
  }
};