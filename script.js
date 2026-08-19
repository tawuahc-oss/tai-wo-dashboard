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


let currentLatitude = FALLBACK_LATITUDE;
let currentLongitude = FALLBACK_LONGITUDE;

let locationLoaded = false;
let usingFallbackLocation = true;


/* WEATHER CODE */

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


/* LOCATION */

function getCurrentLocation(force = false) {

    return new Promise(resolve => {

        if (
            locationLoaded &&
            !force
        ) {

            resolve();

            return;

        }


        if (!navigator.geolocation) {

            currentLatitude = FALLBACK_LATITUDE;
            currentLongitude = FALLBACK_LONGITUDE;

            usingFallbackLocation = true;
            locationLoaded = true;

            resolve();

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

                resolve();

            },

            () => {

                currentLatitude = FALLBACK_LATITUDE;
                currentLongitude = FALLBACK_LONGITUDE;

                usingFallbackLocation = true;
                locationLoaded = true;

                resolve();

            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: force ? 0 : 300000
            }

        );

    });

}


/* CLOCK + DATE + LUNAR */

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


    document.getElementById(
        "clockTime"
    ).textContent =
        timeString;


    const year =
        new Intl.DateTimeFormat(
            "zh-HK",
            { year: "numeric" }
        ).format(now);


    const month =
        new Intl.DateTimeFormat(
            "zh-HK",
            { month: "numeric" }
        ).format(now);


    const day =
        new Intl.DateTimeFormat(
            "zh-HK",
            { day: "numeric" }
        ).format(now);


    const weekday =
        new Intl.DateTimeFormat(

            "zh-HK",

            {
                weekday: "long"
            }

        ).format(now);


    document.getElementById(
        "topDate"
    ).textContent =
        `${year}年${month}月${day}日 ${weekday}`;


    updateLunar(now);
    updateAnalogClock(now);

}


function updateLunar(date) {

    const lunar =
        document.getElementById("lunar");


    try {

        const lunarText =
            new Intl.DateTimeFormat(

                "zh-Hant-u-ca-chinese",

                {
                    month: "long",
                    day: "numeric"
                }

            ).format(date);


        lunar.textContent =
            `農曆 ${lunarText}`;

    }

    catch {

        lunar.textContent =
            "農曆資料暫不可用";

    }

}


/* ANALOG CLOCK */

function updateAnalogClock(now) {

    const hour =
        now.getHours() % 12;

    const minute =
        now.getMinutes();

    const second =
        now.getSeconds();


    document.getElementById(
        "hourHand"
    ).style.transform =
        `translateX(-50%) rotate(${hour * 30 + minute * 0.5}deg)`;


    document.getElementById(
        "minuteHand"
    ).style.transform =
        `translateX(-50%) rotate(${minute * 6 + second * 0.1}deg)`;


    document.getElementById(
        "secondHand"
    ).style.transform =
        `translateX(-50%) rotate(${second * 6}deg)`;

}


/* WEATHER */

async function loadWeather(forceLocation = false) {

    try {

        await getCurrentLocation(forceLocation);


        const title =
            usingFallbackLocation
                ? "🌤️ TAI WO WEATHER"
                : "📍 CURRENT WEATHER";


        document.getElementById(
            "weatherTitle"
        ).textContent =
            title;


        document.getElementById(
            "forecastTitle"
        ).textContent =
            usingFallbackLocation
                ? "🌦️ TODAY'S FORECAST · TAI WO"
                : "🌦️ TODAY'S FORECAST";


        const url =
            `${WEATHER_API}?latitude=${currentLatitude}` +
            `&longitude=${currentLongitude}` +
            `&current=temperature_2m,relative_humidity_2m,weather_code` +
            `&hourly=temperature_2m,precipitation_probability,weather_code` +
            `&daily=temperature_2m_max,temperature_2m_min` +
            `&timezone=auto` +
            `&forecast_days=1`;


        const response =
            await fetch(url);


        const data =
            await response.json();


        const info =
            weatherInfo(
                data.current.weather_code
            );


        document.getElementById(
            "temperature"
        ).textContent =
            `${Math.round(data.current.temperature_2m)}°`;


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
            `${data.current.relative_humidity_2m}%`;


        document.getElementById(
            "todayRange"
        ).textContent =
            `${Math.round(data.daily.temperature_2m_min[0])}° — ${Math.round(data.daily.temperature_2m_max[0])}°`;


        const currentHour =
            new Date().getHours();


        const rain =
            data.hourly
                .precipitation_probability[currentHour] ?? 0;


        document.getElementById(
            "rainProbability"
        ).textContent =
            `${rain}%`;


        renderForecast(
            data,
            currentHour
        );


        document.getElementById(
            "weatherUpdated"
        ).textContent =
            `Updated ${formatTime()}`;


        updateLastUpdated();

    }

    catch (error) {

        console.error(error);

        document.getElementById(
            "weatherDescription"
        ).textContent =
            "Weather unavailable";

    }

}


