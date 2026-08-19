/* =====================================================
   TAI WO DASHBOARD
   Current Location Dashboard
===================================================== */


/* =====================================================
   SETTINGS
===================================================== */

const FALLBACK_LATITUDE = 22.4505;
const FALLBACK_LONGITUDE = 114.1649;

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

const MTR_API =
    "https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php";


/* =====================================================
   CURRENT LOCATION
===================================================== */

let currentLatitude = FALLBACK_LATITUDE;
let currentLongitude = FALLBACK_LONGITUDE;

let locationLoaded = false;


/* =====================================================
   WEATHER CODE
===================================================== */

function weatherInfo(code) {

    const weather = {

        0:  ["☀️", "晴"],
        1:  ["🌤️", "大致晴朗"],
        2:  ["⛅", "部分多雲"],
        3:  ["☁️", "多雲"],

        45: ["🌫️", "霧"],
        48: ["🌫️", "霧"],

        51: ["🌦️", "毛毛雨"],
        53: ["🌦️", "毛毛雨"],
        55: ["🌧️", "毛毛雨"],

        56: ["🌧️", "凍雨"],
        57: ["🌧️", "凍雨"],

        61: ["🌧️", "小雨"],
        63: ["🌧️", "中雨"],
        65: ["🌧️", "大雨"],

        66: ["🌧️", "凍雨"],
        67: ["🌧️", "凍雨"],

        71: ["🌨️", "小雪"],
        73: ["🌨️", "中雪"],
        75: ["❄️", "大雪"],

        77: ["❄️", "雪粒"],

        80: ["🌦️", "陣雨"],
        81: ["🌧️", "陣雨"],
        82: ["🌧️", "大驟雨"],

        85: ["🌨️", "陣雪"],
        86: ["❄️", "大雪"],

        95: ["⛈️", "雷暴"],
        96: ["⛈️", "雷暴"],
        99: ["⛈️", "強雷暴"]

    };

    return weather[code] || ["🌤️", "未知"];

}


/* =====================================================
   LOCATION
===================================================== */

function getCurrentLocation() {

    return new Promise(resolve => {

        if (!navigator.geolocation) {

            console.log(
                "Geolocation is not supported. Using fallback location."
            );

            resolve({
                latitude: FALLBACK_LATITUDE,
                longitude: FALLBACK_LONGITUDE,
                isFallback: true
            });

            return;

        }


        navigator.geolocation.getCurrentPosition(

            position => {

                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    isFallback: false
                });

            },

            error => {

                console.warn(
                    "Location unavailable:",
                    error.message
                );

                resolve({
                    latitude: FALLBACK_LATITUDE,
                    longitude: FALLBACK_LONGITUDE,
                    isFallback: true
                });

            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }

        );

    });

}


/* =====================================================
   CLOCK
   Uses the device's current local time automatically
===================================================== */

function updateClock() {

    const now = new Date();


    const timeString =
        new Intl.DateTimeFormat(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            }
        ).format(now);


    const parts =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                day: "numeric",
                month: "numeric",
                year: "numeric"
            }
        ).formatToParts(now);


    const day =
        parts.find(
            part => part.type === "day"
        ).value;


    const month =
        parts.find(
            part => part.type === "month"
        ).value;


    const year =
        parts.find(
            part => part.type === "year"
        ).value;


    const weekday =
        new Intl.DateTimeFormat(
            "zh-HK",
            {
                weekday: "long"
            }
        ).format(now);


    document.getElementById(
        "time"
    ).textContent = timeString;


    document.getElementById(
        "date"
    ).textContent =
        `${day}/${month}/${year} · ${weekday}`;


    updateAnalogClock(now);

}


/* =====================================================
   ANALOG CLOCK
===================================================== */

