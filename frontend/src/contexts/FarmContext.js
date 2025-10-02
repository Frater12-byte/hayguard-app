import React, { createContext, useContext, useState, useEffect } from 'react';

const FarmContext = createContext();

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};

export const FarmProvider = ({ children }) => {
  const [farmData, setFarmData] = useState({
    name: 'Greenfield Farm',
    owner: 'John Farmer',
    establishedYear: 2018,
    totalAcres: 250,
    location: {
      address: '123 Farm Road, Rural County',
      city: 'Farmville',
      state: 'Agricultural State',
      zipCode: '12345',
      country: 'USA',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    },
    cropTypes: ['Wheat', 'Corn', 'Soybeans', 'Alfalfa'],
    facilities: [
      { name: 'Main Barn', capacity: '500 bales', status: 'Good' },
      { name: 'North Storage', capacity: '300 bales', status: 'Excellent' },
      { name: 'South Storage', capacity: '200 bales', status: 'Fair' },
      { name: 'Equipment Shed', capacity: 'Various machinery', status: 'Good' }
    ],
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'contact@greenfieldfarm.com',
      website: 'www.greenfieldfarm.com'
    }
  });

  // Load farm data from localStorage
  useEffect(() => {
    const savedFarmData = localStorage.getItem('hayguard_farm_data');
    if (savedFarmData) {
      try {
        const parsed = JSON.parse(savedFarmData);
        setFarmData(parsed);
      } catch (e) {
        console.error('Error parsing farm data:', e);
      }
    }
  }, []);

  // Save farm data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('hayguard_farm_data', JSON.stringify(farmData));
      console.log('Farm data saved to localStorage');
    } catch (e) {
      console.error('Error saving farm data:', e);
    }
  }, [farmData]);

  const updateFarmData = (updates) => {
    setFarmData(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  };

  return (
    <FarmContext.Provider value={{
      farmData,
      updateFarmData,
      setFarmData
    }}>
      {children}
    </FarmContext.Provider>
  );
};
