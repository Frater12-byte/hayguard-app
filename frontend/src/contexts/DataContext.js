// src/contexts/DataContext.js
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import dataGenService from '../services/dataGenerationService';

const DataContext = createContext();

// Load farm info from localStorage
const loadFarmInfoFromStorage = () => {
  try {
    const stored = localStorage.getItem('hayguard_farm_info');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading farm info:', error);
  }
  
  return {
    id: 1,
    name: 'Greenfield Farm',
    location: {
      address: '1234 Rural Route 5, Farmington, IA 52626',
      latitude: 40.6331,
      longitude: -91.7578
    },
    details: {
      owner: 'John Smith',
      manager: 'Sarah Johnson',
      totalAcres: 250,
      establishedYear: 2018,
      farmType: 'Mixed Crop',
      phone: '+1 (555) 123-4567',
      email: 'contact@greenfieldfarm.com'
    }
  };
};

// Initial state
const initialState = {
  farmInfo: loadFarmInfoFromStorage(),
  sensors: [],
  users: [],
  alerts: [],
  loading: false,
  error: null
};

// Helper functions for localStorage alert status
const ALERT_STATUS_KEY = 'hayguard_alert_statuses';

const getAlertKey = (alert) => {
  return `${alert.sensorId}-${alert.type}-${alert.severity}-${alert.threshold}`;
};

