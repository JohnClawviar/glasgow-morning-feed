async function fetchWeather(){
  const loc = 'Glasgow, Scotland';
  const url = `https://wttr.in/${encodeURIComponent(loc)}?format=j1`;
  try {
    const r = await fetch(url);
    if(!r.ok) throw new Error('Weather fetch failed');
    const data = await r.json();
    // wttr.in json structure: current_condition[0].temp_C, weatherDesc[0].value
    const curr = data.current_condition[0];
    const temp = curr.temp_C;
    const desc = data.weather[0].hourly[0].weatherDesc[0].value;
    const container = document.getElementById('feed');
    const html = `<div class="card"><h2>Weather in ${loc}</h2><p>${desc} • ${temp}°C</p></div>`;
    container.innerHTML = html;
  } catch(e){
    document.getElementById('feed').innerHTML = '<div class="card"><h2>Weather</h2><p>Unable to load weather.</p></div>';
  }
}
fetchWeather();
setInterval(fetchWeather, 60*60*1000);
