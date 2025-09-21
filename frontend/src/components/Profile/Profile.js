import React, { useState, useRef } from 'react';

const Profile = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || '',
    location: user.location || '',
    bio: user.bio || '',
    profilePicture: user.profilePicture || ''
  });
  const [imagePreview, setImagePreview] = useState(user.profilePicture || '');
  const fileInputRef = useRef(null);

  const [activityData] = useState([
    { action: 'Logged in', timestamp: '2 hours ago', details: 'Web application login' },
    { action: 'Updated sensor thresholds', timestamp: '1 day ago', details: 'Modified temperature alerts for Sensor-A3' },
    { action: 'Generated report', timestamp: '2 days ago', details: 'Monthly temperature and moisture analysis' },
    { action: 'Added team member', timestamp: '3 days ago', details: 'Invited Sarah Johnson to the team' },
    { action: 'Deployed new sensor', timestamp: '5 days ago', details: 'SENS-004 deployed in North Field' },
    { action: 'Updated profile', timestamp: '1 week ago', details: 'Changed profile picture and contact info' }
  ]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        setImagePreview(imageDataUrl);
        setProfileData(prev => ({
          ...prev,
          profilePicture: imageDataUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };
  // eslint-disable-next-line no-unused-vars
  const handleRemoveImage = () => {
    setImagePreview('/default-avatar.png');
    setProfileData(prev => ({
      ...prev,
      profilePicture: '/default-avatar.png'
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    onUpdateUser(profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      location: user.location || '',
      bio: user.bio || '',
      profilePicture: user.profilePicture || ''
    });
    setImagePreview(user.profilePicture || '');
    setIsEditing(false);
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>My Profile</h1>
        <p style={{ color: '#6b7280' }}>Manage your account settings and view your activity</p>
      </div>

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2>Profile Information</h2>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                style={{ background: '#3b82f6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={handleSave}
                  style={{ background: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Save
                </button>
                <button 
                  onClick={handleCancel}
                  style={{ background: '#6b7280', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={imagePreview || '/default-avatar.png'} 
                alt="Profile" 
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  objectFit: 'cover', 
                  border: '4px solid #e5e7eb',
                  cursor: isEditing ? 'pointer' : 'default'
                }}
                onClick={handleImageClick}
              />
              {isEditing && (
                <button 
                  onClick={handleImageClick}
                  style={{ 
                    position: 'absolute', 
                    bottom: '5px', 
                    right: '5px', 
                    background: '#3b82f6', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '50%', 
                    width: '36px', 
                    height: '36px', 
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  📷
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem' }}>{profileData.name}</h3>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>{profileData.role}</p>
              <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>{profileData.location}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Full Name
              </label>
              {isEditing ? (
                <input 
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              ) : (
                <p style={{ margin: '0', padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>{profileData.name}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Email Address
              </label>
              {isEditing ? (
                <input 
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              ) : (
                <p style={{ margin: '0', padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>{profileData.email}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Phone Number
              </label>
              {isEditing ? (
                <input 
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              ) : (
                <p style={{ margin: '0', padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
                  {profileData.phone || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Role
              </label>
              {isEditing ? (
                <select 
                  value={profileData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                >
                  <option value="">Select Role</option>
                  <option value="Farm Owner">Farm Owner</option>
                  <option value="Farm Manager">Farm Manager</option>
                  <option value="Sensor Technician">Sensor Technician</option>
                  <option value="Analytics Specialist">Analytics Specialist</option>
                </select>
              ) : (
                <p style={{ margin: '0', padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>{profileData.role}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Location
              </label>
              {isEditing ? (
                <input 
                  type="text"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              ) : (
                <p style={{ margin: '0', padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
                  {profileData.location || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Bio
              </label>
              {isEditing ? (
                <textarea 
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
                />
              ) : (
                <p style={{ margin: '0', padding: '12px', background: '#f9fafb', borderRadius: '6px', minHeight: '60px' }}>
                  {profileData.bio || 'No bio provided'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginBottom: '24px' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activityData.map((activity, index) => (
              <div key={index} style={{ 
                padding: '16px', 
                background: '#f8fafc', 
                borderRadius: '8px', 
                borderLeft: '4px solid #3b82f6' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ margin: '0', color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>
                    {activity.action}
                  </h4>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {activity.timestamp}
                  </span>
                </div>
                <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>
                  {activity.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid #e5e7eb', 
        marginTop: '24px' 
      }}>
        <h2 style={{ marginBottom: '24px' }}>Account Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>127</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Actions Performed</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>23</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Sensors Managed</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>45</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Reports Generated</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>12</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Days Active</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
