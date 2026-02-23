/* Glasgow Morning Feed weather widget (Open-Meteo-based) */
(async function() {
  const container = document.getElementById('feed');
  if(!container){ return; }
  const lat = 55.864239;
  const lon = -4.251835;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`;

  function weatherCodeToDesc(code){
    if(code===0) return 'Clear';
    if(code===1) return 'Mainly Clear';
    if(code===2) return 'Partly Cloudy';
    if(code===3) return 'Overcast';
    if(code>=45 && code<=48) return 'Fog';
    if(code>=51 && code<=57) return 'Drizzle';
    if(code>=61 && code<=67) return 'Rain';
    if(code>=80 && code<=82) return 'Rain';
    if(code>=95) return 'Storm';
    return 'Weather';
  }

  async function fetchWeather(){
    try{
      const r = await fetch(url);
      if(!r.ok) throw new Error('Weather fetch failed');
      const data = await r.json();
      const cw = data.current_weather || {};
      const temp = cw.temperature;
      const code = cw.weathercode ?? 0;
      const desc = weatherCodeToDesc(code);
      container.innerHTML = `<div class="card"><h2>Weather in Glasgow, Scotland</h2><p>${desc} • ${temp ?? ''}°C</p></div>`;
    } catch(e){
      container.innerHTML = `<div class="card"><h2>Weather</h2><p>Unable to load weather.</p></div>`;
    }
  }
  document.addEventListener('DOMContentLoaded', fetchWeather);
  fetchWeather();
  setInterval(fetchWeather, 60 * 60 * 1000);
})();
