// src/services/dataGenerationService.js

class DataGenerationService {
  constructor() {
    // Load sensors from localStorage or initialize defaults
    this.sensors = this.loadSensorsFromStorage() || this.initializeDefaultSensors();
    this.historicalData = {};
    this.batteryState = {};
    this.lastGenerationTime = {};
    this.lastReadingValues = {};
    this.generationInterval = null;
    this.tempIdCounter = this.loadTempIdCounter();
    
    // Initialize historical data for paired sensors only
    this.sensors.forEach(sensor => {
      if (this.isSensorPaired(sensor.id)) {
        this.initializeSensorData(sensor);
      }
    });
    
    // Save sensors to localStorage
    this.saveSensorsToStorage();
    
    // Start automatic data generation
    this.startAutoGeneration();
  }

  loadSensorsFromStorage() {
    try {
      const stored = localStorage.getItem('hayguard_sensors');
      if (stored) {
        const sensors = JSON.parse(stored);
        // Only return if we have the default 4 paired sensors
        const pairedSensors = sensors.filter(s => this.isSensorPaired(s.id));
        if (pairedSensors.length > 0) {
          return sensors;
        }
      }
    } catch (error) {
      console.error('Error loading sensors from localStorage:', error);
    }
    return null;
  }

  saveSensorsToStorage() {
    try {
      localStorage.setItem('hayguard_sensors', JSON.stringify(this.sensors));
      window.dispatchEvent(new Event('sensorsUpdated'));
    } catch (error) {
      console.error('Error saving sensors to localStorage:', error);
    }
  }

  loadTempIdCounter() {
    try {
      const counter = localStorage.getItem('hayguard_temp_id_counter');
      return counter ? parseInt(counter) : 1;
    } catch (error) {
      return 1;
    }
  }

  saveTempIdCounter() {
    try {
      localStorage.setItem('hayguard_temp_id_counter', this.tempIdCounter.toString());
    } catch (error) {
      console.error('Error saving temp ID counter:', error);
    }
  }

