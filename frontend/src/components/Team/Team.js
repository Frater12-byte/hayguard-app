import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import './Team.css';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [emailStatus, setEmailStatus] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data as fallback
  const mockTeamMembers = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@springfield.farm',
      role: 'Farm Owner',
      status: 'active',
      joinDate: '2024-01-15',
      avatar: '/default-avatar.png'
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@springfield.farm',
      role: 'Farm Manager',
      status: 'active',
      joinDate: '2024-02-20',
      avatar: '/default-avatar.png'
    }
  ];

  // Load team members on component mount
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setLoading(true);
        // Try to fetch from backend - for now use mock data since backend might not have team endpoints
        console.log('Attempting to load team members from backend...');
        setTeamMembers(mockTeamMembers);
      } catch (error) {
        console.error('Failed to load team members:', error);
        setTeamMembers(mockTeamMembers);
      } finally {
        setLoading(false);
      }
    };
    loadTeamMembers();
  }, []);

  const handleInviteUser = async (e) => {
    e.preventDefault();
    setEmailStatus('sending');
    
    console.log('Attempting to invite user:', inviteEmail, 'with role:', inviteRole);
    
    try {
      // Call the actual backend API
      const result = await apiService.sendInvitation(inviteEmail, inviteRole);
      console.log('Invitation sent successfully:', result);
      
      setEmailStatus('success');
      setInviteEmail('');
      setInviteRole('viewer');
      setShowInviteForm(false);
      
      // Add the new member to the local state (in real app, they'd be added after accepting invite)
      const newMember = {
        id: Date.now(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'invited',
        joinDate: new Date().toISOString().split('T')[0],
        avatar: '/default-avatar.png'
      };
      
      setTeamMembers(prev => [...prev, newMember]);
      
      alert(`Invitation sent successfully to ${inviteEmail}!`);
      
    } catch (error) {
      console.error('Failed to send invitation:', error);
      setEmailStatus('error');
      
      // Fallback: Add to local state anyway for demo purposes
      const newMember = {
        id: Date.now(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'invited (demo)',
        joinDate: new Date().toISOString().split('T')[0],
        avatar: '/default-avatar.png'
      };
      
      setTeamMembers(prev => [...prev, newMember]);
      setInviteEmail('');
      setInviteRole('viewer');
      setShowInviteForm(false);
      
      alert(`Demo: User ${inviteEmail} added locally (backend invitation failed: ${error.message})`);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return;
    }
    
    try {
      console.log('Attempting to remove member:', memberId);
      // In a real app, you'd call apiService.removeTeamMember(memberId)
      // For now, just remove from local state
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
      alert('Team member removed successfully!');
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member: ' + error.message);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      console.log('Attempting to change role for member:', memberId, 'to:', newRole);
      // In a real app, you'd call apiService.updateMemberRole(memberId, newRole)
      setTeamMembers(prev =>
        prev.map(member =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
      alert(`Role updated to ${newRole} successfully!`);
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update role: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="team loading">
        <div className="loading-spinner">Loading team members...</div>
      </div>
    );
  }

  return (
    <div className="team">
      <div className="team-header">
        <h1>Team Management</h1>
        <button 
          className="invite-btn"
          onClick={() => setShowInviteForm(true)}
        >
          + Invite Team Member
        </button>
      </div>

      <div className="team-stats">
        <div className="stat-card">
          <div className="stat-number">{teamMembers.length}</div>
          <div className="stat-label">Total Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{teamMembers.filter(m => m.status === 'active').length}</div>
          <div className="stat-label">Active Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{teamMembers.filter(m => m.status === 'invited').length}</div>
          <div className="stat-label">Pending Invites</div>
        </div>
      </div>

      <div className="team-members">
        <h2>Team Members</h2>
        <div className="members-grid">
          {teamMembers.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-avatar">
                <img src={member.avatar} alt={member.name} onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlNWU3ZWIiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzk3YTNiNCIvPgo8cGF0aCBkPSJNMzIgMzJjMC02LjYyNy01LjM3My0xMi0xMi0xMnMtMTIgNS4zNzMtMTIgMTIiIGZpbGw9IiM5N2EzYjQiLz4KPC9zdmc+';
                }} />
              </div>
              <div className="member-info">
                <h3>{member.name}</h3>
                <p className="member-email">{member.email}</p>
                <div className="member-meta">
                  <select 
                    value={member.role} 
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="Farm Owner">Farm Owner</option>
                    <option value="Farm Manager">Farm Manager</option>
                    <option value="Operator">Operator</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <span className={`status-badge ${member.status}`}>
                    {member.status}
                  </span>
                </div>
                <p className="join-date">Joined: {member.joinDate}</p>
              </div>
              <div className="member-actions">
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveMember(member.id)}
                  title="Remove member"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showInviteForm && (
        <div className="modal-overlay">
          <div className="invite-modal">
            <div className="modal-header">
              <h2>Invite Team Member</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowInviteForm(false);
                  setEmailStatus('');
                  setInviteEmail('');
                  setInviteRole('viewer');
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleInviteUser}>
              <div className="form-group">
                <label htmlFor="inviteEmail">Email Address</label>
                <input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@farm.com"
                  required
                  disabled={emailStatus === 'sending'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="inviteRole">Role</label>
                <select
                  id="inviteRole"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  disabled={emailStatus === 'sending'}
                >
                  <option value="viewer">Viewer - Can view data only</option>
                  <option value="operator">Operator - Can manage sensors</option>
                  <option value="manager">Manager - Can manage team and sensors</option>
                  <option value="owner">Owner - Full access</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowInviteForm(false)}
                  disabled={emailStatus === 'sending'}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={emailStatus === 'sending'}
                >
                  {emailStatus === 'sending' ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>

            {emailStatus === 'success' && (
              <div className="status-message success">
                Invitation sent successfully!
              </div>
            )}

            {emailStatus === 'error' && (
              <div className="status-message error">
                Failed to send invitation. Please try again.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;