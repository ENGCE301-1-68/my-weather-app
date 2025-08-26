const apiKey = '3742f34e20be14be87f1756e5d643583'; // << วาง API Key ของคุณที่นี่

const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');
const body = document.body;
const forecastContainer = document.querySelector('#forecast-container');
const forecastCardsContainer = document.querySelector('#forecast-cards');

// ฟังก์ชันเริ่มต้น: โหลดข้อมูลจาก localStorage เมื่อเข้าหน้าเว็บ
document.addEventListener('DOMContentLoaded', () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        cityInput.value = lastCity;
        getWeather(lastCity);
    }
});

searchForm.addEventListener('submit', (event) => {
    event.preventDefault(); // ป้องกันไม่ให้หน้าเว็บรีโหลดเมื่อกด submit

    const cityName = cityInput.value.trim(); // .trim() เพื่อตัดช่องว่างหน้า-หลัง

    if (cityName) {
        getWeather(cityName);
        // บันทึกเมืองล่าสุดลง localStorage
        localStorage.setItem('lastCity', cityName);
    } else {
        alert('กรุณาป้อนชื่อเมือง');
    }
});

async function getWeather(city) {
    // แสดงสถานะ Loading
    weatherInfoContainer.innerHTML = `<p>กำลังโหลดข้อมูล...</p>`;
    forecastCardsContainer.innerHTML = '';
    forecastContainer.style.display = 'none';

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('ไม่พบข้อมูลเมืองนี้');
        }

        const data = await response.json();
        displayWeather(data);
        getForecast(city);

    } catch (error) {
        weatherInfoContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

async function getForecast(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const response = await fetch(forecastUrl);

        if (!response.ok) {
            throw new Error('ไม่สามารถดึงข้อมูลพยากรณ์อากาศได้');
        }

        const data = await response.json();
        displayForecast(data);

    } catch (error) {
        console.error("Error fetching forecast:", error);
    }
}

function displayWeather(data) {
    // ใช้ Destructuring เพื่อดึงค่าที่ต้องการออกจาก Object
    const { name, main, weather } = data;
    const { temp, humidity } = main;
    const { description, icon } = weather[0];

    // เปลี่ยนสีพื้นหลังตามสภาพอากาศ
    updateBackground(weather[0].main);

    // ใช้ Template Literals ในการสร้าง HTML
    const weatherHtml = `
        <h2>${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>ความชื้น: ${humidity}%</p>
    `;

    weatherInfoContainer.innerHTML = weatherHtml;
    weatherInfoContainer.style.opacity = '1';
    weatherInfoContainer.style.transform = 'translateY(0)';
}

function displayForecast(data) {
    forecastCardsContainer.innerHTML = '';
    forecastContainer.style.display = 'block';

    // กรองข้อมูลเฉพาะช่วงเที่ยงของแต่ละวัน
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('th-TH', { weekday: 'short' });
        const tempMin = day.main.temp_min.toFixed(1);
        const tempMax = day.main.temp_max.toFixed(1);
        const icon = day.weather[0].icon;

        const forecastCardHtml = `
            <div class="forecast-card">
                <h3>${date}</h3>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="weather icon">
                <p>${day.weather[0].description}</p>
                <p class="temp-range">${tempMin}°C / ${tempMax}°C</p>
            </div>
        `;
        forecastCardsContainer.innerHTML += forecastCardHtml;
    });
}

function updateBackground(weatherMain) {
    let className = '';
    const lowerCaseWeather = weatherMain.toLowerCase();

    if (lowerCaseWeather.includes('clear')) {
        className = 'sunny-bg';
    } else if (lowerCaseWeather.includes('cloud')) {
        className = 'cloudy-bg';
    } else if (lowerCaseWeather.includes('rain')) {
        className = 'rainy-bg';
    } else if (lowerCaseWeather.includes('snow')) {
        className = 'snowy-bg';
    }
    
    // ลบคลาสพื้นหลังเก่าออกก่อน
    body.className = ''; 
    if (className) {
        body.classList.add(className);
    }
}