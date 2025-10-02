import React, { useState, useEffect } from 'react';
import { UserPlus, Key, Edit2, Mail, Clock, Trash2 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import './Team.css';

const TEAM_STORAGE_KEY = 'hayguard_team_members';

const Team = () => {
  const { user: contextUser } = useUser();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'Worker'
  });

  // Load team members from localStorage
  const loadTeamMembers = () => {
    try {
      const stored = localStorage.getItem(TEAM_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    }
    return [];
  };

  // Save team members to localStorage
  const saveTeamMembers = (members) => {
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(members));
    } catch (error) {
      console.error('Error saving team members:', error);
    }
  };

  // Initialize team members with current user
  const initializeTeamMembers = (currentUser) => {
    let members = loadTeamMembers();
    
    // Check if current user exists in team
    const currentUserInTeam = members.find(m => m.email === currentUser.email);
    
    if (!currentUserInTeam) {
      // Add current user as first member
      const currentUserMember = {
        id: 1,
        name: currentUser.name || 'Demo User',
        email: currentUser.email || 'demo@greenfieldfarm.com',
        role: currentUser.role || 'admin',
        status: 'active',
        joinedDate: currentUser.joinDate || new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString(),
        isCurrentUser: true,
        profilePicture: currentUser.profilePicture || null,
        phone: currentUser.phone,
        department: currentUser.department
      };
      
      members = [currentUserMember, ...members];
    } else {
      // Update existing current user data
      members = members.map(m => {
        if (m.email === currentUser.email) {
          return {
            ...m,
            name: currentUser.name || m.name,
            email: currentUser.email,
            role: currentUser.role || m.role,
            profilePicture: currentUser.profilePicture || m.profilePicture,
            phone: currentUser.phone,
            department: currentUser.department,
            isCurrentUser: true,
            lastActive: new Date().toISOString()
          };
        }
        return m;
      });
    }
    
    saveTeamMembers(members);
    return members;
  };

  // Initial load
  useEffect(() => {
    if (contextUser) {
      const members = initializeTeamMembers(contextUser);
      setTeamMembers(members);
      setLoading(false);
    }
  }, []);

  // Sync when context user changes (profile updates)
  useEffect(() => {
    if (contextUser && teamMembers.length > 0) {
      const updatedMembers = teamMembers.map(member => {
        if (member.isCurrentUser || member.email === contextUser.email) {
          return {
            ...member,
            name: contextUser.name || member.name,
            email: contextUser.email,
            role: contextUser.role || member.role,
            profilePicture: contextUser.profilePicture,
            phone: contextUser.phone,
            department: contextUser.department,
            isCurrentUser: true,
            lastActive: new Date().toISOString()
          };
        }
        return member;
      });
      
      setTeamMembers(updatedMembers);
      saveTeamMembers(updatedMembers);
    }
  }, [contextUser?.profilePicture, contextUser?.name, contextUser?.email, contextUser?.phone]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const handlePasswordReset = async () => {
    if (!newPassword.trim()) {
      showNotification('Please generate or enter a password', 'error');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      showNotification(`Password updated for ${selectedMember.name}`, 'success');
      setShowPasswordModal(false);
      setSelectedMember(null);
      setNewPassword('');
    } catch (error) {
      showNotification('Failed to reset password', 'error');
    }
  };

  const handleEditMember = async (e) => {
    e.preventDefault();
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedMembers = teamMembers.map(member => 
        member.id === selectedMember.id 
          ? { ...member, ...editForm }
          : member
      );
      
      setTeamMembers(updatedMembers);
      saveTeamMembers(updatedMembers);
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('teamMembersUpdated'));
      
      showNotification('Team member updated successfully!', 'success');
      setShowEditModal(false);
      setSelectedMember(null);
    } catch (error) {
      showNotification('Failed to update member', 'error');
    }
  };

  const handleDeleteMember = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedMembers = teamMembers.filter(member => member.id !== selectedMember.id);
      
      setTeamMembers(updatedMembers);
      saveTeamMembers(updatedMembers);
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('teamMembersUpdated'));
      
      showNotification(`${selectedMember.name} removed from team`, 'success');
      setShowDeleteModal(false);
      setSelectedMember(null);
    } catch (error) {
      showNotification('Failed to delete member', 'error');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const emailName = inviteForm.email.split('@')[0];
      const newMember = {
        id: Math.max(0, ...teamMembers.map(m => m.id)) + 1,
        name: emailName.charAt(0).toUpperCase() + emailName.slice(1),
        email: inviteForm.email,
        role: inviteForm.role === 'Farm Owner' ? 'admin' : 
              inviteForm.role === 'Farm Manager' ? 'manager' : 'worker',
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString(),
        isCurrentUser: false,
        profilePicture: null
      };
      
      const updatedMembers = [...teamMembers, newMember];
      setTeamMembers(updatedMembers);
      saveTeamMembers(updatedMembers);
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('teamMembersUpdated'));
      
      showNotification(`Invitation sent to ${inviteForm.email}!`, 'success');
      setInviteForm({ email: '', role: 'Worker' });
    } catch (error) {
      showNotification('Failed to send invitation', 'error');
    }
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setEditForm({
      name: member.name,
      email: member.email,
      role: member.role
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const formatLastActive = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 5) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getRoleBadgeClass = (role) => {
    const normalizedRole = role === 'admin' ? 'owner' : 
                           role === 'manager' ? 'manager' : 'worker';
    return `role-badge ${normalizedRole}`;
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin': return 'Farm Owner';
      case 'manager': return 'Farm Manager';
      case 'worker': return 'Worker';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="team-page">
        <div className="team-loading">Loading team members...</div>
      </div>
    );
  }

  const currentUser = teamMembers.find(m => m.isCurrentUser);
  
  const canManageMember = (member) => {
    return currentUser && 
      (currentUser.role === 'admin' || currentUser.role === 'manager') &&
      !member.isCurrentUser;
  };

  return (
    <div className="team-page">
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

      <div className="team-controls">
        <form onSubmit={handleInviteMember} className="controls-main">
          <input
            type="email"
            value={inviteForm.email}
            onChange={(e) => setInviteForm(prev => ({...prev, email: e.target.value}))}
            className="form-input"
            placeholder="Enter email address"
            required
          />
          <select
            value={inviteForm.role}
            onChange={(e) => setInviteForm(prev => ({...prev, role: e.target.value}))}
            className="filter-select"
          >
            <option value="Worker">Worker</option>
            <option value="Farm Manager">Farm Manager</option>
            <option value="Farm Owner">Farm Owner</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm">
            <UserPlus size={16} />
            Invite Member
          </button>
        </form>
      </div>

      <div className="team-list">
        <div className="team-list-header">
          <div className="header-cell">Name</div>
          <div className="header-cell">Email</div>
          <div className="header-cell">Role</div>
          <div className="header-cell">Joined</div>
          <div className="header-cell">Last Active</div>
          <div className="header-cell">Actions</div>
        </div>

        <div className="team-list-body">
          {teamMembers.map(member => (
            <div 
              key={member.id} 
              className={`team-list-row ${member.isCurrentUser ? 'current-user' : ''}`}
            >
              <div className="list-cell name-cell" data-label="Name">
                <div className="member-name-display">
                  {member.profilePicture ? (
                    <img 
                      src={member.profilePicture} 
                      alt={member.name}
                      className="member-avatar"
                    />
                  ) : (
                    <div className="member-avatar-placeholder">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="member-name">{member.name}</span>
                  {member.isCurrentUser && <span className="you-badge">You</span>}
                </div>
              </div>
              <div className="list-cell email-cell" data-label="Email">
                <Mail size={14} />
                {member.email}
              </div>
              <div className="list-cell role-cell" data-label="Role">
                <span className={getRoleBadgeClass(member.role)}>
                  {getRoleDisplay(member.role)}
                </span>
              </div>
              <div className="list-cell joined-cell" data-label="Joined">
                {new Date(member.joinedDate).toLocaleDateString()}
              </div>
              <div className="list-cell activity-cell" data-label="Last Active">
                <Clock size={14} />
                {formatLastActive(member.lastActive)}
              </div>
              <div className="list-cell actions-cell">
                {canManageMember(member) ? (
                  <div className="action-buttons">
                    <button 
                      className="btn-icon"
                      onClick={() => openEditModal(member)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="btn-icon"
                      onClick={() => {
                        setSelectedMember(member);
                        setShowPasswordModal(true);
                      }}
                      title="Reset Password"
                    >
                      <Key size={16} />
                    </button>
                    <button 
                      className="btn-icon btn-icon-danger"
                      onClick={() => openDeleteModal(member)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="no-actions">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Password Reset Modal */}
      {showPasswordModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="member-info-text">
                <strong>{selectedMember.name}</strong> ({selectedMember.email})
              </p>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="password-input-group">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter new password or generate one"
                  />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={generateRandomPassword}>
                    Generate
                  </button>
                </div>
              </div>
              <p className="form-help">Please provide the new password to the user securely.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePasswordReset}>Update Password</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Team Member</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditMember}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({...prev, email: e.target.value}))}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({...prev, role: e.target.value}))}
                    className="form-input"
                  >
                    <option value="worker">Worker</option>
                    <option value="manager">Farm Manager</option>
                    <option value="admin">Farm Owner</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove <strong>{selectedMember.name}</strong> from the team?</p>
              <p className="form-help">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteMember}>Delete Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;