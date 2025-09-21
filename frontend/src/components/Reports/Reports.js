import React, { useState } from 'react';

const Reports = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');
  const [selectedReportType, setSelectedReportType] = useState('comprehensive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([
    {
      id: 1,
      name: 'Temperature Analysis - March 2024',
      type: 'Temperature Report',
      dateGenerated: '2024-03-15',
      timeframe: '30 days',
      status: 'completed',
      fileSize: '2.3 MB'
    },
    {
      id: 2,
      name: 'Moisture Monitoring - February 2024',
      type: 'Moisture Report',
      dateGenerated: '2024-02-28',
      timeframe: '30 days',
      status: 'completed',
      fileSize: '1.8 MB'
    },
    {
      id: 3,
      name: 'Complete Farm Analysis - Q1 2024',
      type: 'Comprehensive Report',
      dateGenerated: '2024-01-31',
      timeframe: '90 days',
      status: 'completed',
      fileSize: '5.2 MB'
    }
  ]);

  const reportTypes = [
    {
      id: 'temperature',
      name: 'Temperature Report',
      description: 'Detailed temperature trends, anomalies, and sensor performance',
      icon: '🌡️',
      estimatedTime: '2-3 minutes'
    },
    {
      id: 'moisture',
      name: 'Moisture Report', 
      description: 'Moisture level analysis, risk assessment, and recommendations',
      icon: '💧',
      estimatedTime: '2-3 minutes'
    },
    {
      id: 'alerts',
      name: 'Alerts Summary',
      description: 'Critical alerts, warning patterns, and response analytics',
      icon: '⚠️',
      estimatedTime: '1-2 minutes'
    },
    {
      id: 'comprehensive',
      name: 'Complete Farm Report',
      description: 'Full analysis including all metrics, trends, and insights',
      icon: '📊',
      estimatedTime: '5-7 minutes'
    }
  ];

  const timeframes = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '1year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Generate sample CSV data based on report type
  const generateCSVData = (reportType) => {
    const headers = [];
    const rows = [];

    switch (reportType) {
      case 'temperature':
        headers.push('Date', 'Time', 'Sensor ID', 'Temperature (°C)', 'Location', 'Status', 'Alert Level');
        for (let i = 0; i < 100; i++) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          rows.push([
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            `TEMP-${String(i % 10 + 1).padStart(3, '0')}`,
            (18 + Math.random() * 15).toFixed(1),
            `Field ${String.fromCharCode(65 + (i % 5))}`,
            Math.random() > 0.1 ? 'Normal' : 'Alert',
            Math.random() > 0.8 ? 'Critical' : Math.random() > 0.6 ? 'Warning' : 'Normal'
          ]);
        }
        break;
      
      case 'moisture':
        headers.push('Date', 'Time', 'Sensor ID', 'Moisture (%)', 'Location', 'Recommended Action');
        for (let i = 0; i < 100; i++) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          const moisture = (8 + Math.random() * 12).toFixed(1);
          rows.push([
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            `MOIST-${String(i % 8 + 1).padStart(3, '0')}`,
            moisture,
            `Barn ${i % 3 + 1}`,
            moisture > 15 ? 'Monitor closely' : moisture < 10 ? 'Check ventilation' : 'Normal'
          ]);
        }
        break;
      
      case 'alerts':
        headers.push('Date', 'Time', 'Alert Type', 'Sensor ID', 'Message', 'Severity', 'Resolution Status');
        for (let i = 0; i < 50; i++) {
          const date = new Date(Date.now() - i * 60 * 60 * 1000);
          const alertTypes = ['Temperature', 'Moisture', 'System', 'Connection'];
          const severities = ['Critical', 'Warning', 'Info'];
          rows.push([
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            alertTypes[i % alertTypes.length],
            `SENS-${String(i % 12 + 1).padStart(3, '0')}`,
            `Alert message ${i + 1}`,
            severities[i % severities.length],
            Math.random() > 0.3 ? 'Resolved' : 'Open'
          ]);
        }
        break;
      
      default: // comprehensive
        headers.push('Date', 'Sensor ID', 'Temperature (°C)', 'Moisture (%)', 'Location', 'Status', 'Alerts Count');
        for (let i = 0; i < 200; i++) {
          const date = new Date(Date.now() - i * 12 * 60 * 60 * 1000);
          rows.push([
            date.toLocaleDateString(),
            `SENS-${String(i % 15 + 1).padStart(3, '0')}`,
            (18 + Math.random() * 15).toFixed(1),
            (8 + Math.random() * 12).toFixed(1),
            `Location ${String.fromCharCode(65 + (i % 5))}`,
            Math.random() > 0.1 ? 'Normal' : 'Alert',
            Math.floor(Math.random() * 5)
          ]);
        }
    }

    return { headers, rows };
  };

  // Convert data to CSV format and download
  const downloadCSV = (reportType, reportName) => {
    const { headers, rows } = generateCSVData(reportType);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportName.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const selectedType = reportTypes.find(type => type.id === selectedReportType);
      const timeframeLabel = timeframes.find(tf => tf.value === selectedTimeframe)?.label;
      
      const newReport = {
        id: generatedReports.length + 1,
        name: `${selectedType.name} - ${new Date().toLocaleDateString()}`,
        type: selectedType.name,
        dateGenerated: new Date().toISOString().split('T')[0],
        timeframe: timeframeLabel,
        status: 'completed',
        fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
        reportTypeId: selectedReportType
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
      setIsGenerating(false);
    }, 3000);
  };

  const handleDownloadReport = (report) => {
    const reportTypeId = report.reportTypeId || selectedReportType;
    downloadCSV(reportTypeId, report.name);
  };

  const handleDeleteReport = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setGeneratedReports(prev => prev.filter(report => report.id !== reportId));
    }
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1>Reports & Analytics</h1>
        <p style={{ color: '#6b7280' }}>Generate comprehensive reports and analyze your farm data</p>
      </div>

      {/* Report Generation Section */}
      <div style={{ 
        background: 'white', 
        padding: '32px', 
        borderRadius: '12px', 
        border: '1px solid #e5e7eb', 
        marginBottom: '32px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: '24px' }}>Generate New Report</h2>
        
        {/* Report Type Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
            Select Report Type:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {reportTypes.map(type => (
              <div 
                key={type.id}
                onClick={() => setSelectedReportType(type.id)}
                style={{ 
                  padding: '16px', 
                  border: selectedReportType === type.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  background: selectedReportType === type.id ? '#eff6ff' : 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>{type.icon}</span>
                  <h4 style={{ margin: '0', color: '#111827' }}>{type.name}</h4>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
                  {type.description}
                </p>
                <small style={{ color: '#9ca3af' }}>
                  Est. generation time: {type.estimatedTime}
                </small>
              </div>
            ))}
          </div>
        </div>

        {/* Time Period Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
            Time Period:
          </label>
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            style={{ 
              padding: '12px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px', 
              width: '300px',
              fontSize: '14px'
            }}
          >
            {timeframes.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>
        </div>

        {/* Generate Button */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            style={{ 
              background: isGenerating ? '#9ca3af' : '#10b981', 
              color: 'white', 
              padding: '12px 24px', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isGenerating ? (
              <>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid #ffffff', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Generating Report...
              </>
            ) : (
              <>
                📊 Generate Report
              </>
            )}
          </button>
          
          {isGenerating && (
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              This may take a few minutes depending on the data size...
            </div>
          )}
        </div>
      </div>

      {/* Generated Reports Section */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
          <h2 style={{ margin: '0' }}>Generated Reports ({generatedReports.length})</h2>
        </div>
        
        {generatedReports.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>No reports generated yet</h3>
            <p style={{ color: '#9ca3af' }}>Generate your first report above to see it listed here.</p>
          </div>
        ) : (
          <div>
            {generatedReports.map(report => (
              <div key={report.id} style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid #f3f4f6', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ 
                      padding: '8px', 
                      background: '#eff6ff', 
                      borderRadius: '8px',
                      fontSize: '20px'
                    }}>
                      📊
                    </div>
                    <div>
                      <h4 style={{ margin: '0', color: '#111827', fontSize: '16px' }}>{report.name}</h4>
                      <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>{report.type}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <strong>Generated:</strong> {new Date(report.dateGenerated).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <strong>Period:</strong> {report.timeframe}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <strong>Size:</strong> {report.fileSize}
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      <span style={{ 
                        background: '#dcfce7', 
                        color: '#166534', 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleDownloadReport(report)}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    📥 Download CSV
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Reports;