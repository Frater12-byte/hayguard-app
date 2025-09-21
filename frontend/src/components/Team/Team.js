import React, { useState } from 'react';
import './Team.css';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([
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
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [emailStatus, setEmailStatus] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const handleInviteUser = async (e) => {
    e.preventDefault();
    setEmailStatus('sending');
    
    // Mock email sending process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll show different outcomes
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        setEmailStatus('success');
        setInviteEmail('');
        setInviteRole('viewer');
        setShowInviteForm(false);
        
        // Note: In a real app, the user would be added after they accept the invite
        // For demo, we'll add them immediately
        const newMember = {
          id: teamMembers.length + 1,
          name: 'Pending User',
          email: inviteEmail,
          role: inviteRole,
          status: 'pending',
          joinDate: new Date().toISOString().split('T')[0],
          avatar: '/default-avatar.png'
        };
        setTeamMembers([...teamMembers, newMember]);
      } else {
        setEmailStatus('error');
      }
      
      setTimeout(() => setEmailStatus(''), 5000);
    } catch (error) {
      setEmailStatus('error');
      setTimeout(() => setEmailStatus(''), 5000);
    }
  };

  const handlePasswordReset = async (memberId) => {
    setEmailStatus('sending-reset');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock password reset email
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      if (success) {
        setEmailStatus('reset-success');
      } else {
        setEmailStatus('reset-error');
      }
      
      setTimeout(() => setEmailStatus(''), 5000);
    } catch (error) {
      setEmailStatus('reset-error');
      setTimeout(() => setEmailStatus(''), 5000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'pending': return '#ffc107';
      case 'inactive': return '#6c757d';
      default: return '#6c757d';
    }
  };

  return (
    <div className="team-management">
      <div className="team-header">
        <h1>Team Management</h1>
        <button 
          className="invite-btn"
          onClick={() => setShowInviteForm(true)}
        >
          + Invite Team Member
        </button>
      </div>

      {/* Email Status Messages */}
      {emailStatus === 'sending' && (
        <div className="status-message info">
          📧 Sending invitation email...
        </div>
      )}
      
      {emailStatus === 'success' && (
        <div className="status-message success">
          ✅ Invitation email sent successfully!
        </div>
      )}
      
      {emailStatus === 'error' && (
        <div className="status-message error">
          ❌ Failed to send invitation email. Please check the email address and try again.
          <br />
          <small>Note: This is a demo - email functionality requires backend configuration.</small>
        </div>
      )}

      {emailStatus === 'sending-reset' && (
        <div className="status-message info">
          📧 Sending password reset email...
        </div>
      )}
      
      {emailStatus === 'reset-success' && (
        <div className="status-message success">
          ✅ Password reset email sent successfully!
        </div>
      )}
      
      {emailStatus === 'reset-error' && (
        <div className="status-message error">
          ❌ Failed to send password reset email. Please try again.
          <br />
          <small>Note: This is a demo - email functionality requires backend configuration.</small>
        </div>
      )}

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="modal-overlay">
          <div className="invite-modal">
            <div className="modal-header">
              <h3>Invite Team Member</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowInviteForm(false)}
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
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="inviteRole">Role</label>
                <select
                  id="inviteRole"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="viewer">Viewer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowInviteForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="send-invite-btn"
                  disabled={emailStatus === 'sending'}
                >
                  {emailStatus === 'sending' ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Members List */}
      <div className="team-members">
        {teamMembers.map(member => (
          <div key={member.id} className="member-card">
            <div className="member-info">
              <img src={member.avatar} alt={member.name} className="member-avatar" />
              <div className="member-details">
                <h3>{member.name}</h3>
                <p className="member-email">{member.email}</p>
                <div className="member-meta">
                  <span className="member-role">{member.role}</span>
                  <span 
                    className="member-status"
                    style={{ color: getStatusColor(member.status) }}
                  >
                    {member.status.toUpperCase()}
                  </span>
                </div>
                <p className="member-join-date">Joined: {member.joinDate}</p>
              </div>
            </div>
            
            <div className="member-actions">
              <button 
                className="reset-password-btn"
                onClick={() => handlePasswordReset(member.id)}
                disabled={emailStatus === 'sending-reset'}
              >
                Reset Password
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Email Configuration Notice */}
      <div className="email-notice">
        <h3>Email Configuration</h3>
        <p>
          Email functionality is currently in demo mode. To enable real email sending, configure:
        </p>
        <ul>
          <li>SMTP server settings in backend configuration</li>
          <li>Email service provider (SendGrid, AWS SES, etc.)</li>
          <li>Email templates for invitations and password resets</li>
          <li>Domain verification for reliable delivery</li>
        </ul>
      </div>
    </div>
  );
};

export default Team;
