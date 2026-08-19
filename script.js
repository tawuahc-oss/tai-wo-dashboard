/* =====================================================
   TAI WO DASHBOARD
   Current Location + Tai Wo MTR
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

const RSS_TO_JSON =
    "https://api.rss2json.com/v1/api.json";


/* =====================================================
   LOCATION
===================================================== */

let currentLatitude = FALLBACK_LATITUDE;
let currentLongitude = FALLBACK_LONGITUDE;

let locationLoaded = false;
let usingFallbackLocation = true;


/* =====================================================
   WEATHER CODE
===================================================== */

function weatherInfo(code) {

    const weather = {

        0: ["☀️", "晴"],

        1: ["🌤️", "大致晴朗"],

        2: ["⛅", "部分多雲"],

        3: ["☁️", "多雲"],

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
   GET CURRENT LOCATION
===================================================== */

function getCurrentLocation(force = false) {

    return new Promise(resolve => {

        if (
            locationLoaded &&
            !force
        ) {

            resolve({
                latitude: currentLatitude,
                longitude: currentLongitude,
                isFallback: usingFallbackLocation
            });

            return;

        }


        if (!navigator.geolocation) {

            currentLatitude =
                FALLBACK_LATITUDE;

            currentLongitude =
                FALLBACK_LONGITUDE;

            usingFallbackLocation = true;
            locationLoaded = true;

            resolve({
                latitude: currentLatitude,
                longitude: currentLongitude,
                isFallback: true
            });

            return;

        }


        navigator.geolocation.getCurrentPosition(

            position => {

                currentLatitude =
                    position.coords.latitude;

                currentLongitude =
                    position.coords.longitude;

                usingFallbackLocation = false;
                locationLoaded = true;

                resolve({
                    latitude: currentLatitude,
                    longitude: currentLongitude,
                    isFallback: false
                });

            },


            error => {

                console.warn(
                    "Location unavailable:",
                    error.message
                );


                currentLatitude =
                    FALLBACK_LATITUDE;

                currentLongitude =
                    FALLBACK_LONGITUDE;

                usingFallbackLocation = true;
                locationLoaded = true;

                resolve({
                    latitude: currentLatitude,
                    longitude: currentLongitude,
                    isFallback: true
                });

            },


            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: force
                    ? 0
                    : 300000
            }

        );

    });

}


/* =====================================================
   CLOCK + DATE + LUNAR
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


    const dateParts =
        new Intl.DateTimeFormat(

            "en-GB",

            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }

        ).formatToParts(now);


    const day =
        dateParts.find(
            part => part.type === "day"
        ).value;


    const month =
        dateParts.find(
            part => part.type === "month"
        ).value;


    const year =
        dateParts.find(
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
    ).textContent =
        timeString;


    document.getElementById(
        "date"
    ).textContent =
        `${day}/${month}/${year} · ${weekday}`;


    updateLunar(now);


    updateAnalogClock(now);

}


/* =====================================================
   LUNAR CALENDAR
===================================================== */

function updateLunar(date) {

    const lunarElement =
        document.getElementById(
            "lunar"
        );


    if (!lunarElement) {
        return;
    }


    try {

        const parts =
            new Intl.DateTimeFormat(

                "zh-Hant-u-ca-chinese",

                {
                    month: "long",
                    day: "numeric"
                }

            ).formatToParts(date);


        const relatedYear =
            new Intl.DateTimeFormat(

                "zh-Hant-u-ca-chinese",

                {
                    year: "numeric"
                }

            ).format(date);


        const monthPart =
            parts.find(
                part => part.type === "month"
            );


        const dayPart =
            parts.find(
                part => part.type === "day"
            );


        if (
            monthPart &&
            dayPart
        ) {

            lunarElement.textContent =
                `農曆 ${relatedYear}年 ${monthPart.value}${dayPart.value}`;

        }

        else {

            lunarElement.textContent =
                "農曆資料暫不可用";

        }

    }

    catch (error) {

        console.warn(
            "Lunar calendar unavailable:",
            error
        );

        lunarElement.textContent =
            "農曆資料暫不可用";

    }

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


    const hourHand =
        document.getElementById(
            "hourHand"
        );


    const minuteHand =
        document.getElementById(
            "minuteHand"
        );


    const secondHand =
        document.getElementById(
            "secondHand"
        );


    if (hourHand) {

        hourHand.style.transform =
            `translateX(-50%) rotate(${hourAngle}deg)`;

    }


    if (minuteHand) {

        minuteHand.style.transform =
            `translateX(-50%) rotate(${minuteAngle}deg)`;

    }


    if (secondHand) {

        secondHand.style.transform =
            `translateX(-50%) rotate(${secondAngle}deg)`;

    }

}


/* =====================================================
   WEATHER TITLES
===================================================== */

function updateWeatherTitles() {

    const weatherTitle =
        document.getElementById(
            "weatherTitle"
        );


    const forecastTitle =
        document.getElementById(
            "forecastTitle"
        );


    if (usingFallbackLocation) {

        if (weatherTitle) {

            weatherTitle.textContent =
                "🌤️ TAI WO WEATHER";

        }


        if (forecastTitle) {

            forecastTitle.textContent =
                "🌦️ TODAY'S FORECAST · TAI WO";

        }

    }

    else {

        if (weatherTitle) {

            weatherTitle.textContent =
                "📍 CURRENT LOCATION WEATHER";

        }


        if (forecastTitle) {

            forecastTitle.textContent =
                "🌦️ TODAY'S FORECAST · CURRENT LOCATION";

        }

    }

}


/* =====================================================
   WEATHER
===================================================== */

async function loadWeather(forceLocation = false) {

    const weatherUpdated =
        document.getElementById(
            "weatherUpdated"
        );


    try {

        if (weatherUpdated) {

            weatherUpdated.textContent =
                "Weather updating...";

        }


        await getCurrentLocation(
            forceLocation
        );


        updateWeatherTitles();


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


        const currentIndex =
            getCurrentHourlyIndex(
                data.hourly.time
            );


        const rain =
            data.hourly
                .precipitation_probability[
                    currentIndex
                ] ?? 0;


        document.getElementById(
            "rainProbability"
        ).textContent =
            `${rain}%`;


        renderForecast(
            data,
            currentIndex
        );


        if (weatherUpdated) {

            weatherUpdated.textContent =
                `Updated ${formatUpdateTime()}`;

        }


        updateLastUpdated();

    }

    catch (error) {

        console.error(
            "Weather error:",
            error
        );


        document.getElementById(
            "weatherDescription"
        ).textContent =
            "Weather unavailable";


        if (weatherUpdated) {

            weatherUpdated.textContent =
                "Unable to update weather";

        }

    }

}


/* =====================================================
   FIND CURRENT HOURLY INDEX
===================================================== */

function getCurrentHourlyIndex(times) {

    if (
        !times ||
        times.length === 0
    ) {
        return 0;
    }


    const now =
        new Date();


    let closestIndex = 0;

    let smallestDifference =
        Infinity;


    times.forEach(
        (timeString, index) => {

            const time =
                new Date(
                    `${timeString}:00`
                );


            const difference =
                Math.abs(
                    time.getTime() -
                    now.getTime()
                );


            if (
                difference <
                smallestDifference
            ) {

                smallestDifference =
                    difference;

                closestIndex =
                    index;

            }

        }
    );


    return closestIndex;

}


/* =====================================================
   FORECAST
===================================================== */

function renderForecast(
    data,
    startIndex
) {

    const container =
        document.getElementById(
            "forecast"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const hourly =
        data.hourly;


    const totalHours =
        Math.min(
            startIndex + 8,
            hourly.time.length
        );


    for (
        let i = startIndex;
        i < totalHours;
        i++
    ) {

        const time =
            new Date(
                `${hourly.time[i]}:00`
            );


        const hour =
            new Intl.DateTimeFormat(

                "en-GB",

                {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                }

            ).format(time);


        const temp =
            Math.round(
                hourly.temperature_2m[i]
            );


        const rain =
            hourly.precipitation_probability[i] ?? 0;


        const info =
            weatherInfo(
                hourly.weather_code[i]
            );


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
                🌧 ${rain}%
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

    const updated =
        document.getElementById(
            "mtrUpdated"
        );


    try {

        if (updated) {

            updated.textContent =
                "MTR updating...";

        }


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


        if (updated) {

            updated.textContent =
                `Updated ${formatUpdateTime()}`;

        }


        updateLastUpdated();

    }

    catch (error) {

        console.error(
            "MTR error:",
            error
        );


        document.getElementById(
            "mtrDown"
        ).textContent =
            "MTR data unavailable";


        document.getElementById(
            "mtrUp"
        ).textContent =
            "MTR data unavailable";


        if (updated) {

            updated.textContent =
                "Unable to update MTR";

        }

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


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const validTrains =
        (trains || [])
            .filter(
                train =>
                    train.valid === "Y"
            )
            .slice(0, 6);


    if (
        validTrains.length === 0
    ) {

        container.textContent =
            "No upcoming trains";

        return;

    }


    validTrains.forEach(
        train => {

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

        }
    );

}


/* =====================================================
   NEWS
===================================================== */

function clearNewsLoading() {

    const nowNews =
        document.getElementById(
            "nowNews"
        );


    const bbcNews =
        document.getElementById(
            "bbcNews"
        );


    if (nowNews) {

        nowNews.textContent =
            "Loading...";

    }


    if (bbcNews) {

        bbcNews.textContent =
            "Loading...";

    }

}


/* =====================================================
   NOW NEWS
===================================================== */

async function loadNowNews() {

    const container =
        document.getElementById(
            "nowNews"
        );


    if (!container) {
        return;
    }


    /*
       NOW News does not currently provide a stable
       browser-accessible feed endpoint used by this
       dashboard, so keep the card available instead
       of breaking the whole dashboard.
    */

    container.innerHTML =
        `
            <div class="news-item">
                NOW News unavailable
            </div>
        `;

}


/* =====================================================
   BBC NEWS
===================================================== */

async function loadBBCNews() {

    const container =
        document.getElementById(
            "bbcNews"
        );


    if (!container) {
        return;
    }


    try {

        container.textContent =
            "Loading...";


        const url =
            `${RSS_TO_JSON}?rss_url=` +
            encodeURIComponent(
                BBC_RSS
            );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "BBC news request failed"
            );

        }


        const data =
            await response.json();


        if (
            data.status !== "ok" ||
            !Array.isArray(
                data.items
            )
        ) {

            throw new Error(
                "BBC news data unavailable"
            );

        }


        container.innerHTML = "";


        const items =
            data.items.slice(
                0,
                20
            );


        if (
            items.length === 0
        ) {

            throw new Error(
                "No BBC news items"
            );

        }


        items.forEach(
            item => {

                const link =
                    document.createElement(
                        "a"
                    );


                link.className =
                    "news-item";


                link.textContent =
                    item.title;


                link.href =
                    item.link;


                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";


                container.appendChild(
                    link
                );

            }
        );


        updateLastUpdated();

    }

    catch (error) {

        console.error(
            "BBC news error:",
            error
        );


        container.innerHTML =
            `
                <div class="news-item">
                    BBC News unavailable
                </div>
            `;

    }

}


/* =====================================================
   LOAD ALL NEWS
===================================================== */

async function loadNews() {

    await Promise.allSettled([
        loadNowNews(),
        loadBBCNews()
    ]);

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

    ).format(
        new Date()
    );

}


function updateLastUpdated() {

    const element =
        document.getElementById(
            "lastUpdated"
        );


    if (!element) {
        return;
    }


    element.textContent =
        `Updated ${formatUpdateTime()}`;

}


/* =====================================================
   REFRESH ALL
===================================================== */

async function refreshAll() {

    const button =
        document.getElementById(
            "refreshButton"
        );


    if (button) {

        button.classList.add(
            "loading"
        );

        button.disabled = true;

    }


    try {

        locationLoaded = false;


        updateClock();


        await Promise.allSettled([

            loadWeather(true),

            loadMTR(),

            loadNews()

        ]);


        updateLastUpdated();

    }

    finally {

        if (button) {

            setTimeout(
                () => {

                    button.classList.remove(
                        "loading"
                    );

                    button.disabled = false;

                },
                500
            );

        }

    }

}


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        const refreshButton =
            document.getElementById(
                "refreshButton"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                refreshAll
            );

        }


        updateClock();


        loadWeather();


        loadMTR();


        loadNews();


        /* CLOCK */

        setInterval(
            updateClock,
            1000
        );


        /* WEATHER */

        setInterval(
            () => {
                loadWeather();
            },
            10 * 60 * 1000
        );


        /* MTR */

        setInterval(
            loadMTR,
            30 * 1000
        );


        /* NEWS */

        setInterval(
            loadNews,
            10 * 60 * 1000
        );

    }

);
