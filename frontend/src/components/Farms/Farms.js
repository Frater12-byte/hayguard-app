import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Farms.css';

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Simulate API call - replace with actual API call
    setTimeout(() => {
      setFarms([
        {
          id: 1,
          name: 'North Field',
          location: 'Section A1',
          size: 25.5,
          cropType: 'Wheat',
          status: 'active',
          lastActivity: '2024-01-15',
          yield: 850,
          healthScore: 85
        },
        {
          id: 2,
          name: 'South Valley',
          location: 'Section B2',
          size: 18.2,
          cropType: 'Corn',
          status: 'active',
          lastActivity: '2024-01-14',
          yield: 720,
          healthScore: 92
        },
        {
          id: 3,
          name: 'East Ridge',
          location: 'Section C1',
          size: 12.8,
          cropType: 'Soybeans',
          status: 'maintenance',
          lastActivity: '2024-01-10',
          yield: 450,
          healthScore: 67
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredFarms = farms.filter(farm => {
    const matchesSearch = farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farm.cropType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || farm.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'badge-success', text: 'Active' },
      maintenance: { class: 'badge-warning', text: 'Maintenance' },
      inactive: { class: 'badge-danger', text: 'Inactive' }
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="farms-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading farms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="farms-container">
      <div className="farms-header">
        <div className="header-content">
          <h2>Farm Management</h2>
          <p>Manage and monitor all your agricultural properties</p>
        </div>
        <button className="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Add New Farm
        </button>
      </div>

      <div className="farms-controls">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5.5 12.49 5.5 9.5S7.01 5 9.5 5 13.5 7.01 13.5 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Search farms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="farms-grid">
        {filteredFarms.map(farm => (
          <div key={farm.id} className="farm-card">
            <div className="farm-card-header">
              <div className="farm-info">
                <h3>{farm.name}</h3>
                <p className="farm-location">{farm.location}</p>
              </div>
              {getStatusBadge(farm.status)}
            </div>

            <div className="farm-stats">
              <div className="stat-item">
                <span className="stat-label">Size</span>
                <span className="stat-value">{farm.size} acres</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Crop</span>
                <span className="stat-value">{farm.cropType}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Yield</span>
                <span className="stat-value">{farm.yield} kg</span>
              </div>
            </div>

            <div className="health-score">
              <div className="health-label">Health Score</div>
              <div className="health-bar">
                <div 
                  className="health-fill" 
                  style={{ 
                    width: `${farm.healthScore}%`,
                    backgroundColor: getHealthScoreColor(farm.healthScore)
                  }}
                ></div>
              </div>
              <span className="health-value">{farm.healthScore}%</span>
            </div>

            <div className="farm-actions">
              <Link to={`/farms/${farm.id}`} className="btn btn-secondary">
                View Details
              </Link>
              <button className="btn btn-primary">
                Manage
              </button>
            </div>

            <div className="farm-footer">
              <span className="last-activity">
                Last activity: {new Date(farm.lastActivity).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredFarms.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3>No farms found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Farms;