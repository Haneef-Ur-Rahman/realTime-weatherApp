// DOM elements \\
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherCondition = document.getElementById('weather-condition');
const humidity = document.getElementById('humidity');
const weatherIcon = document.querySelector('.weather-icon');
const errorMessage = document.getElementById('error-message');
const body = document.querySelector('body');

// Weather icon mapping \\
const weatherIcons = {
    'clear': '☀️',
    'cloudy': '☁️',
    'rain': '🌧️',
    'snow': '❄️',
    'thunderstorm': '⛈️',
    'fog': '🌫️',
    'default': '🌤️'
};

// Background images based on weather conditions \\
const backgroundImages = {
    'clear': 'https://source.unsplash.com/1600x900/?sunny',
    'cloudy': 'https://source.unsplash.com/1600x900/?cloudy',
    'rain': 'https://source.unsplash.com/1600x900/?rain',
    'snow': 'https://source.unsplash.com/1600x900/?snow',
    'thunderstorm': 'https://source.unsplash.com/1600x900/?thunderstorm',
    'fog': 'https://source.unsplash.com/1600x900/?fog',
    'default': 'https://source.unsplash.com/1600x900/?weather'
};

// Fetch weather data from Open-Meteo API (no API key needed) \\
async function fetchWeatherByCity(city) {
    try {
        // Step 1: Get latitude & longitude of the city \\
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
        );
        
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found");
        }
        
        const { latitude, longitude, name, country_code } = geoData.results[0];
        
        // Step 2: Get weather data \\
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m`
        );
        
        const weatherData = await weatherResponse.json();
        
        // Extract weather info \\
        const currentWeather = weatherData.current_weather;
        const humidityData = weatherData.hourly.relativehumidity_2m[0];
        
        // Display weather \\
        cityName.textContent = `${name}, ${country_code}`;
        temperature.textContent = `${currentWeather.temperature}°C`;
        weatherCondition.textContent = getWeatherCondition(currentWeather.weathercode);
        humidity.textContent = `Humidity: ${humidityData}%`;
        
        // Set icon & background \\
        const condition = getWeatherCondition(currentWeather.weathercode).toLowerCase();
        weatherIcon.textContent = weatherIcons[condition] || weatherIcons.default;
        
        const bgImage = backgroundImages[condition] || backgroundImages.default;
        body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${bgImage}')`;
        
        errorMessage.classList.add('hidden');
    } catch (err) {
        errorMessage.textContent = `Error: ${err.message}`;
        errorMessage.classList.remove('hidden');
    }
}

// Weather code to condition mapping (Open-Meteo uses WMO codes) \\
function getWeatherCondition(code) {
    if (code === 0) return "Clear";
    if (code <= 3) return "Cloudy";
    if (code <= 49) return "Fog";
    if (code <= 59) return "Rain";
    if (code <= 69) return "Snow";
    if (code <= 99) return "Thunderstorm";
    return "Unknown";
}

// Get weather by user's location \\
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    // Get city name from coordinates \\
                    const geoResponse = await fetch(
                        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}`
                    );
                    
                    const geoData = await geoResponse.json();
                    const city = geoData.results?.[0]?.name || "Your Location";
                    
                    // Fetch weather data \\
                    const weatherResponse = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m`
                    );
                    
                    const weatherData = await weatherResponse.json();
                    const currentWeather = weatherData.current_weather;
                    const humidityData = weatherData.hourly.relativehumidity_2m[0];
                    
                    // Display weather \\
                    cityName.textContent = city;
                    temperature.textContent = `${currentWeather.temperature}°C`;
                    weatherCondition.textContent = getWeatherCondition(currentWeather.weathercode);
                    humidity.textContent = `Humidity: ${humidityData}%`;
                    
                    // Set icon & background \\
                    const condition = getWeatherCondition(currentWeather.weathercode).toLowerCase();
                    weatherIcon.textContent = weatherIcons[condition] || weatherIcons.default;
                    
                    const bgImage = backgroundImages[condition] || backgroundImages.default;
                    body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${bgImage}')`;
                    
                    errorMessage.classList.add('hidden');
                } catch (err) {
                    errorMessage.textContent = `Error: ${err.message}`;
                    errorMessage.classList.remove('hidden');
                }
            },
            (err) => {
                errorMessage.textContent = `Error: ${err.message}`;
                errorMessage.classList.remove('hidden');
            }
        );
    } else {
        errorMessage.textContent = "Geolocation is not supported by your browser";
        errorMessage.classList.remove('hidden');
    }
}

// Event listeners \\
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
    } else {
        errorMessage.textContent = "Please enter a city name";
        errorMessage.classList.remove('hidden');
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

locationBtn.addEventListener('click', getWeatherByLocation);

// Initialize with a default city \\
fetchWeatherByCity("London");