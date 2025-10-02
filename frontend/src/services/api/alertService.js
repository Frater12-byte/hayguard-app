// Mock API service for alerts
export const alertService = {
  async getCriticalAlerts() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const alerts = [];
    for (let i = 0; i < 20; i++) {
      const alertDate = new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime()));
      
      const alertTypes = [
        { type: 'error', title: 'High Moisture Alert', message: 'Moisture level exceeded safe threshold', priority: 'high' },
        { type: 'error', title: 'Sensor Offline', message: 'Lost connection to sensor', priority: 'high' },
        { type: 'warning', title: 'Temperature Warning', message: 'Temperature rising above normal range', priority: 'medium' },
        { type: 'warning', title: 'Battery Low', message: 'Sensor battery level below 20%', priority: 'medium' },
      ];
      
      const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      
      alerts.push({
        id: i + 1,
        ...randomAlert,
        location: ['Field North', 'Field South', 'Field East', 'Field West'][Math.floor(Math.random() * 4)],
        timestamp: alertDate.toISOString(),
        resolved: Math.random() > 0.4,
        sensor: `S${String(Math.floor(Math.random() * 15) + 1).padStart(3, '0')}`
      });
    }

    const criticalAlerts = alerts.filter(alert => 
      alert.priority === 'high' && !alert.resolved
    ).length;

    return { criticalAlerts, allAlerts: alerts };
  }
};
