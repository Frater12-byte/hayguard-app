import React, { useState } from 'react';

const AddSensorModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'HG-500 Multi-Sensor'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSensor = {
      id: `S${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
      name: formData.name,
      location: formData.location,
      type: formData.type,
      status: 'active',
      batteryLevel: 100,
      temperature: parseFloat((15 + Math.random() * 10).toFixed(2)),
      moisture: parseFloat((10 + Math.random() * 15).toFixed(2)),
      lastUpdate: new Date().toISOString()
    };

    onAdd(newSensor);
    setFormData({ name: '', location: '', type: 'HG-500 Multi-Sensor' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="heading-2">Add New Sensor</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Sensor Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                className="form-input"
                placeholder="e.g. Sensor A001"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                className="form-input"
                placeholder="e.g. Field North - Bale A1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sensor Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))}
                className="form-input"
              >
                <option value="HG-500 Multi-Sensor">HG-500 Multi-Sensor</option>
                <option value="HG-300 Basic">HG-300 Basic</option>
                <option value="HG-700 Advanced">HG-700 Advanced</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Sensor
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: var(--border-radius-lg);
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: var(--spacing-6);
          border-bottom: 1px solid var(--gray-200);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--gray-500);
          padding: var(--spacing-2);
        }

        .modal-body {
          padding: var(--spacing-6);
        }

        .modal-footer {
          padding: var(--spacing-6);
          border-top: 1px solid var(--gray-200);
          display: flex;
          gap: var(--spacing-3);
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
};

export default AddSensorModal;
