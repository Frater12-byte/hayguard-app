import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';

const TeamManagement = () => {
  const { users, teamKPIs, loading } = useData();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'viewer',
    password: ''
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleAddUser = async (e) => {
    e.preventDefault();
    // TODO: Add API call to create user
    console.log('Creating user:', newUser);
    setNewUser({ name: '', email: '', role: 'viewer', password: '' });
    setShowAddUser(false);
    alert('User created successfully!');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    // TODO: Add API call to reset password
    console.log(`Password reset for user ${selectedUser.email}`);
    alert(`Password successfully reset for ${selectedUser.name}`);
    
    setResetPasswordData({ newPassword: '', confirmPassword: '' });
    setShowResetPassword(false);
    setSelectedUser(null);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc3545';
      case 'manager': return '#ffc107';
      case 'viewer': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#28a745' : '#6c757d';
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Team KPI Row - 3 boxes */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
            Total Team Members
          </h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
            {teamKPIs.totalUsers}
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
            Active Users
          </h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
            {teamKPIs.activeUsers}
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
            Administrators
          </h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>
            {teamKPIs.adminUsers}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Team Members</h2>
          <button
            onClick={() => setShowAddUser(true)}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Add New User
          </button>
        </div>

        {/* Users Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>User</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#007bff',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {user.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '500' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{user.email}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: getRoleColor(user.role)
                    }}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: getStatusColor(user.status)
                    }}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowResetPassword(true);
                        }}
                        style={{
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Reset Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Add New User</h3>
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Reset Password</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666' }}>
              Reset password for: <strong>{selectedUser.name}</strong>
            </p>
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={resetPasswordData.newPassword}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setSelectedUser(null);
                    setResetPasswordData({ newPassword: '', confirmPassword: '' });
                  }}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
