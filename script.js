/* =====================================================
   DASHBOARD
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

const BBC_RSS =
    "https://feeds.bbci.co.uk/news/world/rss.xml";


/* =====================================================
   LOCATION
===================================================== */

let currentLatitude = FALLBACK_LATITUDE;
let currentLongitude = FALLBACK_LONGITUDE;

let usingFallbackLocation = true;


/* =====================================================
   WEATHER
===================================================== */

function weatherInfo(code) {

    const weather = {

        0: ["☀️", "晴"],
        1: ["🌤️", "大致晴朗"],
        2: ["⛅", "部分多雲"],
        3: ["☁️", "多雲"],
        45: ["🌫️", "有霧"],
        48: ["🌫️", "有霧"],
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

            resolve({
                latitude: FALLBACK_LATITUDE,
                longitude: FALLBACK_LONGITUDE,
                fallback: true
            });

            return;

        }


        navigator.geolocation.getCurrentPosition(

            position => {

                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    fallback: false
                });

            },

            () => {

                resolve({
                    latitude: FALLBACK_LATITUDE,
                    longitude: FALLBACK_LONGITUDE,
                    fallback: true
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
   CLOCK + DATE + LUNAR CALENDAR
===================================================== */

function updateClock() {

    const now = new Date();


    const timeElement =
        document.getElementById("time");

    const dateElement =
        document.getElementById("date");

    const lunarElement =
        document.getElementById("lunarDate");


    if (timeElement) {

        timeElement.textContent =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true
                }
            ).format(now);

    }


    if (dateElement) {

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
            )?.value || "";


        const month =
            parts.find(
                part => part.type === "month"
            )?.value || "";


        const year =
            parts.find(
                part => part.type === "year"
            )?.value || "";


        const weekday =
            new Intl.DateTimeFormat(
                "zh-HK",
                {
                    weekday: "long"
                }
            ).format(now);


        dateElement.textContent =
            `${day}/${month}/${year} · ${weekday}`;

    }


    if (lunarElement) {

        lunarElement.textContent =
            getLunarDate(now);

    }


    updateAnalogClock(now);

}


function getLunarDate(date) {

    try {

        const formatter =
            new Intl.DateTimeFormat(
                "zh-Hant-u-ca-chinese",
                {
                    day: "numeric",
                    month: "long"
                }
            );


        const lunar =
            formatter.format(date);


        return `農曆${lunar}`;

    }

    catch (error) {

        return "農曆日期無法載入";

    }

}


/* =====================================================
   ANALOG CLOCK
===================================================== */

function updateAnalogClock(now) {

    const hourHand =
        document.getElementById("hourHand");

    const minuteHand =
        document.getElementById("minuteHand");

    const secondHand =
        document.getElementById("secondHand");


    if (
        !hourHand ||
        !minuteHand ||
        !secondHand
    ) {

        return;

    }


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


    hourHand.style.transform =
        `rotate(${hourAngle}deg)`;


    minuteHand.style.transform =
        `rotate(${minuteAngle}deg)`;


    secondHand.style.transform =
        `rotate(${secondAngle}deg)`;

}


/* =====================================================
   WEATHER TITLES
===================================================== */

function updateWeatherTitles() {

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
            usingFallbackLocation
                ? "🌤️ TAI WO WEATHER"
                : "📍 CURRENT LOCATION WEATHER";

    }


    if (forecastTitle) {

        forecastTitle.textContent =
            usingFallbackLocation
                ? "🌦️ TODAY'S FORECAST · TAI WO"
                : "🌦️ TODAY'S FORECAST · CURRENT LOCATION";

    }

}


/* =====================================================
   WEATHER
===================================================== */

