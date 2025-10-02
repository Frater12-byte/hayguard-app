import React, { createContext, useContext, useState, useEffect } from 'react';

const SensorsContext = createContext();

export const useSensors = () => {
  const context = useContext(SensorsContext);
  if (!context) {
    throw new Error('useSensors must be used within a SensorsProvider');
  }
  return context;
};

export const SensorsProvider = ({ children }) => {
  const [sensors, setSensors] = useState([]);
  const [bales, setBales] = useState(0);

  useEffect(() => {
    const loadSensors = () => {
      const savedSensors = localStorage.getItem('hayguard_sensors');
      if (savedSensors) {
        try {
          const parsedSensors = JSON.parse(savedSensors);
          setSensors(parsedSensors);
        } catch (e) {
          console.error('Error parsing sensors:', e);
          initializeMockData();
        }
      } else {
        initializeMockData();
      }
    };

    const initializeMockData = () => {
      const mockSensors = [
        {
          id: 1,
          name: 'Barn A - Sensor 1',
          location: 'North Barn',
          type: 'temperature_moisture',
          status: 'active',
          temperature: 24.5,
          moisture: 12.3,
          minTemperature: 18,
          maxTemperature: 25,
          minMoisture: 12,
          maxMoisture: 16,
          lastReading: new Date(Date.now() - 5 * 60 * 1000),
          batteryLevel: 85,
          temperatureData: generateMockData(30, 20, 30),
          moistureData: generateMockData(30, 10, 20)
        }
      ];
      setSensors(mockSensors);
      setBales(1247);
    };

    loadSensors();
  }, []);

  const generateMockData = (days, min, max) => {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.random() * (max - min) + min
      });
    }
    return data;
  };

  useEffect(() => {
    try {
      localStorage.setItem('hayguard_sensors', JSON.stringify(sensors));
    } catch (e) {
      console.error('Error saving sensors:', e);
    }
  }, [sensors]);

  const addSensor = (sensorData) => {
    const newSensor = {
      ...sensorData,
      id: Date.now(),
      status: 'active',
      batteryLevel: 100,
      temperature: Math.random() * 10 + 20,
      moisture: Math.random() * 10 + 10,
      lastReading: new Date(),
      temperatureData: generateMockData(30, sensorData.minTemperature, sensorData.maxTemperature),
      moistureData: generateMockData(30, sensorData.minMoisture, sensorData.maxMoisture)
    };
    
    setSensors(prev => [...prev, newSensor]);
    return newSensor;
  };

  const updateBales = (newBaleCount) => {
    setBales(newBaleCount);
    localStorage.setItem('hayguard_bales', JSON.stringify(newBaleCount));
  };

  useEffect(() => {
    const savedBales = localStorage.getItem('hayguard_bales');
    if (savedBales) {
      try {
        setBales(JSON.parse(savedBales));
      } catch (e) {
        console.error('Error parsing bales:', e);
      }
    }
  }, []);

  return (
    <SensorsContext.Provider value={{
      sensors,
      bales,
      addSensor,
      updateBales,
      setSensors
    }}>
      {children}
    </SensorsContext.Provider>
  );
};
