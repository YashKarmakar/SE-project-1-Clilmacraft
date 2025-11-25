const API_KEY = "7b3e256bb7bf92538d6f15df20c17225"; // <-- Replace with your OpenWeather key

// DOM elements
const placeEl = document.getElementById("place");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const iconEl = document.getElementById("icon");
const humidEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const popEl = document.getElementById("pop");
const uviEl = document.getElementById("uvi");
const aqiEl = document.getElementById("aqi");
const adviceList = document.getElementById("adviceList");
const forecastEl = document.getElementById("forecast");
const alertBar = document.getElementById("alertBar");

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");

function kmh(ms) { return Math.round(ms * 3.6); }
function dayName(ts) { return new Date(ts * 1000).toLocaleDateString(undefined, { weekday: "short" }); }

// Fetch JSON helper
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  return res.json();
}

// Build suggestions
function buildAdvice(temp, humidity, wind, rainChance, main, aqi) {
  const tips = [];
  if (temp > 35) tips.push("Extreme heat — stay hydrated!");
  else if (temp > 30) tips.push("Wear light cotton clothes.");
  else if (temp < 10) tips.push("Cold weather — wear warm clothes.");
  if (rainChance > 60) tips.push("Carry an umbrella ☂️");
  if (main === "Thunderstorm") tips.push("Stay indoors during thunder.");
  if (aqi > 150) tips.push("Air quality poor — avoid outdoor jogging.");
  if (tips.length === 0) tips.push("Weather looks fine — plan as usual.");
  return tips;
}

// Render data
function renderWeather(data, airData) {
  const { name, weather, main, wind } = data;
  const icon = weather[0].icon;
  const desc = weather[0].description;
  const temp = main.temp;
  const humidity = main.humidity;
  const windKmh = kmh(wind.speed);

  placeEl.textContent = name;
  tempEl.textContent = `${Math.round(temp)}°C`;
  descEl.textContent = desc;
  iconEl.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  humidEl.textContent = `${humidity}%`;
  windEl.textContent = `${windKmh} km/h`;

  const aqi = airData?.list?.[0]?.main?.aqi ?? 1;
  aqiEl.textContent = aqi;

  const advices = buildAdvice(temp, humidity, windKmh, 50, weather[0].main, aqi);
  adviceList.innerHTML = advices.map(a => `<li>${a}</li>`).join("");
}

// Load by city name
async function loadCity(city) {
  try {
    const geo = await fetchJSON(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
    if (!geo.length) return alert("City not found");
    const { lat, lon, name } = geo[0];
    const weather = await fetchJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const air = await fetchJSON(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    renderWeather(weather, air);
  } catch (err) {
    alert("Failed to load weather data");
  }
}

// Use my location
function useMyLocation() {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    const weather = await fetchJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
    const air = await fetchJSON(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
    renderWeather(weather, air);
  }, () => alert("Location access denied"));
}

// Event listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) loadCity(city);
});
locBtn.addEventListener("click", useMyLocation);