async function loadWeather(refreshLocation = false) {

    try {

        if (
            refreshLocation ||
            (
                currentLatitude === FALLBACK_LATITUDE &&
                currentLongitude === FALLBACK_LONGITUDE
            )
        ) {

            const location =
                await getCurrentLocation();


            currentLatitude =
                location.latitude;


            currentLongitude =
                location.longitude;


            usingFallbackLocation =
                location.fallback;


            updateWeatherTitles();

        }


        const url =
            `${WEATHER_API}?` +
            `latitude=${currentLatitude}` +
            `&longitude=${currentLongitude}` +
            `&current=temperature_2m,relative_humidity_2m,weather_code` +
            `&hourly=temperature_2m,precipitation_probability,weather_code` +
            `&daily=temperature_2m_max,temperature_2m_min` +
            `&timezone=auto` +
            `&forecast_days=1`;


        const response =
            await fetch(
                url,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Weather request failed"
            );

        }


        const data =
            await response.json();


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


        const currentHour =
            new Date().getHours();


        const rain =
            data.hourly
                .precipitation_probability[
                    currentHour
                ] ?? 0;


        document.getElementById(
            "rainProbability"
        ).textContent =
            `${rain}%`;


        renderForecast(data);


        document.getElementById(
            "weatherUpdated"
        ).textContent =
            `Updated ${formatUpdateTime()}`;

    }

    catch (error) {

        console.error(
            "Weather error:",
            error
        );


        const description =
            document.getElementById(
                "weatherDescription"
            );


        if (description) {

            description.textContent =
                "Weather unavailable";

        }

    }

}


/* =====================================================
   FORECAST
===================================================== */

function renderForecast(data) {

    const container =
        document.getElementById("forecast");


    if (!container) return;


    container.innerHTML = "";


    const currentHour =
        new Date().getHours();


    for (
        let i = currentHour;
        i < Math.min(
            currentHour + 8,
            data.hourly.time.length
        );
        i++
    ) {

        const time =
            data.hourly.time[i];


        if (!time) continue;


        const hour =
            time.slice(11, 16);


        const temp =
            Math.round(
                data.hourly
                    .temperature_2m[i]
            );


        const rain =
            data.hourly
                .precipitation_probability[i] ?? 0;


        const info =
            weatherInfo(
                data.hourly.weather_code[i]
            );


        const element =
            document.createElement("div");


        element.className =
            "forecast-hour";


        element.innerHTML = `
            <div class="forecast-time">${hour}</div>
            <div class="forecast-icon">${info[0]}</div>
            <div class="forecast-temp">${temp}°</div>
            <div class="forecast-rain">🌧 ${rain}%</div>
        `;


        container.appendChild(element);

    }

}


/* =====================================================
   MTR
===================================================== */

async function loadMTR() {

    try {

        const url =
            `${MTR_API}?line=EAL&sta=TWO&lang=TC`;


        const response =
            await fetch(
                url,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "MTR request failed"
            );

        }


        const data =
            await response.json();


        const station =
            data.data?.["EAL-TWO"];


        if (!station) {

            throw new Error(
                "No MTR data"
            );

        }


        renderMTR(
            station.DOWN || [],
            "mtrDown"
        );


        renderMTR(
            station.UP || [],
            "mtrUp"
        );


        document.getElementById(
            "mtrUpdated"
        ).textContent =
            `Updated ${formatUpdateTime()}`;

    }

    catch (error) {

        console.error(
            "MTR error:",
            error
        );

    }

}


function renderMTR(
    trains,
    elementId
) {

    const container =
        document.getElementById(elementId);


    if (!container) return;


    container.innerHTML = "";


    const visibleTrains =
        (trains || [])
            .slice(0, 4);


    if (visibleTrains.length === 0) {

        container.textContent =
            "No upcoming trains";

        return;

    }


    visibleTrains.forEach(train => {

        const element =
            document.createElement("div");


        element.className =
            "train";


        element.innerHTML = `
            <div class="train-time">
                ${train.ttnt ?? "--"} min
            </div>

            <div class="train-minutes">
                ${formatMTRDestination(
                    train.dest
                )}
            </div>
        `;


        container.appendChild(element);

    });

}


function formatMTRDestination(code) {

    const destinations = {

        ADM:
            "金鐘 / Admiralty",

        SHS:
            "上水 / Sheung Shui",

        LOW:
            "羅湖 / Lo Wu",

        LMC:
            "落馬洲 / Lok Ma Chau"

    };


    return destinations[code] || code || "--";

}


