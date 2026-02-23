/* Glasgow Morning Feed weather widget (robust Open-Meteo with fallback) */
(function(){
  const container = document.getElementById('feed');
  if(!container) return;
  function renderCard(title, text){
    container.innerHTML = `<div class=\"card\"><h2>${title}</h2><p>${text}</p></div>`;
  }
  renderCard('Weather in Glasgow, Scotland','Loading weather...');

  // Primary: Open-Meteo (current_weather)
  const lat = 55.864239;
  const lon = -4.251835;
  const urlOpenMeteo = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`;
  function codeToDesc(code){
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
  async function fetchOpenMeteo(){
    try{
      const r = await fetch(urlOpenMeteo, { mode: 'cors' });
      if(!r.ok) throw new Error('open-meteo failed');
      const data = await r.json();
      const cw = data.current_weather || {};
      const temp = cw.temperature;
      const code = cw.weathercode ?? 0;
      const desc = codeToDesc(code);
      renderCard('Weather in Glasgow, Scotland', `${desc} • ${temp ?? ''}°C`);
    } catch(e){
      // Fallback to wttr.in JSON if Open-Meteo fails
      fetchWeatherWttrFallback();
    }
  }
  async function fetchWeatherWttrFallback(){
    try{
      const r = await fetch('https://wttr.in/Glasgow?format=j1', { mode: 'cors' });
      if(!r.ok) throw new Error('wttr fallback failed');
      const d = await r.json();
      const curr = d.current_condition?.[0] || {};
      const temp = curr.temp_C;
      const desc = d.weather?.[0]?.hourly?.[0]?.weatherDesc?.[0]?.value || 'Weather';
      renderCard('Weather in Glasgow, Scotland', `${desc} • ${temp ?? ''}°C`);
    } catch(err){
      renderCard('Weather', 'Unable to load weather.');
    }
  }
  fetchOpenMeteo();
  // refresh hourly
  setInterval(fetchOpenMeteo, 60 * 60 * 1000);
})();
