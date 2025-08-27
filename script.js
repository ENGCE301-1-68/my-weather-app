const apiKey = '3742f34e20be14be87f1756e5d643583';

// 1. เลือก DOM Elements
const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const favoritesContainer = document.querySelector('#favorites-container');
const refreshBtn = document.querySelector('#refresh-btn');

// --- EVENT LISTENERS ---
// โหลดเมืองโปรดเมื่อเปิดหน้าเว็บ
document.addEventListener('DOMContentLoaded', loadFavoriteCities);

// จัดการการเพิ่มเมืองใหม่
searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const cityName = cityInput.value.trim();
    if (cityName) {
        addCityToFavorites(cityName);
        cityInput.value = '';
    }
});

// จัดการการลบเมือง
favoritesContainer.addEventListener('click', event => {
    // ภารกิจที่ 4 - Logic การลบเมือง (ใช้ Event Delegation)
    // 1. เช็คว่า element ที่ถูกคลิกมี class 'remove-btn' หรือไม่
    if (event.target.classList.contains('remove-btn')) {
        // 2. หาชื่อเมืองจาก parent element ที่ใกล้ที่สุด (.weather-card)
        const weatherCard = event.target.closest('.weather-card');
        const originalCityName = weatherCard.dataset.originalCity; // ใช้ชื่อเมืองต้นฉบับ
        
        // 3. เรียกใช้ฟังก์ชัน removeCityFromFavorites()
        if (originalCityName) {
            removeCityFromFavorites(originalCityName);
        }
    }
});

// จัดการการ Refresh
refreshBtn.addEventListener('click', loadFavoriteCities);


// --- FUNCTIONS ---

function getFavoriteCities() {
    // ภารกิจที่ 1.1 - ดึงรายชื่อเมืองจาก localStorage
    const citiesJSON = localStorage.getItem('favoriteCities');
    // ถ้าไม่มีข้อมูลใน localStorage ให้ return array ว่าง
    return citiesJSON ? JSON.parse(citiesJSON) : [];
}

function saveFavoriteCities(cities) {
    // ภารกิจที่ 1.2 - บันทึกรายชื่อเมืองลง localStorage
    // แปลง array เป็น JSON string แล้วเก็บใน localStorage
    localStorage.setItem('favoriteCities', JSON.stringify(cities));
}

function loadFavoriteCities() {
    favoritesContainer.innerHTML = ''; // เคลียร์ของเก่าก่อน
    const cities = getFavoriteCities();
    
    // ภารกิจที่ 2 - วนลูปรายชื่อเมืองและแสดงผลสภาพอากาศ
    cities.forEach(city => {
        fetchAndDisplayWeather(city);
    });
}

async function addCityToFavorites(cityName) {
    // ภารกิจที่ 3 - เพิ่มเมืองใหม่
    // 1. ดึงรายชื่อเมืองปัจจุบันมา
    let cities = getFavoriteCities();
    
    // 2. ตรวจสอบว่าเมืองนี้ถูกเพิ่มไปแล้วหรือยัง
    if (!cities.includes(cityName)) {
        // 3. ถ้ายังไม่มี ให้เพิ่มเมืองใหม่เข้าไปใน array
        cities.push(cityName);
        // 4. บันทึก array ใหม่ลง localStorage
        saveFavoriteCities(cities);
        // 5. แสดงผลใหม่ทั้งหมด
        loadFavoriteCities();
    } else {
        // ถ้ามีเมืองนี้อยู่แล้ว ให้แจ้งเตือน
        alert(`${cityName} อยู่ในรายการโปรดแล้ว`);
    }
}

function removeCityFromFavorites(cityName) {
    // ภารกิจที่ 4.1 - ลบเมืองออกจากรายการโปรด
    // 1. ดึงรายชื่อเมืองปัจจุบันมา
    let cities = getFavoriteCities();
    
    // 2. ใช้ .filter() เพื่อสร้าง array ใหม่ที่ไม่มีเมืองที่ต้องการลบ
    cities = cities.filter(city => city !== cityName);
    
    // 3. บันทึก array ใหม่ลง localStorage
    saveFavoriteCities(cities);
    
    // 4. แสดงผลใหม่ทั้งหมด
    loadFavoriteCities();
}

async function fetchAndDisplayWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`ไม่พบข้อมูลของ ${city}`);
        
        const data = await response.json();
        
        const { name, main, weather } = data;
        const card = document.createElement('div');
        card.className = 'weather-card';
        card.setAttribute('data-city', name); // ชื่อจาก API
        card.setAttribute('data-original-city', city); // ชื่อต้นฉบับที่ user พิมพ์
        
        card.innerHTML = `
            <div>
                <h3>${name}</h3>
                <p>${weather[0].description}</p>
            </div>
            <div class="text-right">
                <p class="temp">${main.temp.toFixed(1)}°C</p>
            </div>
            <button class="remove-btn">ลบ</button>
        `;
        
        favoritesContainer.appendChild(card);

    } catch (error) {
        console.error(error);
        const card = document.createElement('div');
        card.className = 'weather-card';
        card.setAttribute('data-original-city', city); // เก็บชื่อต้นฉบับไว้แม้ error
        card.innerHTML = `
            <h3>${city}</h3>
            <p class="error">${error.message}</p>
            <button class="remove-btn">ลบ</button>
        `;
        favoritesContainer.appendChild(card);
    }
}