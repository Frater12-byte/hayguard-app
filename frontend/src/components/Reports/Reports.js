// src/components/Reports/Reports.js
import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dataGenService from '../../services/dataGenerationService';
import './Reports.css';

const Reports = () => {
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState('all');
  const [dateRange, setDateRange] = useState('7');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [selectedSensor, dateRange]);

  const loadReportData = () => {
    setLoading(true);
    
    try {
      // Get all sensors with current data
      const allSensors = dataGenService.getAllSensorsWithCurrentData();
      const pairedSensors = allSensors.filter(s => s.status !== 'unpaired');
      setSensors(pairedSensors);

      // Get historical data based on filters
      const days = parseInt(dateRange);
      let historicalData = [];
      let sensorsToProcess = [];

      if (selectedSensor === 'all') {
        sensorsToProcess = pairedSensors;
      } else {
        const sensor = pairedSensors.find(s => s.id === selectedSensor);
        if (sensor) sensorsToProcess = [sensor];
      }

      // Collect historical data
      sensorsToProcess.forEach(sensor => {
        const sensorHistory = dataGenService.getHistoricalData(sensor.id, days);
        historicalData = [...historicalData, ...sensorHistory];
      });

      // Process data for charts and statistics
      const processedData = processReportData(sensorsToProcess, historicalData, days);
      setReportData(processedData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading report data:', error);
      setLoading(false);
    }
  };

  const processReportData = (sensors, historicalData, days) => {
    // Sort data by timestamp
    const sortedData = [...historicalData].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Group data by day for daily aggregates
    const dailyData = groupByDay(sortedData);

    // Calculate statistics
    const stats = calculateStatistics(sensors, sortedData);

    // Prepare chart data
    const chartData = prepareChartData(dailyData);

    // Calculate trends
    const trends = calculateTrends(sortedData);

    return {
      sensors,
      historicalData: sortedData,
      dailyData,
      chartData,
      stats,
      trends,
      dateRange: days
    };
  };

  const groupByDay = (data) => {
    const grouped = {};

    data.forEach(reading => {
      const date = new Date(reading.timestamp);
      const dayKey = date.toISOString().split('T')[0];

      if (!grouped[dayKey]) {
        grouped[dayKey] = {
          date: dayKey,
          temperatures: [],
          moistures: [],
          batteries: [],
          count: 0
        };
      }

      if (reading.temperature !== null) {
        grouped[dayKey].temperatures.push(reading.temperature);
      }
      if (reading.moisture !== null) {
        grouped[dayKey].moistures.push(reading.moisture);
      }
      if (reading.battery !== null) {
        grouped[dayKey].batteries.push(reading.battery);
      }
      grouped[dayKey].count++;
    });

    return grouped;
  };

  const prepareChartData = (dailyData) => {
    return Object.values(dailyData).map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avgTemp: day.temperatures.length > 0 
        ? (day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length).toFixed(1)
        : null,
      minTemp: day.temperatures.length > 0 
        ? Math.min(...day.temperatures).toFixed(1)
        : null,
      maxTemp: day.temperatures.length > 0 
        ? Math.max(...day.temperatures).toFixed(1)
        : null,
      avgMoisture: day.moistures.length > 0 
        ? (day.moistures.reduce((a, b) => a + b, 0) / day.moistures.length).toFixed(1)
        : null,
      minMoisture: day.moistures.length > 0 
        ? Math.min(...day.moistures).toFixed(1)
        : null,
      maxMoisture: day.moistures.length > 0 
        ? Math.max(...day.moistures).toFixed(1)
        : null,
      avgBattery: day.batteries.length > 0 
        ? (day.batteries.reduce((a, b) => a + b, 0) / day.batteries.length).toFixed(1)
        : null,
      readings: day.count
    }));
  };

  const calculateStatistics = (sensors, data) => {
    const temps = data.filter(r => r.temperature !== null).map(r => r.temperature);
    const moistures = data.filter(r => r.moisture !== null).map(r => r.moisture);
    const batteries = data.filter(r => r.battery !== null).map(r => r.battery);

    return {
      totalSensors: sensors.length,
      totalReadings: data.length,
      activeSensors: sensors.filter(s => s.status === 'online').length,
      totalBalesMonitored: sensors.reduce((sum, s) => sum + (s.balesMonitored || 0), 0),
      temperature: temps.length > 0 ? {
        avg: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
        min: Math.min(...temps).toFixed(1),
        max: Math.max(...temps).toFixed(1),
        count: temps.length
      } : null,
      moisture: moistures.length > 0 ? {
        avg: (moistures.reduce((a, b) => a + b, 0) / moistures.length).toFixed(1),
        min: Math.min(...moistures).toFixed(1),
        max: Math.max(...moistures).toFixed(1),
        count: moistures.length
      } : null,
      battery: batteries.length > 0 ? {
        avg: (batteries.reduce((a, b) => a + b, 0) / batteries.length).toFixed(1),
        min: Math.min(...batteries).toFixed(1),
        max: Math.max(...batteries).toFixed(1)
      } : null
    };
  };

  const calculateTrends = (data) => {
    if (data.length < 2) return null;

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const calcAvg = (arr, key) => {
      const values = arr.filter(r => r[key] !== null).map(r => r[key]);
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
    };

    const tempTrend = calcAvg(secondHalf, 'temperature') - calcAvg(firstHalf, 'temperature');
    const moistureTrend = calcAvg(secondHalf, 'moisture') - calcAvg(firstHalf, 'moisture');

    return {
      temperature: tempTrend,
      moisture: moistureTrend
    };
  };

  const getTrendIcon = (value) => {
    if (!value || Math.abs(value) < 0.5) return <Minus size={16} />;
    return value > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  const getTrendClass = (value) => {
    if (!value || Math.abs(value) < 0.5) return 'trend-stable';
    return value > 0 ? 'trend-up' : 'trend-down';
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const { historicalData, stats, dateRange } = reportData;
    
    let csv = 'HayGuard Sensor Data Export\n';
    csv += `Generated: ${new Date().toLocaleString()}\n`;
    csv += `Date Range: Last ${dateRange} days\n`;
    csv += `Total Readings: ${stats.totalReadings}\n\n`;

    // Summary Statistics
    csv += 'SUMMARY STATISTICS\n';
    csv += `Total Sensors,${stats.totalSensors}\n`;
    csv += `Active Sensors,${stats.activeSensors}\n`;
    csv += `Total Bales Monitored,${stats.totalBalesMonitored}\n\n`;

    if (stats.temperature) {
      csv += 'Temperature Statistics\n';
      csv += `Average,${stats.temperature.avg}°C\n`;
      csv += `Minimum,${stats.temperature.min}°C\n`;
      csv += `Maximum,${stats.temperature.max}°C\n\n`;
    }

    if (stats.moisture) {
      csv += 'Moisture Statistics\n';
      csv += `Average,${stats.moisture.avg}%\n`;
      csv += `Minimum,${stats.moisture.min}%\n`;
      csv += `Maximum,${stats.moisture.max}%\n\n`;
    }

    // Detailed readings
    csv += 'DETAILED READINGS\n';
    csv += 'Timestamp,Sensor ID,Temperature (°C),Moisture (%),Battery (%)\n';
    
    historicalData.forEach(reading => {
      csv += `${reading.timestamp},`;
      csv += `${reading.sensorId},`;
      csv += `${reading.temperature !== null ? reading.temperature : 'N/A'},`;
      csv += `${reading.moisture !== null ? reading.moisture : 'N/A'},`;
      csv += `${reading.battery !== null ? reading.battery : 'N/A'}\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hayguard-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!reportData) return;

    const { sensors, stats, chartData, trends, dateRange } = reportData;
    
    let pdf = '═══════════════════════════════════════════════════════════════\n';
    pdf += '                    HAYGUARD SENSOR REPORT                      \n';
    pdf += '═══════════════════════════════════════════════════════════════\n\n';
    
    pdf += `Report Generated: ${new Date().toLocaleString()}\n`;
    pdf += `Date Range: Last ${dateRange} days\n`;
    pdf += `Report Type: ${selectedSensor === 'all' ? 'All Sensors' : 'Single Sensor'}\n\n`;

    pdf += '───────────────────────────────────────────────────────────────\n';
    pdf += '                      EXECUTIVE SUMMARY                         \n';
    pdf += '───────────────────────────────────────────────────────────────\n\n';

    pdf += `Total Sensors Monitored:    ${stats.totalSensors}\n`;
    pdf += `Active Sensors:             ${stats.activeSensors}\n`;
    pdf += `Total Bales Protected:      ${stats.totalBalesMonitored}\n`;
    pdf += `Total Readings Collected:   ${stats.totalReadings}\n\n`;

    // Temperature Analysis
    if (stats.temperature) {
      pdf += '───────────────────────────────────────────────────────────────\n';
      pdf += '                   TEMPERATURE ANALYSIS                        \n';
      pdf += '───────────────────────────────────────────────────────────────\n\n';
      pdf += `Average Temperature:        ${stats.temperature.avg}°C\n`;
      pdf += `Minimum Temperature:        ${stats.temperature.min}°C\n`;
      pdf += `Maximum Temperature:        ${stats.temperature.max}°C\n`;
      pdf += `Temperature Range:          ${(parseFloat(stats.temperature.max) - parseFloat(stats.temperature.min)).toFixed(1)}°C\n`;
      
      if (trends && trends.temperature !== null) {
        const trendText = Math.abs(trends.temperature) < 0.5 ? 'Stable' : 
                         trends.temperature > 0 ? `Rising (+${trends.temperature.toFixed(1)}°C)` : 
                         `Falling (${trends.temperature.toFixed(1)}°C)`;
        pdf += `Temperature Trend:          ${trendText}\n`;
      }
      pdf += `Total Readings:             ${stats.temperature.count}\n\n`;
    }

    // Moisture Analysis
    if (stats.moisture) {
      pdf += '───────────────────────────────────────────────────────────────\n';
      pdf += '                    MOISTURE ANALYSIS                          \n';
      pdf += '───────────────────────────────────────────────────────────────\n\n';
      pdf += `Average Moisture:           ${stats.moisture.avg}%\n`;
      pdf += `Minimum Moisture:           ${stats.moisture.min}%\n`;
      pdf += `Maximum Moisture:           ${stats.moisture.max}%\n`;
      pdf += `Moisture Range:             ${(parseFloat(stats.moisture.max) - parseFloat(stats.moisture.min)).toFixed(1)}%\n`;
      
      if (trends && trends.moisture !== null) {
        const trendText = Math.abs(trends.moisture) < 0.5 ? 'Stable' : 
                         trends.moisture > 0 ? `Rising (+${trends.moisture.toFixed(1)}%)` : 
                         `Falling (${trends.moisture.toFixed(1)}%)`;
        pdf += `Moisture Trend:             ${trendText}\n`;
      }
      pdf += `Total Readings:             ${stats.moisture.count}\n\n`;
    }

    // Battery Status
    if (stats.battery) {
      pdf += '───────────────────────────────────────────────────────────────\n';
      pdf += '                     BATTERY STATUS                            \n';
      pdf += '───────────────────────────────────────────────────────────────\n\n';
      pdf += `Average Battery Level:      ${stats.battery.avg}%\n`;
      pdf += `Minimum Battery Level:      ${stats.battery.min}%\n`;
      pdf += `Maximum Battery Level:      ${stats.battery.max}%\n\n`;
    }

    // Sensor Details
    pdf += '───────────────────────────────────────────────────────────────\n';
    pdf += '                     SENSOR DETAILS                            \n';
    pdf += '───────────────────────────────────────────────────────────────\n\n';

    sensors.forEach((sensor, index) => {
      pdf += `${index + 1}. ${sensor.name}\n`;
      pdf += `   ID:                      ${sensor.id}\n`;
      pdf += `   Location:                ${sensor.location}\n`;
      pdf += `   Type:                    ${sensor.type.replace('_', ' & ')}\n`;
      pdf += `   Status:                  ${sensor.status.toUpperCase()}\n`;
      pdf += `   Bales Monitored:         ${sensor.balesMonitored}\n`;
      
      if (sensor.currentTemperature !== null) {
        pdf += `   Current Temperature:     ${sensor.currentTemperature.toFixed(1)}°C\n`;
      }
      if (sensor.currentMoisture !== null) {
        pdf += `   Current Moisture:        ${sensor.currentMoisture.toFixed(1)}%\n`;
      }
      pdf += `   Battery Level:           ${sensor.batteryLevel}%${sensor.isCharging ? ' (Charging)' : ''}\n`;
      pdf += `   Last Update:             ${new Date(sensor.lastUpdate).toLocaleString()}\n\n`;
    });

    // Daily Summary
    pdf += '───────────────────────────────────────────────────────────────\n';
    pdf += '                      DAILY SUMMARY                            \n';
    pdf += '───────────────────────────────────────────────────────────────\n\n';
    pdf += 'Date          | Avg Temp | Avg Moisture | Readings\n';
    pdf += '─────────────────────────────────────────────────────────────\n';

    chartData.forEach(day => {
      const date = day.date.padEnd(13);
      const temp = day.avgTemp ? `${day.avgTemp}°C`.padEnd(8) : 'N/A     ';
      const moisture = day.avgMoisture ? `${day.avgMoisture}%`.padEnd(12) : 'N/A         ';
      const readings = day.readings.toString();
      pdf += `${date} | ${temp} | ${moisture} | ${readings}\n`;
    });

    pdf += '\n';
    pdf += '───────────────────────────────────────────────────────────────\n';
    pdf += '                    RECOMMENDATIONS                            \n';
    pdf += '───────────────────────────────────────────────────────────────\n\n';

    // Generate recommendations based on data
    const recommendations = [];
    
    if (stats.temperature && parseFloat(stats.temperature.max) > 30) {
      recommendations.push('⚠ High temperatures detected. Consider improving ventilation.');
    }
    if (stats.moisture && parseFloat(stats.moisture.avg) > 18) {
      recommendations.push('⚠ Elevated moisture levels. Monitor for potential mold growth.');
    }
    if (stats.battery && parseFloat(stats.battery.avg) < 30) {
      recommendations.push('⚠ Low average battery levels. Schedule sensor maintenance.');
    }
    if (stats.activeSensors < stats.totalSensors) {
      recommendations.push('⚠ Some sensors are offline. Check connectivity and battery.');
    }
    if (recommendations.length === 0) {
      recommendations.push('✓ All metrics within normal ranges. Continue monitoring.');
    }

    recommendations.forEach(rec => {
      pdf += `${rec}\n`;
    });

    pdf += '\n═══════════════════════════════════════════════════════════════\n';
    pdf += '                      END OF REPORT                            \n';
    pdf += '═══════════════════════════════════════════════════════════════\n';

    // Download
    const blob = new Blob([pdf], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hayguard-report-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="reports">
        <div className="reports-loading">Loading report data...</div>
      </div>
    );
  }

  if (!reportData || reportData.sensors.length === 0) {
    return (
      <div className="reports">
        <div className="reports-empty">
          <FileText size={48} />
          <h3>No Data Available</h3>
          <p>No paired sensors found. Pair sensors to start generating reports.</p>
        </div>
      </div>
    );
  }

  const { stats, chartData, trends } = reportData;

  return (
    <div className="reports page-container">
      {/* Filters with inline download buttons */}
      <div className="reports-filters card">
        <div className="filter-group">
          <label>
            <Calendar size={16} />
            Date Range
          </label>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="filter-select"
          >
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sensor</label>
          <select 
            value={selectedSensor} 
            onChange={(e) => setSelectedSensor(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Sensors (Average)</option>
            {sensors.map(sensor => (
              <option key={sensor.id} value={sensor.id}>
                {sensor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Download buttons at the right */}
        <div className="reports-actions">
          <button className="btn btn-secondary btn-sm" onClick={exportToPDF}>
            <Download size={16} />
            Download TXT
          </button>
          <button className="btn btn-secondary btn-sm" onClick={exportToCSV}>
            <Download size={16} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Sensors</span>
          </div>
          <div className="stat-value">{stats.totalSensors}</div>
          <div className="stat-footer">
            {stats.activeSensors} active
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Readings</span>
          </div>
          <div className="stat-value">{stats.totalReadings}</div>
          <div className="stat-footer">
            Last {dateRange} days
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Bales Monitored</span>
          </div>
          <div className="stat-value">{stats.totalBalesMonitored}</div>
          <div className="stat-footer">
            Across all sensors
          </div>
        </div>

        {stats.battery && (
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Avg Battery</span>
            </div>
            <div className="stat-value">{stats.battery.avg}%</div>
            <div className="stat-footer">
              Range: {stats.battery.min}% - {stats.battery.max}%
            </div>
          </div>
        )}
      </div>

      {/* Temperature Analysis */}
      {stats.temperature && (
        <div className="report-section card">
          <div className="section-header">
            <h3>Temperature Analysis</h3>
            {trends && trends.temperature !== null && (
              <div className={`trend-indicator ${getTrendClass(trends.temperature)}`}>
                {getTrendIcon(trends.temperature)}
                <span>
                  {Math.abs(trends.temperature) < 0.5 ? 'Stable' : 
                   trends.temperature > 0 ? `+${trends.temperature.toFixed(1)}°C` : 
                   `${trends.temperature.toFixed(1)}°C`}
                </span>
              </div>
            )}
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Average</span>
              <span className="stat-value-large">{stats.temperature.avg}°C</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Minimum</span>
              <span className="stat-value-large">{stats.temperature.min}°C</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Maximum</span>
              <span className="stat-value-large">{stats.temperature.max}°C</span>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  label={{ value: '°C', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgTemp" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Average"
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="maxTemp" 
                  stroke="#ef4444" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Maximum"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="minTemp" 
                  stroke="#3b82f6" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Minimum"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Moisture Analysis */}
      {stats.moisture && (
        <div className="report-section card">
          <div className="section-header">
            <h3>Moisture Analysis</h3>
            {trends && trends.moisture !== null && (
              <div className={`trend-indicator ${getTrendClass(trends.moisture)}`}>
                {getTrendIcon(trends.moisture)}
                <span>
                  {Math.abs(trends.moisture) < 0.5 ? 'Stable' : 
                   trends.moisture > 0 ? `+${trends.moisture.toFixed(1)}%` : 
                   `${trends.moisture.toFixed(1)}%`}
                </span>
              </div>
            )}
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Average</span>
              <span className="stat-value-large">{stats.moisture.avg}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Minimum</span>
              <span className="stat-value-large">{stats.moisture.min}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Maximum</span>
              <span className="stat-value-large">{stats.moisture.max}%</span>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  label={{ value: '%', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgMoisture" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Average"
                  dot={{ fill: '#10b981', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="maxMoisture" 
                  stroke="#ef4444" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Maximum"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="minMoisture" 
                  stroke="#3b82f6" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Minimum"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Daily Readings */}
      <div className="report-section card">
        <div className="section-header">
          <h3>Daily Reading Summary</h3>
        </div>
        
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="readings" 
                fill="#F4C430" 
                name="Readings per Day"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;