require("dotenv").config();

async function getWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const weather = await response.json();

    return weather;
  } catch (err) {
    console.error("Weather API Error:", err);
    throw err;
  }
}

module.exports = getWeather;