function updateAnalogClock(now) {

    const hour =
        now.getHours();

    const minute =
        now.getMinutes();

    const second =
        now.getSeconds();


    const hourAngle =
        (hour % 12) * 30 +
        minute * 0.5;


    const minuteAngle =
        minute * 6 +
        second * 0.1;


    const secondAngle =
        second * 6;


    document.getElementById(
        "hourHand"
    ).style.transform =
        `rotate(${hourAngle}deg)`;


    document.getElementById(
        "minuteHand"
    ).style.transform =
        `rotate(${minuteAngle}deg)`;


    document.getElementById(
        "secondHand"
    ).style.transform =
        `rotate(${secondAngle}deg)`;

}


/* =====================================================
   WEATHER TITLES
===================================================== */

function updateWeatherTitles(isFallback) {

    const weatherTitle =
        document.querySelector(
            ".weather-card .card-title"
        );


    const forecastTitle =
        document.querySelector(
            ".forecast-card .card-title"
        );


    if (weatherTitle) {

        weatherTitle.textContent =
            isFallback
                ? "🌤️ TAI WO WEATHER"
                : "📍 CURRENT LOCATION WEATHER";

    }


    if (forecastTitle) {

        forecastTitle.textContent =
            isFallback
                ? "🌦️ TODAY'S FORECAST · TAI WO"
                : "🌦️ TODAY'S FORECAST · CURRENT LOCATION";

    }

}


/* =====================================================
   WEATHER
===================================================== */

async function loadWeather() {

    try {

        if (!locationLoaded) {

            const location =
                await getCurrentLocation();


            currentLatitude =
                location.latitude;


            currentLongitude =
                location.longitude;


            locationLoaded = true;


            updateWeatherTitles(
                location.isFallback
            );

        }


        const url =
            `${WEATHER_API}?` +

            `latitude=${currentLatitude}` +

            `&longitude=${currentLongitude}` +

            `&current=` +
            `temperature_2m,` +
            `relative_humidity_2m,` +
            `weather_code` +

            `&hourly=` +
            `temperature_2m,` +
            `precipitation_probability,` +
            `weather_code` +

            `&daily=` +
            `temperature_2m_max,` +
            `temperature_2m_min` +

            `&timezone=auto` +

            `&forecast_days=1`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Weather request failed"
            );

        }


        const data =
            await response.json();


        /* CURRENT */

        const current =
            data.current;


        const info =
            weatherInfo(
                current.weather_code
            );


        document.getElementById(
            "temperature"
        ).textContent =
            `${Math.round(
                current.temperature_2m
            )}°`;


        document.getElementById(
            "weatherIcon"
        ).textContent =
            info[0];


        document.getElementById(
            "weatherDescription"
        ).textContent =
            info[1];


        document.getElementById(
            "humidity"
        ).textContent =
            `${current.relative_humidity_2m}%`;


        /* DAILY */

        const max =
            Math.round(
                data.daily
                    .temperature_2m_max[0]
            );


        const min =
            Math.round(
                data.daily
                    .temperature_2m_min[0]
            );


        document.getElementById(
            "todayRange"
        ).textContent =
            `${min}° — ${max}°`;


        /* CURRENT RAIN */

        const currentHour =
            new Date().getHours();


        const rain =
            data.hourly
                .precipitation_probability[
                    currentHour
                ];


        document.getElementById(
            "rainProbability"
        ).textContent =
            `${rain ?? 0}%`;


        /* FORECAST */

        renderForecast(data);


        document.getElementById(
            "weatherUpdated"
        ).textContent =
            `Updated ${formatUpdateTime()}`;


        updateLastUpdated();

    }

    catch (error) {

        console.error(error);


        document.getElementById(
            "weatherDescription"
        ).textContent =
            "Weather unavailable";


        document.getElementById(
            "weatherUpdated"
        ).textContent =
            "Unable to update weather";

    }

}


/* =====================================================
   FORECAST
===================================================== */