/* =====================================================
   BBC NEWS
===================================================== */

async function loadBBCNews() {

    const container =
        document.getElementById("bbcNews");


    if (!container) return;


    try {

        const url =
            "https://api.rss2json.com/v1/api.json?rss_url=" +
            encodeURIComponent(BBC_RSS);


        const response =
            await fetch(
                url,
                {
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (
            data.status !== "ok" ||
            !Array.isArray(data.items)
        ) {

            throw new Error(
                "BBC feed unavailable"
            );

        }


        renderNews(
            container,
            data.items.slice(0, 3)
        );

    }

    catch {

        container.textContent =
            "BBC News unavailable";

    }

}


/* =====================================================
   NOW NEWS
===================================================== */

async function loadNOWNews() {

    const container =
        document.getElementById("nowNews");


    if (!container) return;


    try {

        const searchURL =
            "https://news.google.com/rss/search?" +
            new URLSearchParams({

                q:
                    "site:news.now.com 香港 OR 本地 OR 兩岸",

                hl:
                    "zh-HK",

                gl:
                    "HK",

                ceid:
                    "HK:zh-Hant"

            }).toString();


        const url =
            "https://api.rss2json.com/v1/api.json?rss_url=" +
            encodeURIComponent(searchURL);


        const response =
            await fetch(
                url,
                {
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (
            data.status !== "ok" ||
            !Array.isArray(data.items)
        ) {

            throw new Error(
                "NOW feed unavailable"
            );

        }


        renderNews(
            container,
            data.items.slice(0, 3)
        );

    }

    catch {

        container.textContent =
            "NOW News unavailable";

    }

}


/* =====================================================
   RENDER NEWS
===================================================== */

function renderNews(
    container,
    items
) {

    container.innerHTML = "";


    items.forEach(item => {

        const link =
            document.createElement("a");


        link.className =
            "news-item";


        link.href =
            item.link || "#";


        link.target =
            "_blank";


        link.rel =
            "noopener noreferrer";


        link.textContent =
            cleanNewsTitle(
                item.title || "Untitled"
            );


        container.appendChild(link);

    });

}


function cleanNewsTitle(title) {

    const textarea =
        document.createElement("textarea");


    textarea.innerHTML =
        title;


    return textarea.value
        .replace(
            /\s*-\s*NOW News\s*$/i,
            ""
        )
        .trim();

}


/* =====================================================
   REFRESH
===================================================== */

async function refreshDashboard() {

    const button =
        document.getElementById(
            "refreshButton"
        );


    if (button) {

        button.disabled = true;

        button.classList.add(
            "refreshing"
        );

    }


    try {

        updateClock();


        await Promise.allSettled([

            loadWeather(true),

            loadMTR(),

            loadNOWNews(),

            loadBBCNews()

        ]);


        const lastUpdated =
            document.getElementById(
                "lastUpdated"
            );


        if (lastUpdated) {

            lastUpdated.textContent =
                `Updated ${formatUpdateTime()}`;

        }

    }

    finally {

        setTimeout(
            () => {

                if (button) {

                    button.classList.remove(
                        "refreshing"
                    );

                    button.disabled = false;

                }

            },
            500
        );

    }

}


/* =====================================================
   UTILITY
===================================================== */

function formatUpdateTime() {

    return new Intl.DateTimeFormat(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }
    ).format(new Date());

}


/* =====================================================
   INITIALIZE
===================================================== */

function initializeDashboard() {

    updateClock();

    updateWeatherTitles();

    loadWeather(true);

    loadMTR();

    loadNOWNews();

    loadBBCNews();


    const refreshButton =
        document.getElementById(
            "refreshButton"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            refreshDashboard
        );

    }

}


document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);


/* CLOCK */
setInterval(
    updateClock,
    1000
);


/* WEATHER */
setInterval(
    () => loadWeather(false),
    10 * 60 * 1000
);


/* MTR */
setInterval(
    loadMTR,
    30 * 1000
);


/* NEWS */
setInterval(
    loadNOWNews,
    10 * 60 * 1000
);


setInterval(
    loadBBCNews,
    10 * 60 * 1000
);