function renderForecast(data, start) {

    const container =
        document.getElementById("forecast");


    container.innerHTML = "";


    for (
        let i = start;
        i < Math.min(start + 8, 24);
        i++
    ) {

        const hour =
            data.hourly.time[i]
                .split("T")[1]
                .substring(0, 5);


        const info =
            weatherInfo(
                data.hourly.weather_code[i]
            );


        const item =
            document.createElement("div");


        item.className =
            "forecast-hour";


        item.innerHTML = `

            <div class="forecast-time">
                ${hour}
            </div>

            <div class="forecast-icon">
                ${info[0]}
            </div>

            <div class="forecast-temp">
                ${Math.round(data.hourly.temperature_2m[i])}°
            </div>

            <div class="forecast-rain">
                ${data.hourly.precipitation_probability[i] ?? 0}%
            </div>

        `;


        container.appendChild(item);

    }

}


/* MTR */

async function loadMTR() {

    try {

        const response =
            await fetch(
                `${MTR_API}?line=EAL&sta=TWO&lang=TC`
            );


        const data =
            await response.json();


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


        updateLastUpdated();

    }

    catch (error) {

        console.error(error);

    }

}


function renderMTR(trains, id) {

    const container =
        document.getElementById(id);


    container.innerHTML = "";


    (trains || [])
        .filter(
            train => train.valid === "Y"
        )
        .slice(0, 4)
        .forEach(train => {

            const item =
                document.createElement("div");


            item.className =
                "train";


            item.innerHTML = `

                <div class="train-time">
                    ${train.ttnt} min
                </div>

                <div class="train-minutes">
                    ${train.dest}
                </div>

            `;


            container.appendChild(item);

        });

}


/* BBC NEWS */

async function loadBBCNews() {

    const container =
        document.getElementById("bbcNews");


    try {

        const response =
            await fetch(

                `${RSS_TO_JSON}?rss_url=${encodeURIComponent(BBC_RSS)}`

            );


        const data =
            await response.json();


        container.innerHTML = "";


        data.items
            .slice(0, 20)
            .forEach(item => {

                const link =
                    document.createElement("a");


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


                container.appendChild(link);

            });

    }

    catch {

        container.textContent =
            "BBC News unavailable";

    }

}


/* NOW NEWS */

async function loadNowNews() {

    const container =
        document.getElementById("nowNews");


    /*
       NOW News requires a browser-accessible feed/API.
       Keep this card ready for the feed endpoint.
    */

    container.innerHTML =
        `<div class="news-item">NOW News loading unavailable</div>`;

}


/* CALENDAR */

function loadCalendar() {

    document.getElementById(
        "calendar"
    ).innerHTML =
        `
        <div>
            iCloud Calendar
        </div>
        `;

}


/* UTILITIES */

function formatTime() {

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


function updateLastUpdated() {

    document.getElementById(
        "lastUpdated"
    ).textContent =
        `Updated ${formatTime()}`;

}


/* REFRESH */

async function refreshAll() {

    const button =
        document.getElementById(
            "refreshButton"
        );


    button.classList.add("loading");
    button.disabled = true;


    locationLoaded = false;


    updateClock();


    await Promise.allSettled([

        loadWeather(true),
        loadMTR(),
        loadBBCNews(),
        loadNowNews()

    ]);


    updateLastUpdated();


    setTimeout(() => {

        button.classList.remove("loading");
        button.disabled = false;

    }, 500);

}


/* START */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document.getElementById(
            "refreshButton"
        ).addEventListener(
            "click",
            refreshAll
        );


        updateClock();

        loadWeather();
        loadMTR();
        loadBBCNews();
        loadNowNews();
        loadCalendar();


        setInterval(
            updateClock,
            1000
        );


        setInterval(
            loadWeather,
            10 * 60 * 1000
        );


        setInterval(
            loadMTR,
            30 * 1000
        );


        setInterval(
            loadBBCNews,
            10 * 60 * 1000
        );

    }
);