function renderForecast(data) {

    const container =
        document.getElementById(
            "forecast"
        );


    container.innerHTML = "";


    const now =
        new Date();


    const currentHour =
        now.getHours();


    for (
        let i = currentHour;
        i < Math.min(
            currentHour + 8,
            24
        );
        i++
    ) {

        const temp =
            Math.round(
                data.hourly
                    .temperature_2m[i]
            );


        const rain =
            data.hourly
                .precipitation_probability[i];


        const code =
            data.hourly
                .weather_code[i];


        const info =
            weatherInfo(code);


        const hour =
            `${String(i).padStart(
                2,
                "0"
            )}:00`;


        const element =
            document.createElement(
                "div"
            );


        element.className =
            "forecast-hour";


        element.innerHTML = `

            <div class="forecast-time">
                ${hour}
            </div>

            <div class="forecast-icon">
                ${info[0]}
            </div>

            <div class="forecast-temp">
                ${temp}°
            </div>

            <div class="forecast-rain">
                🌧 ${rain ?? 0}%
            </div>

        `;


        container.appendChild(
            element
        );

    }

}


/* =====================================================
   MTR
===================================================== */

async function loadMTR() {

    try {

        const url =
            `${MTR_API}?` +
            `line=EAL&` +
            `sta=TWO&` +
            `lang=TC`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "MTR request failed"
            );

        }


        const data =
            await response.json();


        if (
            !data.data ||
            !data.data["EAL-TWO"]
        ) {

            throw new Error(
                "No MTR data"
            );

        }


        const station =
            data.data["EAL-TWO"];


        renderMTR(
            station.DOWN,
            "mtrDown"
        );


        renderMTR(
            station.UP,
            "mtrUp"
        );


        document.getElementById(
            "mtrUpdated"
        ).textContent =
            `Updated ${formatUpdateTime()}`;

    }

    catch (error) {

        console.error(error);


        document.getElementById(
            "mtrDown"
        ).textContent =
            "MTR data unavailable";


        document.getElementById(
            "mtrUp"
        ).textContent =
            "MTR data unavailable";

    }

}


/* =====================================================
   RENDER MTR
===================================================== */

function renderMTR(
    trains,
    elementId
) {

    const container =
        document.getElementById(
            elementId
        );


    container.innerHTML = "";


    const validTrains =
        (trains || [])
            .filter(
                train =>
                    train.valid === "Y"
            )
            .slice(0, 4);


    if (
        validTrains.length === 0
    ) {

        container.textContent =
            "No upcoming trains";

        return;

    }


    validTrains.forEach(train => {

        const element =
            document.createElement(
                "div"
            );


        element.className =
            "train";


        element.innerHTML = `

            <div class="train-time">
                ${train.ttnt} min
            </div>

            <div class="train-minutes">
                ${train.dest}
            </div>

        `;


        container.appendChild(
            element
        );

    });

}


/* =====================================================
   NEWS
===================================================== */

function loadNewsPlaceholder() {

    document.getElementById(
        "nowNews"
    ).innerHTML = `

        <div class="news-item">
            NOW News unavailable
        </div>

    `;


    document.getElementById(
        "bbcNews"
    ).innerHTML = `

        <div class="news-item">
            BBC World News loading...
        </div>

    `;

}


/* =====================================================
   UTILITY
===================================================== */

function formatUpdateTime() {

    const now =
        new Date();


    return new Intl.DateTimeFormat(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }
    ).format(now);

}


function updateLastUpdated() {

    const element =
        document.getElementById(
            "lastUpdated"
        );


    if (!element) return;


    element.textContent =
        `Updated ${formatUpdateTime()}`;

}


/* =====================================================
   INITIALIZE
===================================================== */

updateClock();


loadWeather();


loadMTR();


loadNewsPlaceholder();


/* CLOCK */

setInterval(
    updateClock,
    1000
);


/* WEATHER */

setInterval(
    loadWeather,
    10 * 60 * 1000
);


/* MTR */

setInterval(
    loadMTR,
    30 * 1000
);


/* NEWS */

setInterval(
    loadNewsPlaceholder,
    10 * 60 * 1000
);