  initializeDefaultSensors() {
    const now = Date.now();
    
    return [
      {
        id: 'SENS-001',
        name: 'Barn A Temperature & Moisture',
        location: 'Barn A - Section 1',
        type: 'temperature_moisture',
        status: 'paired',
        optimalRanges: {
          temperature: { min: 0, max: 30 },
          moisture: { min: 12, max: 18 }
        },
        balesMonitored: 45,
        description: 'Main barn storage monitoring system',
        initialBattery: 85,
        qrCode: 'QR-BARN-A-001',
        createdAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
        pairedAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'SENS-002',
        name: 'Storage Unit C Climate Monitor',
        location: 'Storage Unit C',
        type: 'temperature_moisture',
        status: 'paired',
        optimalRanges: {
          temperature: { min: 0, max: 25 },
          moisture: { min: 10, max: 16 }
        },
        balesMonitored: 62,
        description: 'Secondary storage facility monitoring',
        initialBattery: 45,
        qrCode: 'QR-STORAGE-C-002',
        createdAt: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString(),
        pairedAt: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'SENS-003',
        name: 'Greenhouse A Temperature',
        location: 'Greenhouse A - Zone 1',
        type: 'temperature',
        status: 'paired',
        optimalRanges: {
          temperature: { min: 18, max: 28 }
        },
        balesMonitored: 15,
        description: 'Greenhouse climate control system',
        initialBattery: 92,
        qrCode: 'QR-GREENHOUSE-A-003',
        createdAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(),
        pairedAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'SENS-004',
        name: 'Field B Moisture Monitor',
        location: 'Field B - Section 2',
        type: 'moisture',
        status: 'paired',
        optimalRanges: {
          moisture: { min: 40, max: 65 }
        },
        balesMonitored: 28,
        description: 'Field moisture monitoring for optimal storage',
        initialBattery: 30,
        qrCode: 'QR-FIELD-B-004',
        createdAt: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
        pairedAt: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  isSensorPaired(sensorId) {
    return sensorId && sensorId.startsWith('SENS-');
  }

  generateTempId() {
    const tempId = `TEMP-${String(this.tempIdCounter).padStart(3, '0')}`;
    this.tempIdCounter++;
    this.saveTempIdCounter();
    return tempId;
  }

  generateSensId() {
    // Find the highest existing SENS number
    const sensNumbers = this.sensors
      .filter(s => s.id.startsWith('SENS-'))
      .map(s => parseInt(s.id.split('-')[1]))
      .filter(n => !isNaN(n));
    
    const maxNum = sensNumbers.length > 0 ? Math.max(...sensNumbers) : 0;
    return `SENS-${String(maxNum + 1).padStart(3, '0')}`;
  }

  addSensor(sensorData) {
    const tempId = this.generateTempId();
    const newSensor = {
      ...sensorData,
      id: tempId,
      status: 'unpaired',
      createdAt: new Date().toISOString()
    };
    
    this.sensors.push(newSensor);
    this.saveSensorsToStorage();
    
    return newSensor;
  }

  pairSensor(tempId, qrCode) {
    const sensorIndex = this.sensors.findIndex(s => s.id === tempId);
    
    if (sensorIndex === -1) {
      throw new Error('Sensor not found');
    }

    if (this.isSensorPaired(tempId)) {
      throw new Error('Sensor is already paired');
    }

    // Generate new SENS ID
    const sensId = this.generateSensId();
    
    // Update sensor
    this.sensors[sensorIndex] = {
      ...this.sensors[sensorIndex],
      id: sensId,
      status: 'paired',
      qrCode: qrCode,
      initialBattery: 100,
      pairedAt: new Date().toISOString()
    };

    // Initialize data generation for this sensor
    this.initializeSensorData(this.sensors[sensorIndex]);
    
    // Save to storage
    this.saveSensorsToStorage();

    return this.sensors[sensorIndex];
  }

  initializeSensorData(sensor) {
    const sensorId = sensor.id;
    
    // Calculate battery based on sensor age
    const initialBattery = sensor.initialBattery || 100;
    const pairedDate = new Date(sensor.pairedAt || sensor.createdAt || Date.now());
    const daysSincePaired = (Date.now() - pairedDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Battery depletes over 10 days (240 hours)
    const depletionRate = this.calculateDepletionRate();
    const hoursSincePaired = daysSincePaired * 24;
    let currentBattery = initialBattery - (hoursSincePaired * depletionRate);
    
    // Handle battery cycling
    const cycleHours = 240; // 10 days to full depletion
    const chargeThreshold = 6;
    const chargeDuration = 6; // 6 hours to recharge
    
    let isCharging = false;
    let chargeStartTime = null;
    let chargePauseHours = null;
    
    // Determine if sensor should be charging based on battery level
    if (currentBattery <= chargeThreshold && currentBattery > 2) {
      isCharging = true;
      chargeStartTime = new Date();
      chargePauseHours = 5 + (Math.random() * 2); // 5-7 hours to charge
      currentBattery = 2 + (Math.random() * 4); // Show low battery while charging
    } else if (currentBattery < 2) {
      // Battery fully depleted, reset to 100%
      currentBattery = 100;
    }
    
    // Initialize battery state
    this.batteryState[sensorId] = {
      level: Math.max(2, Math.min(100, currentBattery)),
      lastChargeTime: pairedDate,
      isCharging: isCharging,
      chargeStartTime: chargeStartTime,
      chargePauseHours: chargePauseHours,
      depletionRate: depletionRate
    };

    // Initialize last reading values
    this.lastReadingValues[sensorId] = {
      temperature: null,
      moisture: null
    };

    // Generate historical data
    const daysOfHistory = Math.min(30, Math.ceil(daysSincePaired));
    this.historicalData[sensorId] = this.generateHistoricalData(sensor, daysOfHistory);
    this.lastGenerationTime[sensorId] = new Date();
    
    console.log(`Initialized sensor ${sensorId}: Battery ${Math.round(currentBattery)}%, ${daysOfHistory} days of history`);
  }

  calculateDepletionRate() {
    const daysToDepletion = 10;
    const hoursToDepletion = daysToDepletion * 24;
    return 100 / hoursToDepletion; // ~0.4167% per hour
  }

  generateHistoricalData(sensor, days) {
    const data = [];
    const now = new Date();
    
    // Generate ~38 readings per day (one every 30-45 minutes)
    const totalPoints = Math.floor(days * 38);
    let lastTemperature = null;
    let lastMoisture = null;

    for (let i = totalPoints; i >= 0; i--) {
      const intervalMinutes = 30 + Math.random() * 15; // 30-45 minute intervals
      const timestamp = new Date(now.getTime() - (i * intervalMinutes * 60 * 1000));
      
      const reading = {
        timestamp: timestamp.toISOString(),
        sensorId: sensor.id,
        temperature: null,
        moisture: null,
        battery: this.calculateHistoricalBattery(timestamp, sensor.id, sensor.initialBattery, sensor.pairedAt)
      };

      if (sensor.type === 'temperature' || sensor.type === 'temperature_moisture') {
        lastTemperature = this.generateTemperature(
          sensor.optimalRanges.temperature, 
          lastTemperature
        );
        reading.temperature = lastTemperature;
      }

      if (sensor.type === 'moisture' || sensor.type === 'temperature_moisture') {
        lastMoisture = this.generateMoisture(
          sensor.optimalRanges.moisture, 
          lastMoisture
        );
        reading.moisture = lastMoisture;
      }

      data.push(reading);
    }

    // Store the last values for continuous generation
    this.lastReadingValues[sensor.id] = {
      temperature: lastTemperature,
      moisture: lastMoisture
    };

    return data;
  }

  calculateHistoricalBattery(timestamp, sensorId, initialBattery, pairedAt) {
    const pairedDate = new Date(pairedAt);
    const now = new Date();
    const hoursSincePaired = (timestamp - pairedDate) / (1000 * 60 * 60);
    
    const depletionRate = this.calculateDepletionRate();
    const cycleHours = 240; // 10 days
    const chargeThreshold = 6;
    const chargeDuration = 6;
    const fullCycleHours = cycleHours + chargeDuration;

    // Calculate which cycle we're in
    const cyclesCompleted = Math.floor(hoursSincePaired / fullCycleHours);
    const hoursInCurrentCycle = hoursSincePaired % fullCycleHours;

    let batteryLevel;

    if (hoursInCurrentCycle < cycleHours) {
      // Depleting phase
      batteryLevel = initialBattery - (hoursInCurrentCycle * depletionRate);
      batteryLevel = Math.max(2, batteryLevel);
    } else {
      // Charging phase
      const hoursCharging = hoursInCurrentCycle - cycleHours;
      if (hoursCharging >= chargeDuration) {
        // Fully charged
        batteryLevel = 100;
      } else {
        // Still charging
        batteryLevel = 2 + (Math.random() * 4);
      }
    }

    return Math.round(Math.max(2, Math.min(100, batteryLevel)));
  }

  updateBatteryLevel(sensorId) {
    const batteryInfo = this.batteryState[sensorId];
    if (!batteryInfo) return 100;
    
    const now = new Date();
    const hoursSinceLastUpdate = (now - this.lastGenerationTime[sensorId]) / (1000 * 60 * 60);

    if (batteryInfo.isCharging) {
      const hoursCharging = (now - batteryInfo.chargeStartTime) / (1000 * 60 * 60);
      
      if (hoursCharging >= batteryInfo.chargePauseHours) {
        // Finished charging
        batteryInfo.isCharging = false;
        batteryInfo.level = 100;
        batteryInfo.lastChargeTime = now;
        batteryInfo.chargePauseHours = null;
        batteryInfo.chargeStartTime = null;
        console.log(`Sensor ${sensorId} finished charging: 100%`);
      } else {
        // Still charging - show low battery level
        batteryInfo.level = 2 + (Math.random() * 4);
      }
    } else {
      // Normal depletion
      batteryInfo.level -= (batteryInfo.depletionRate * hoursSinceLastUpdate);

      // Check if we need to start charging
      if (batteryInfo.level <= 6 && batteryInfo.level >= 2) {
        batteryInfo.isCharging = true;
        batteryInfo.chargeStartTime = now;
        batteryInfo.chargePauseHours = 5 + (Math.random() * 2); // 5-7 hours
        batteryInfo.level = 2 + (Math.random() * 4);
        console.log(`Sensor ${sensorId} started charging: ${Math.round(batteryInfo.level)}%`);
      }

      batteryInfo.level = Math.max(2, batteryInfo.level);
    }

    return Math.round(batteryInfo.level);
  }

  generateTemperature(optimalRange, previousValue = null) {
    const { min, max } = optimalRange;
    const range = max - min;
    const midpoint = (min + max) / 2;
    
    if (previousValue === null) {
      const value = midpoint + (Math.random() - 0.5) * range * 0.6;
      return parseFloat(value.toFixed(1));
    }
    
    const maxChange = Math.abs(previousValue * 0.15);
    const isInOptimalRange = previousValue >= min && previousValue <= max;
    const shouldBeInRange = Math.random() < 0.8;
    
    let newValue;
    
    if (shouldBeInRange) {
      if (previousValue < min) {
        const change = Math.random() * maxChange;
        newValue = previousValue + change;
      } else if (previousValue > max) {
        const change = Math.random() * maxChange;
        newValue = previousValue - change;
      } else {
        const change = (Math.random() - 0.5) * maxChange * 0.5;
        newValue = previousValue + change;
        newValue = Math.max(min, Math.min(max, newValue));
      }
    } else {
      if (isInOptimalRange) {
        const moveUp = Math.random() < 0.5;
        const change = Math.random() * maxChange;
        newValue = moveUp ? previousValue + change : previousValue - change;
      } else {
        const isAbove = previousValue > max;
        const change = Math.random() * maxChange * 0.5;
        newValue = isAbove ? previousValue + change : previousValue - change;
      }
    }
    
    newValue = Math.max(0, newValue);
    return parseFloat(newValue.toFixed(1));
  }

  generateMoisture(optimalRange, previousValue = null) {
    const { min, max } = optimalRange;
    const range = max - min;
    const midpoint = (min + max) / 2;
    
    if (previousValue === null) {
      const value = midpoint + (Math.random() - 0.5) * range * 0.6;
      return parseFloat(value.toFixed(1));
    }
    
    const maxChange = Math.abs(previousValue * 0.15);
    const isInOptimalRange = previousValue >= min && previousValue <= max;
    const shouldBeInRange = Math.random() < 0.85;
    
    let newValue;
    
    if (shouldBeInRange) {
      if (previousValue < min) {
        const change = Math.random() * maxChange;
        newValue = previousValue + change;
      } else if (previousValue > max) {
        const change = Math.random() * maxChange;
        newValue = previousValue - change;
      } else {
        const change = (Math.random() - 0.5) * maxChange * 0.5;
        newValue = previousValue + change;
        newValue = Math.max(min, Math.min(max, newValue));
      }
    } else {
      if (isInOptimalRange) {
        const moveUp = Math.random() < 0.5;
        const change = Math.random() * maxChange;
        newValue = moveUp ? previousValue + change : previousValue - change;
      } else {
        const isAbove = previousValue > max;
        const change = Math.random() * maxChange * 0.5;
        newValue = isAbove ? previousValue + change : previousValue - change;
      }
    }
    
    newValue = Math.max(0, Math.min(100, newValue));
    return parseFloat(newValue.toFixed(1));
  }

  shouldGenerateData(sensorId) {
    // Only generate data for paired sensors that aren't charging
    if (!this.isSensorPaired(sensorId)) {
      return false;
    }
    return !this.batteryState[sensorId]?.isCharging;
  }

  generateNewReading(sensor) {
    const now = new Date();
    
    // Don't generate for unpaired sensors
    if (!this.isSensorPaired(sensor.id)) {
      return null;
    }

    // Check if sensor should generate data
    const shouldGenerate = this.shouldGenerateData(sensor.id);
    const batteryLevel = this.updateBatteryLevel(sensor.id);
    
    if (!shouldGenerate) {
      return null;
    }

    const lastValues = this.lastReadingValues[sensor.id] || { temperature: null, moisture: null };

    const reading = {
      timestamp: now.toISOString(),
      sensorId: sensor.id,
      temperature: null,
      moisture: null,
      battery: batteryLevel
    };

    if (sensor.type === 'temperature' || sensor.type === 'temperature_moisture') {
      reading.temperature = this.generateTemperature(
        sensor.optimalRanges.temperature,
        lastValues.temperature
      );
      this.lastReadingValues[sensor.id].temperature = reading.temperature;
    }

    if (sensor.type === 'moisture' || sensor.type === 'temperature_moisture') {
      reading.moisture = this.generateMoisture(
        sensor.optimalRanges.moisture,
        lastValues.moisture
      );
      this.lastReadingValues[sensor.id].moisture = reading.moisture;
    }

    // Add to historical data
    this.historicalData[sensor.id].push(reading);
    
    // Keep only last 30 days of data
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    this.historicalData[sensor.id] = this.historicalData[sensor.id].filter(
      r => new Date(r.timestamp) > thirtyDaysAgo
    );

    this.lastGenerationTime[sensor.id] = now;
    
    return reading;
  }

  getLatestReading(sensorId) {
    const data = this.historicalData[sensorId];
    return data && data.length > 0 ? data[data.length - 1] : null;
  }

  getHistoricalData(sensorId, days = 7) {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    return this.historicalData[sensorId]?.filter(
      reading => new Date(reading.timestamp) >= cutoffDate
    ) || [];
  }

  getAllSensorsWithCurrentData() {
    return this.sensors.map(sensor => {
      const latestReading = this.getLatestReading(sensor.id);
      const batteryInfo = this.batteryState[sensor.id];
      
      // Determine status
      let status;
      if (!this.isSensorPaired(sensor.id)) {
        status = 'unpaired';
      } else if (latestReading) {
        status = 'online';
      } else {
        status = 'offline';
      }
      
      return {
        ...sensor,
        status: status,
        currentTemperature: latestReading?.temperature || null,
        currentMoisture: latestReading?.moisture || null,
        batteryLevel: latestReading?.battery || batteryInfo?.level || 100,
        isCharging: batteryInfo?.isCharging || false,
        lastUpdate: latestReading?.timestamp || new Date().toISOString()
      };
    });
  }

  deleteSensor(sensorId) {
    const index = this.sensors.findIndex(s => s.id === sensorId);
    if (index !== -1) {
      this.sensors.splice(index, 1);
      
      // Clean up related data
      delete this.historicalData[sensorId];
      delete this.batteryState[sensorId];
      delete this.lastGenerationTime[sensorId];
      if (this.lastReadingValues) {
        delete this.lastReadingValues[sensorId];
      }
      
      this.saveSensorsToStorage();
      return true;
    }
    return false;
  }

  updateSensorConfig(sensorId, updates) {
    const sensorIndex = this.sensors.findIndex(s => s.id === sensorId);
    if (sensorIndex !== -1) {
      this.sensors[sensorIndex] = {
        ...this.sensors[sensorIndex],
        ...updates
      };
      this.saveSensorsToStorage();
      return this.sensors[sensorIndex];
    }
    return null;
  }

  startAutoGeneration() {
    if (this.generationInterval) {
      clearInterval(this.generationInterval);
    }

    const generateData = () => {
      // Only generate for paired sensors
      const pairedSensors = this.sensors.filter(s => this.isSensorPaired(s.id));
      
      let generatedCount = 0;
      pairedSensors.forEach(sensor => {
        const reading = this.generateNewReading(sensor);
        if (reading) {
          generatedCount++;
        }
      });
      
      if (generatedCount > 0) {
        console.log(`Generated ${generatedCount} readings at ${new Date().toLocaleTimeString()}`);
      }
      
      // Schedule next generation (30-45 minutes)
      const nextInterval = (30 + Math.random() * 15) * 60 * 1000;
      
      setTimeout(() => {
        generateData();
      }, nextInterval);
    };

    // Start first generation
    generateData();
  }

  generateAllReadings() {
    const pairedSensors = this.sensors.filter(s => this.isSensorPaired(s.id));
    let count = 0;
    pairedSensors.forEach(sensor => {
      const reading = this.generateNewReading(sensor);
      if (reading) count++;
    });
    console.log(`Manually generated ${count} readings for ${pairedSensors.length} paired sensors`);
    this.saveSensorsToStorage();
  }

  // Reset to default sensors (useful for testing)
  resetToDefaults() {
    this.sensors = this.initializeDefaultSensors();
    this.historicalData = {};
    this.batteryState = {};
    this.lastGenerationTime = {};
    this.lastReadingValues = {};
    
    this.sensors.forEach(sensor => {
      if (this.isSensorPaired(sensor.id)) {
        this.initializeSensorData(sensor);
      }
    });
    
    this.saveSensorsToStorage();
    console.log('Reset to 4 default paired sensors');
  }
}

const dataGenService = new DataGenerationService();

export default dataGenService;