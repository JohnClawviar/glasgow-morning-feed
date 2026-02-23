(function(){
  const container = document.getElementById('feed');
  if(!container) return;
  container.innerHTML = '<div class="card"><h2>Weather in Glasgow, Scotland</h2><p>Loading weather...</p></div>';
  const lat = 55.864239;
  const lon = -4.251835;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`;
  fetch(url, {mode: 'cors'}).then(r => r.ok ? r.json() : Promise.reject('bad'))
    .then(data => {
      const cw = data.current_weather || {};
      const t = cw.temperature;
      const code = cw.weathercode ?? 0;
      const desc = (code === 0) ? 'Clear' : 'Weather';
      container.innerHTML = `<div class="card"><h2>Weather in Glasgow, Scotland</h2><p>${desc} • ${t ?? ''}°C</p></div>`;
    }).catch(() => {
      container.innerHTML = '<div class="card"><h2>Weather</h2><p>Unable to load weather.</p></div>';
    });
})();
