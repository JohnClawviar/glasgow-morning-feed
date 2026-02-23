// Weather code mapping to descriptions (based on Open-Meteo WMO codes)
const weatherCodes = {
  0: { label: 'Clear Sky', icon: '01d' },
  1: { label: 'Mainly Clear', icon: '01d' },
  2: { label: 'Partly Cloudy', icon: '02d' },
  3: { label: 'Overcast', icon: '03d' },
  45: { label: 'Foggy', icon: '50d' },
  48: { label: 'Depositing Rime Fog', icon: '50d' },
  51: { label: 'Light Drizzle', icon: '09d' },
  53: { label: 'Moderate Drizzle', icon: '09d' },
  55: { label: 'Heavy Drizzle', icon: '09d' },
  56: { label: 'Freezing Drizzle', icon: '09d' },
  57: { label: 'Heavy Freezing Drizzle', icon: '09d' },
  61: { label: 'Light Rain', icon: '10d' },
  63: { label: 'Moderate Rain', icon: '10d' },
  65: { label: 'Heavy Rain', icon: '10d' },
  66: { label: 'Freezing Rain', icon: '10d' },
  67: { label: 'Heavy Freezing Rain', icon: '10d' },
  71: { label: 'Light Snow', icon: '13d' },
  73: { label: 'Moderate Snow', icon: '13d' },
  75: { label: 'Heavy Snow', icon: '13d' },
  77: { label: 'Snow Grains', icon: '13d' },
  80: { label: 'Slight Rain Showers', icon: '09d' },
  81: { label: 'Moderate Rain Showers', icon: '09d' },
  82: { label: 'Heavy Rain Showers', icon: '09d' },
  85: { label: 'Slight Snow Showers', icon: '13d' },
  86: { label: 'Heavy Snow Showers', icon: '13d' },
  95: { label: 'Thunderstorm', icon: '11d' },
  96: { label: 'Thunderstorm with Hail', icon: '11d' },
  99: { label: 'Heavy Thunderstorm', icon: '11d' }
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Fetch weather data for Glasgow
async function fetchWeather() {
  const lat = 55.8642;
  const lon = -4.2518;
  
  // Use &current=... instead of older &current_weather=true
  // This gets current values directly
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe/London&forecast_days=5`;
  
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Weather API error');
    const data = await response.json();
    updateWeatherUI(data);
  } catch (error) {
    console.error('Weather fetch failed:', error);
    showWeatherError();
  }
}

function getWeatherInfo(code) {
  return weatherCodes[code] || { label: 'Unknown', icon: '01d' };
}

function updateWeatherUI(data) {
  const current = data.current; // access through 'current' object
  const daily = data.daily;
  
  const humidity = current.relative_humidity_2m;
  const temp = Math.round(current.temperature_2m);
  const wind = Math.round(current.wind_speed_10m);
  
  // Get current weather info
  const weatherInfo = getWeatherInfo(current.weather_code);
  const iconUrl = `https://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`;
  
  // Update main weather display
  document.getElementById('main-temp').textContent = temp;
  document.getElementById('main-icon').src = iconUrl;
  document.getElementById('main-icon').alt = weatherInfo.label;
  document.getElementById('weather-desc').textContent = weatherInfo.label;
  document.getElementById('wind-speed').textContent = `${wind} km/h`;
  document.getElementById('humidity').textContent = `${Math.round(humidity)}%`;
  
  // Update date
  const now = new Date();
  document.getElementById('current-date').textContent = now.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  
  // Update forecast
  const forecastContainer = document.getElementById('forecast-list');
  forecastContainer.innerHTML = '';
  
  const today = now.getDay();
  
  for (let i = 0; i < 5; i++) {
    const dayCode = daily.weather_code[i];
    const maxTemp = Math.round(daily.temperature_2m_max[i]);
    const minTemp = Math.round(daily.temperature_2m_min[i]);
    const dayInfo = getWeatherInfo(dayCode);
    const dayLabel = i === 0 ? 'Today' : DAYS[(today + i) % 7];
    const dayIcon = `https://openweathermap.org/img/wn/${dayInfo.icon}@2x.png`;
    
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';
    forecastItem.innerHTML = `
      <span class="forecast-day">${dayLabel}</span>
      <img class="forecast-icon" src="${dayIcon}" alt="${dayInfo.label}">
      <span class="forecast-desc">${dayInfo.label}</span>
      <div class="forecast-temps">
        <span class="forecast-high">${maxTemp}°</span>
        <span class="forecast-low">${minTemp}°</span>
      </div>
    `;
    forecastContainer.appendChild(forecastItem);
  }
}

function showWeatherError() {
  document.getElementById('weather-desc').textContent = 'Unable to load weather';
  document.getElementById('wind-speed').textContent = '-- km/h';
  document.getElementById('humidity').textContent = '-- %';
  document.getElementById('forecast-list').innerHTML = '<p class="loading">Weather data unavailable</p>';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Set Glasgow as location
  document.getElementById('city-name').textContent = 'Glasgow, Scotland';
  
  // Fetch weather on load
  fetchWeather();
  
  // Refresh every 15 minutes
  setInterval(fetchWeather, 15 * 60 * 1000);
});