const loadAlertStatuses = () => {
  try {
    const stored = localStorage.getItem(ALERT_STATUS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading alert statuses:', error);
    return {};
  }
};

const saveAlertStatuses = (statuses) => {
  try {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const cleanedStatuses = {};
    
    Object.keys(statuses).forEach(key => {
      const status = statuses[key];
      if (status.resolvedAt && status.resolvedAt > sevenDaysAgo) {
        cleanedStatuses[key] = status;
      }
    });
    
    localStorage.setItem(ALERT_STATUS_KEY, JSON.stringify(cleanedStatuses));
  } catch (error) {
    console.error('Error saving alert statuses:', error);
  }
};

// Reducer function
const dataReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_SENSOR':
      return {
        ...state,
        sensors: Array.isArray(state.sensors) ? [...state.sensors, action.payload] : [action.payload]
      };
    
    case 'UPDATE_SENSOR':
      return {
        ...state,
        sensors: Array.isArray(state.sensors) 
          ? state.sensors.map(sensor => 
              sensor.id === action.payload.id 
                ? { ...sensor, ...action.payload }
                : sensor
            )
          : [action.payload]
      };
    
    case 'DELETE_SENSOR':
      return {
        ...state,
        sensors: Array.isArray(state.sensors) 
          ? state.sensors.filter(sensor => sensor.id !== action.payload)
          : []
      };
    
    case 'LOAD_SENSORS':
      return {
        ...state,
        sensors: Array.isArray(action.payload) ? action.payload : []
      };

    case 'ADD_USER':
      return {
        ...state,
        users: Array.isArray(state.users) ? [...state.users, action.payload] : [action.payload]
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: Array.isArray(state.users)
          ? state.users.map(user => 
              user.id === action.payload.id ? { ...user, ...action.payload } : user
            )
          : [action.payload]
      };
    
    case 'DELETE_USER':
      return {
        ...state,
        users: Array.isArray(state.users)
          ? state.users.filter(user => user.id !== action.payload)
          : []
      };

    case 'UPDATE_FARM_INFO':
      return {
        ...state,
        farmInfo: { ...state.farmInfo, ...action.payload }
      };

    case 'ADD_ALERT':
      return {
        ...state,
        alerts: Array.isArray(state.alerts) ? [...state.alerts, action.payload] : [action.payload]
      };
    
    case 'UPDATE_ALERT':
      return {
        ...state,
        alerts: Array.isArray(state.alerts)
          ? state.alerts.map(alert => 
              alert.id === action.payload.id ? { ...alert, ...action.payload } : alert
            )
          : [action.payload]
      };

    case 'LOAD_ALERTS':
      return {
        ...state,
        alerts: Array.isArray(action.payload) ? action.payload : []
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;
  }
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const generateAlerts = useCallback((sensorsData) => {
    const newAlerts = [];
    let alertId = Date.now();
    const alertStatuses = loadAlertStatuses();

    sensorsData.forEach(sensor => {
      const now = new Date();

      if (sensor.currentTemperature !== null && sensor.optimalRanges?.temperature) {
        const { min, max } = sensor.optimalRanges.temperature;
        const temp = sensor.currentTemperature;

        if (temp > max + 5) {
          const alert = {
            id: alertId++,
            sensorId: sensor.id,
            sensorName: sensor.name,
            type: 'temperature',
            severity: 'critical',
            message: `Temperature critically high: ${temp}°C (optimal: ${min}-${max}°C)`,
            timestamp: now.toISOString(),
            value: temp,
            threshold: max,
            unit: '°C',
            resolved: false
          };
          const alertKey = getAlertKey(alert);
          if (alertStatuses[alertKey]?.resolved) {
            alert.resolved = true;
            alert.resolvedAt = alertStatuses[alertKey].resolvedAt;
          }
          newAlerts.push(alert);
        } else if (temp > max) {
          const alert = {
            id: alertId++,
            sensorId: sensor.id,
            sensorName: sensor.name,
            type: 'temperature',
            severity: 'warning',
            message: `Temperature above optimal: ${temp}°C (optimal: ${min}-${max}°C)`,
            timestamp: now.toISOString(),
            value: temp,
            threshold: max,
            unit: '°C',
            resolved: false
          };
          const alertKey = getAlertKey(alert);
          if (alertStatuses[alertKey]?.resolved) {
            alert.resolved = true;
            alert.resolvedAt = alertStatuses[alertKey].resolvedAt;
          }
          newAlerts.push(alert);
        }
      }

      if (sensor.currentMoisture !== null && sensor.optimalRanges?.moisture) {
        const { min, max } = sensor.optimalRanges.moisture;
        const moisture = sensor.currentMoisture;

        if (moisture > max + 10) {
          const alert = {
            id: alertId++,
            sensorId: sensor.id,
            sensorName: sensor.name,
            type: 'moisture',
            severity: 'critical',
            message: `Moisture critically high: ${moisture}% (optimal: ${min}-${max}%)`,
            timestamp: now.toISOString(),
            value: moisture,
            threshold: max,
            unit: '%',
            resolved: false
          };
          const alertKey = getAlertKey(alert);
          if (alertStatuses[alertKey]?.resolved) {
            alert.resolved = true;
            alert.resolvedAt = alertStatuses[alertKey].resolvedAt;
          }
          newAlerts.push(alert);
        }
      }

      if (sensor.batteryLevel < 20 && !sensor.isCharging) {
        const alert = {
          id: alertId++,
          sensorId: sensor.id,
          sensorName: sensor.name,
          type: 'battery',
          severity: sensor.batteryLevel < 10 ? 'critical' : 'warning',
          message: `Low battery: ${sensor.batteryLevel}%`,
          timestamp: now.toISOString(),
          value: sensor.batteryLevel,
          threshold: 20,
          unit: '%',
          resolved: false
        };
        const alertKey = getAlertKey(alert);
        if (alertStatuses[alertKey]?.resolved) {
          alert.resolved = true;
          alert.resolvedAt = alertStatuses[alertKey].resolvedAt;
        }
        newAlerts.push(alert);
      }
    });

    dispatch({ type: 'LOAD_ALERTS', payload: newAlerts });
  }, []);

  const refreshSensorData = useCallback(() => {
    const sensorsData = dataGenService.getAllSensorsWithCurrentData();
    dispatch({ type: 'LOAD_SENSORS', payload: sensorsData });
    generateAlerts(sensorsData);
  }, [generateAlerts]);

  const loadData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const sensorsData = await apiService.getSensorsData();
        dispatch({ type: 'LOAD_SENSORS', payload: sensorsData });
        generateAlerts(sensorsData);
      } catch (apiError) {
        console.log('API not available, using generated data');
        refreshSensorData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [refreshSensorData, generateAlerts]);

  useEffect(() => {
    loadData();
    dataGenService.startAutoGeneration();
    
    const refreshInterval = setInterval(() => {
      refreshSensorData();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [loadData, refreshSensorData]);

  const addSensor = async (sensorData) => {
    try {
      const newSensor = await apiService.createSensor(sensorData);
      dispatch({ type: 'ADD_SENSOR', payload: newSensor });
      return newSensor;
    } catch (error) {
      console.error('Error adding sensor:', error);
      const mockSensor = { 
        ...sensorData, 
        id: `SENS-${Date.now()}`,
        status: 'online',
        batteryLevel: 100,
        isCharging: false,
        currentTemperature: null,
        currentMoisture: null,
        lastUpdate: new Date().toISOString()
      };
      dispatch({ type: 'ADD_SENSOR', payload: mockSensor });
      return mockSensor;
    }
  };

  const updateSensor = async (id, sensorData) => {
    try {
      const updatedSensor = await apiService.updateSensor(id, sensorData);
      dispatch({ type: 'UPDATE_SENSOR', payload: updatedSensor });
      dataGenService.updateSensorConfig(id, sensorData);
      
      const storedSensors = JSON.parse(localStorage.getItem('hayguard_sensor_configs') || '{}');
      storedSensors[id] = sensorData;
      localStorage.setItem('hayguard_sensor_configs', JSON.stringify(storedSensors));
      
      return updatedSensor;
    } catch (error) {
      console.error('Error updating sensor:', error);
      const existingSensor = state.sensors.find(s => s.id === id);
      const mergedSensor = { ...existingSensor, ...sensorData, id };
      
      dispatch({ type: 'UPDATE_SENSOR', payload: mergedSensor });
      dataGenService.updateSensorConfig(id, sensorData);
      
      const storedSensors = JSON.parse(localStorage.getItem('hayguard_sensor_configs') || '{}');
      storedSensors[id] = sensorData;
      localStorage.setItem('hayguard_sensor_configs', JSON.stringify(storedSensors));
      
      return mergedSensor;
    }
  };

  const deleteSensor = async (id) => {
    try {
      await apiService.deleteSensor(id);
      dispatch({ type: 'DELETE_SENSOR', payload: id });
    } catch (error) {
      console.error('Error deleting sensor:', error);
      dispatch({ type: 'DELETE_SENSOR', payload: id });
    }
  };

  const addUser = async (userData) => {
    try {
      const newUser = await apiService.createUser(userData);
      dispatch({ type: 'ADD_USER', payload: newUser });
      return newUser;
    } catch (error) {
      console.error('Error adding user:', error);
      const mockUser = { ...userData, id: `U-${Date.now()}` };
      dispatch({ type: 'ADD_USER', payload: mockUser });
      return mockUser;
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const updatedUser = await apiService.updateUser(id, userData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      const existingUser = state.users.find(u => u.id === id);
      const mockUser = { ...existingUser, ...userData, id };
      dispatch({ type: 'UPDATE_USER', payload: mockUser });
      return mockUser;
    }
  };

  const deleteUser = async (id) => {
    try {
      await apiService.deleteUser(id);
      dispatch({ type: 'DELETE_USER', payload: id });
    } catch (error) {
      console.error('Error deleting user:', error);
      dispatch({ type: 'DELETE_USER', payload: id });
    }
  };

  const updateFarmInfo = async (farmData) => {
    try {
      const updatedFarmInfo = { ...state.farmInfo, ...farmData };
      
      localStorage.setItem('hayguard_farm_info', JSON.stringify(updatedFarmInfo));
      
      dispatch({ type: 'UPDATE_FARM_INFO', payload: updatedFarmInfo });
      
      window.dispatchEvent(new CustomEvent('farmInfoUpdated', { 
        detail: updatedFarmInfo 
      }));
      
      return updatedFarmInfo;
    } catch (error) {
      console.error('Error updating farm info:', error);
      dispatch({ type: 'UPDATE_FARM_INFO', payload: farmData });
      return farmData;
    }
  };

  const getSensorHistoricalData = (sensorId, days = 7) => {
    return dataGenService.getHistoricalData(sensorId, days);
  };

  const generateNewReadings = () => {
    dataGenService.generateAllReadings();
    refreshSensorData();
  };

  const markAlertResolved = (alertId) => {
    const alert = state.alerts.find(a => a.id === alertId);
    if (alert) {
      const updatedAlert = { ...alert, resolved: true, resolvedAt: Date.now() };
      dispatch({ type: 'UPDATE_ALERT', payload: updatedAlert });
      
      const alertStatuses = loadAlertStatuses();
      const alertKey = getAlertKey(alert);
      alertStatuses[alertKey] = {
        resolved: true,
        resolvedAt: Date.now()
      };
      saveAlertStatuses(alertStatuses);
    }
  };

  const value = {
    ...state,
    addSensor,
    updateSensor,
    deleteSensor,
    addUser,
    updateUser,
    deleteUser,
    updateFarmInfo,
    loadData,
    getSensorHistoricalData,
    generateNewReadings,
    refreshSensorData,
    markAlertResolved
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;