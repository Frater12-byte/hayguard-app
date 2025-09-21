import React, { useState } from 'react';
import { apiService } from '../../services/apiService';

const APIDebugTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  };

  const testAuthentication = async () => {
    addResult('=== TESTING AUTHENTICATION ===');
    
    const token = localStorage.getItem('token');
    if (token) {
      addResult(`Token found: ${token.substring(0, 20)}...`, 'success');
    } else {
      addResult('No token found - user not authenticated', 'error');
    }
    
    addResult(`API Base URL: ${apiService.baseURL}`, 'info');
  };

  const testBackendConnection = async () => {
    addResult('=== TESTING BACKEND CONNECTION ===');
    
    try {
      const response = await fetch('https://hayguard-app-backend.vercel.app');
      const data = await response.json();
      addResult(`Backend health check: ${data.message}`, 'success');
    } catch (error) {
      addResult(`Backend connection failed: ${error.message}`, 'error');
    }
  };

  const testSensorAPI = async () => {
    addResult('=== TESTING SENSOR API ===');
    
    try {
      const sensors = await apiService.getSensors();
      addResult(`getSensors() succeeded: ${JSON.stringify(sensors).substring(0, 100)}...`, 'success');
    } catch (error) {
      addResult(`getSensors() failed: ${error.message}`, 'error');
    }
  };

  const testInvitationAPI = async () => {
    addResult('=== TESTING INVITATION API ===');
    
    try {
      const result = await apiService.sendInvitation('test@example.com', 'viewer');
      addResult(`sendInvitation() succeeded: ${JSON.stringify(result)}`, 'success');
    } catch (error) {
      addResult(`sendInvitation() failed: ${error.message}`, 'error');
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    addResult('Starting comprehensive API tests...', 'info');
    
    await testAuthentication();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testBackendConnection();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testSensorAPI();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testInvitationAPI();
    
    addResult('=== TESTS COMPLETED ===', 'info');
    setTesting(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>HayGuard API Debug Test</h2>
      <p>This component will test your backend API connections and show exactly what's failing.</p>
      
      <button 
        onClick={runAllTests}
        disabled={testing}
        style={{
          padding: '10px 20px',
          background: testing ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: testing ? 'not-allowed' : 'pointer'
        }}
      >
        {testing ? 'Running Tests...' : 'Run API Tests'}
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3>Test Results:</h3>
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '15px',
          minHeight: '200px',
          fontFamily: 'monospace',
          fontSize: '14px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {testResults.length === 0 ? (
            <div style={{ color: '#666' }}>Click "Run API Tests" to start debugging...</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} style={{
                color: result.type === 'error' ? '#dc3545' : 
                       result.type === 'success' ? '#28a745' : '#333',
                marginBottom: '5px',
                fontWeight: result.message.includes('===') ? 'bold' : 'normal'
              }}>
                [{result.timestamp}] {result.message}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <strong>What this test shows:</strong>
        <ul>
          <li>Whether you're authenticated (have a token)</li>
          <li>If the backend server is reachable</li>
          <li>If the API endpoints exist and work</li>
          <li>The exact error messages when calls fail</li>
        </ul>
      </div>
    </div>
  );
};

export default APIDebugTest;