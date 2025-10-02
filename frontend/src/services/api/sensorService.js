// Mock API service for sensors
export const sensorService = {
  async getAllSensors() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      total: 15,
      active: 12,
      inactive: 3,
      sensors: [
        {
          id: 'S001',
          name: 'Sensor S001',
          location: 'Field North - Bale A1',
          status: 'active',
          batteryLevel: 85,
          temperature: 18.25,
          moisture: 12.50,
          lastUpdate: '2025-09-25 10:30'
        },
        {
          id: 'S002',
          name: 'Sensor S002',
          location: 'Field South - Bale B2',
          status: 'active',
          batteryLevel: 92,
          temperature: 19.10,
          moisture: 15.80,
          lastUpdate: '2025-09-25 10:28'
        },
        {
          id: 'S003',
          name: 'Sensor S003',
          location: 'Field East - Bale C3',
          status: 'inactive',
          batteryLevel: 15,
          temperature: 21.50,
          moisture: 22.30,
          lastUpdate: '2025-09-24 14:25'
        }
      ]
    };
  },

  async getSensorById(id) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: id,
      name: `Sensor ${id}`,
      location: 'Field North - Bale A1',
      status: 'active',
      batteryLevel: 78,
      lastUpdate: '2025-09-25 10:30',
      currentTemp: 18.25,
      currentMoisture: 12.50,
      firmwareVersion: '2.1.3',
      installDate: '2024-06-15',
      type: 'HG-500 Multi-Sensor',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    };
  }
};
