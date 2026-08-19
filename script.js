/* =====================================================
   TAI WO DASHBOARD
   Hong Kong Time
===================================================== */


/* =====================================================
   SETTINGS
===================================================== */

const WEATHER_LATITUDE = 22.4505;
const WEATHER_LONGITUDE = 114.1649;

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

const MTR_API =
    "https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php";


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

        61: ["🌧️", "小雨"],
        63: ["🌧️", "中雨"],
        65: ["🌧️", "大雨"],

        71: ["🌨️", "小雪"],
        73: ["🌨️", "中雪"],
        75: ["❄️", "大雪"],

        80: ["🌦️", "陣雨"],
        81: ["🌧️", "陣雨"],
        82: ["🌧️", "大驟雨"],

        95: ["⛈️", "雷暴"],
        96: ["⛈️", "雷暴"],
        99: ["⛈️", "雷暴"]

    };

    return weather[code] || ["🌤️", "未知"];

}


/* =====================================================
   CLOCK
===================================================== */

function updateClock() {

    const now = new Date();

    const timeOptions = {

        hour: "numeric",

        minute: "2-digit",

        second: "2-digit",

        hour12: true,

        timeZone: "Asia/Hong_Kong"

    };

    const dateOptions = {

        day: "numeric",

        month: "numeric",

        year: "numeric",

        weekday: "long",

        timeZone: "Asia/Hong_Kong"

    };


    const timeString =
        new Intl.DateTimeFormat(
            "en-US",
            timeOptions
        ).format(now);


    const parts =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                timeZone: "Asia/Hong_Kong"
            }
        ).formatToParts(now);


    const day =
        parts.find(p => p.type === "day").value;

    const month =
        parts.find(p => p.type === "month").value;

    const year =
        parts.find(p => p.type === "year").value;


    const weekday =
        new Intl.DateTimeFormat(
            "zh-HK",
            {
                weekday: "long",
                timeZone: "Asia/Hong_Kong"
            }
        ).format(now);


    document.getElementById("time")
        .textContent = timeString;


    document.getElementById("date")
        .textContent =
        `${day}/${month}/${year} · ${weekday}`;


    updateAnalogClock(now);

}


/* =====================================================
   ANALOG CLOCK
===================================================== */

function updateAnalogClock(now) {

    const formatter =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: "Asia/Hong_Kong",

                hour: "numeric",

                minute: "numeric",

                second: "numeric",

                hour12: false
            }
        );


    const parts =
        formatter.formatToParts(now);


    const hour =
        Number(
            parts.find(p => p.type === "hour").value
        );

    const minute =
        Number(
            parts.find(p => p.type === "minute").value
        );

    const second =
        Number(
            parts.find(p => p.type === "second").value
        );


    const hourAngle =
        (hour % 12) * 30 +
        minute * 0.5;

    const minuteAngle =
        minute * 6 +
        second * 0.1;

    const secondAngle =
        second * 6;


    document.getElementById("hourHand")
        .style.transform =
        `rotate(${hourAngle}deg)`;


    document.getElementById("minuteHand")
        .style.transform =
        `rotate(${minuteAngle}deg)`;


    document.getElementById("secondHand")
        .style.transform =
        `rotate(${secondAngle}deg)`;

}


/* =====================================================
   WEATHER
===================================================== */

async function loadWeather() {

    try {

        const url =
            `${WEATHER_API}?` +

            `latitude=${WEATHER_LATITUDE}` +

            `&longitude=${WEATHER_LONGITUDE}` +

            `&current=temperature_2m,relative_humidity_2m,weather_code` +

            `&hourly=temperature_2m,precipitation_probability,weather_code` +

            `&daily=temperature_2m_max,temperature_2m_min` +

            `&timezone=Asia%2FHong_Kong` +

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
            `${Math.round(current.temperature_2m)}°`;


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
                data.daily.temperature_2m_max[0]
            );


        const min =
            Math.round(
                data.daily.temperature_2m_min[0]
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

    }

    catch (error) {

        console.error(error);

        document.getElementById(
            "weatherDescription"
        ).textContent =
            "Weather unavailable";

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
        i < Math.min(currentHour + 8, 24);
        i++
    ) {

        const temp =
            Math.round(
                data.hourly.temperature_2m[i]
            );


        const rain =
            data.hourly
                .precipitation_probability[i];


        const code =
            data.hourly.weather_code[i];


        const info =
            weatherInfo(code);


        const hour =
            `${String(i).padStart(2, "0")}:00`;


        const element =
            document.createElement("div");


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


    if (
        !trains ||
        trains.length === 0
    ) {

        container.textContent =
            "No upcoming trains";

        return;

    }


    trains
        .filter(train =>
            train.valid === "Y"
        )
        .slice(0, 4)
        .forEach(train => {

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

/*
   News will be connected after the first
   dashboard version is working.

   BBC World RSS:
   https://feeds.bbci.co.uk/news/world/rss.xml

   NOW:
   RSSHub route can provide NOW categories.

   We intentionally leave this separate because
   browser CORS restrictions can prevent direct
   RSS loading from GitHub Pages.
*/


function loadNewsPlaceholder() {

    document.getElementById(
        "nowNews"
    ).innerHTML = `

        <div class="news-item">
            NOW 本地／兩岸新聞
        </div>

        <div class="news-item">
            News feed will be connected
        </div>

    `;


    document.getElementById(
        "bbcNews"
    ).innerHTML = `

        <div class="news-item">
            BBC World News
        </div>

        <div class="news-item">
            News feed will be connected
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
            hour12: true,
            timeZone: "Asia/Hong_Kong"
        }
    ).format(now);

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