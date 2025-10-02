// Mock API service for weather
export const weatherService = {
  async getCurrentWeather() {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      temperature: Math.round(15 + Math.random() * 15),
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(5 + Math.random() * 15),
      condition: randomCondition,
      icon: randomCondition === 'Sunny' ? '☀️' : 
            randomCondition === 'Partly Cloudy' ? '⛅' :
            randomCondition === 'Cloudy' ? '☁️' :
            randomCondition === 'Light Rain' ? '🌧️' : '🌙'
    };
  }
};
