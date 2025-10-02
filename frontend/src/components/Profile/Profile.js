import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Briefcase, Calendar, Shield, Key, Camera, X, Check } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useUser();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const showNotification = (message, type = 'success') => {
    if (!message) {
      console.error('Notification called without message');
      return;
    }
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      showNotification('Name and email are required', 'error');
      return;
    }

    try {
      await updateUser(formData);
      
      // Update Team section via localStorage
      const teamMembers = JSON.parse(localStorage.getItem('hayguard_team_members') || '[]');
      const updatedTeamMembers = teamMembers.map(member => 
        member.isCurrentUser ? { ...member, ...formData } : member
      );
      localStorage.setItem('hayguard_team_members', JSON.stringify(updatedTeamMembers));
      
      setIsEditing(false);
      
      // Dispatch event for header
      window.dispatchEvent(new CustomEvent('userUpdated', { 
        detail: formData 
      }));
      
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Update error:', error);
      showNotification('Failed to update profile. Please try again.', 'error');
    }
  };

  const handlePictureUpload = async (file) => {
    if (!file) {
      showNotification('No file selected', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file (JPG, PNG, GIF)', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification('File size must be less than 5MB', 'error');
      return;
    }

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const result = e.target.result;
        const updatedUserData = { ...user, profilePicture: result };
        
        await updateUser(updatedUserData);
        
        // Update Team section
        const teamMembers = JSON.parse(localStorage.getItem('hayguard_team_members') || '[]');
        const updatedTeamMembers = teamMembers.map(member => 
          member.isCurrentUser ? { ...member, profilePicture: result } : member
        );
        localStorage.setItem('hayguard_team_members', JSON.stringify(updatedTeamMembers));
        
        // Dispatch event for header
        window.dispatchEvent(new CustomEvent('userUpdated', { 
          detail: updatedUserData 
        }));
        
        showNotification('Profile picture updated successfully!', 'success');
      };
      
      reader.onerror = () => {
        showNotification('Error reading file. Please try again.', 'error');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Failed to update picture. Please try again.', 'error');
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handlePictureUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handlePictureUpload(file);
    }
  };

  const handleRemovePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    try {
      const updatedUserData = { ...user, profilePicture: null };
      
      await updateUser(updatedUserData);
      
      // Update Team section
      const teamMembers = JSON.parse(localStorage.getItem('hayguard_team_members') || '[]');
      const updatedTeamMembers = teamMembers.map(member => 
        member.isCurrentUser ? { ...member, profilePicture: null } : member
      );
      localStorage.setItem('hayguard_team_members', JSON.stringify(updatedTeamMembers));
      
      // Dispatch event for header
      window.dispatchEvent(new CustomEvent('userUpdated', { 
        detail: updatedUserData 
      }));
      
      showNotification('Profile picture removed successfully!', 'success');
    } catch (error) {
      console.error('Remove picture error:', error);
      showNotification('Failed to remove picture. Please try again.', 'error');
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // In a real app, this would call an API to change the password
    showNotification('Password changed successfully!', 'success');
    setIsChangingPassword(false);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'role-badge admin';
      case 'manager': return 'role-badge manager';
      default: return 'role-badge user';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Farm Owner';
      case 'manager': return 'Farm Manager';
      default: return 'Worker';
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="loading-message">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <span>{notification.message}</span>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-header-content">
          <div className="profile-picture-section">
            <div 
              className={`profile-picture-upload-area ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="picture-upload-input"
              />
              
              {user.profilePicture ? (
                <>
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="profile-picture"
                  />
                  <div className="picture-overlay">
                    <Camera size={24} />
                    <span>Change Photo</span>
                  </div>
                </>
              ) : (
                <div className="profile-picture-placeholder">
                  <div className="placeholder-icon">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="picture-overlay">
                    <Camera size={24} />
                    <span>Upload Photo</span>
                  </div>
                </div>
              )}
            </div>
            
            {user.profilePicture && (
              <button 
                type="button"
                className="btn btn-danger btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePicture();
                }}
              >
                <X size={16} />
                Remove Photo
              </button>
            )}
            <p className="upload-hint">Click or drag to upload</p>
          </div>
          
          <div className="profile-info-section">
            <h2 className="profile-name">{user.name}</h2>
            <div className={getRoleBadgeClass(user.role)}>
              {getRoleLabel(user.role)}
            </div>
            <div className="profile-meta">
              <div className="meta-item">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="meta-item">
                  <Phone size={16} />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="meta-item">
                <Calendar size={16} />
                <span>Member since {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content-grid">
        {/* Profile Information Card */}
        <div className="profile-card">
          <div className="card-header">
            <div className="card-title">
              <User size={20} />
              <h3>Profile Information</h3>
            </div>
            {!isEditing && (
              <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
                Edit Information
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="profile-form">
              <div className="form-group">
                <label htmlFor="profile-name">Full Name *</label>
                <input
                  type="text"
                  id="profile-name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-email">Email *</label>
                <input
                  type="email"
                  id="profile-email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-phone">Phone</label>
                <input
                  type="tel"
                  id="profile-phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-department">Department</label>
                <input
                  type="text"
                  id="profile-department"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="profile-actions">
                <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                  <Check size={16} />
                  Save Changes
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setFormData(user || {});
                  setIsEditing(false);
                }}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-display">
              <div className="info-item">
                <label>Full Name</label>
                <div className="info-value">{user.name || 'Not set'}</div>
              </div>
              <div className="info-item">
                <label>Email</label>
                <div className="info-value">{user.email || 'Not set'}</div>
              </div>
              <div className="info-item">
                <label>Role</label>
                <div className="info-value">{getRoleLabel(user.role)}</div>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <div className="info-value">{user.phone || 'Not set'}</div>
              </div>
              <div className="info-item">
                <label>Department</label>
                <div className="info-value">{user.department || 'Not set'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Security Settings Card */}
        <div className="profile-card">
          <div className="card-header">
            <div className="card-title">
              <Shield size={20} />
              <h3>Security Settings</h3>
            </div>
            {!isChangingPassword && (
              <button className="btn btn-secondary btn-sm" onClick={() => setIsChangingPassword(true)}>
                <Key size={16} />
                Change Password
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <div className="profile-form">
              <div className="form-group">
                <label htmlFor="current-password">Current Password</label>
                <input
                  type="password"
                  id="current-password"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  type="password"
                  id="new-password"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  className="form-input"
                  required
                />
              </div>
              <div className="profile-actions">
                <button type="button" className="btn btn-primary" onClick={handlePasswordChange}>
                  <Check size={16} />
                  Update Password
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsChangingPassword(false)}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-display">
              <div className="info-item">
                <label>Password</label>
                <div className="info-value">••••••••••••</div>
              </div>
              <div className="info-item">
                <label>Account Status</label>
                <div className="info-value status-active">
                  <Check size={16} />
                  Active
                </div>
              </div>
              <div className="info-item">
                <label>Last Login</label>
                <div className="info-value">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Permissions Card */}
        <div className="profile-card permissions-card">
          <div className="card-header">
            <div className="card-title">
              <Briefcase size={20} />
              <h3>Permissions & Access</h3>
            </div>
          </div>

          <div className="permissions-grid">
            <div className="permission-item">
              <Check size={16} className="permission-icon" />
              <span>View farm data</span>
            </div>
            <div className="permission-item">
              <Check size={16} className="permission-icon" />
              <span>Monitor sensors</span>
            </div>
            <div className="permission-item">
              <Check size={16} className="permission-icon" />
              <span>View reports</span>
            </div>
            <div className="permission-item">
              <Check size={16} className="permission-icon" />
              <span>Manage team members</span>
            </div>
            <div className="permission-item">
              <Check size={16} className="permission-icon" />
              <span>Configure settings</span>
            </div>
            <div className="permission-item">
              <Check size={16} className="permission-icon" />
              <span>Export data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;