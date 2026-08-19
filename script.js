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
   NEWS SETTINGS
===================================================== */

/* BBC World RSS */

const BBC_RSS =
    "https://feeds.bbci.co.uk/news/world/rss.xml";

/*
   NOW News RSSHub feeds

   港聞
*/
const NOW_LOCAL_RSS =
    "https://rsshub.app/now/news/local";

/*
   兩岸國際
*/
const NOW_INTERNATIONAL_RSS =
    "https://rsshub.app/now/news/international";


/*
   rss2json converts RSS into JSON so the browser
   can display the news feed.
*/

const RSS2JSON_API =
    "https://api.rss2json.com/v1/api.json?rss_url=";


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
        parts.find(
            p => p.type === "day"
        ).value;


    const month =
        parts.find(
            p => p.type === "month"
        ).value;


    const year =
        parts.find(
            p => p.type === "year"
        ).value;


    const weekday =
        new Intl.DateTimeFormat(
            "zh-HK",
            {
                weekday: "long",
                timeZone: "Asia/Hong_Kong"
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
            parts.find(
                p => p.type === "hour"
            ).value
        );


    const minute =
        Number(
            parts.find(
                p => p.type === "minute"
            ).value
        );


    const second =
        Number(
            parts.find(
                p => p.type === "second"
            ).value
        );


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


        /* =========================
           CURRENT WEATHER
        ========================= */

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


        /* =========================
           TODAY RANGE
        ========================= */

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


        /* =========================
           CURRENT HOUR RAIN
        ========================= */

        const hkHour =
            getHongKongHour();


        const rain =
            data.hourly
                .precipitation_probability[
                    hkHour
                ];


        document.getElementById(
            "rainProbability"
        ).textContent =
            `${rain ?? 0}%`;


        /* =========================
           FORECAST
        ========================= */

        renderForecast(
            data,
            hkHour
        );


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


        document.getElementById(
            "weatherDescription"
        ).textContent =
            "Weather unavailable";

    }

}


/* =====================================================
   FORECAST
===================================================== */

function renderForecast(
    data,
    currentHour
) {

    const container =
        document.getElementById(
            "forecast"
        );


    container.innerHTML = "";


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

    const downContainer =
        document.getElementById(
            "mtrDown"
        );

    const upContainer =
        document.getElementById(
            "mtrUp"
        );


    try {

        const url =
            `${MTR_API}?` +
            `line=EAL&` +
            `sta=TWO&` +
            `lang=TC`;


        const response =
            await fetch(
                url,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `MTR request failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "MTR response:",
            data
        );


        if (
            data.status !== 1
        ) {

            throw new Error(
                data.message ||
                "MTR data unavailable"
            );

        }


        const station =
            data.data?.["EAL-TWO"];


        if (!station) {

            throw new Error(
                "Tai Wo station data unavailable"
            );

        }


        /*
           DOWN = towards Admiralty
           UP   = towards Sheung Shui
        */

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


        document.getElementById(
            "lastUpdated"
        ).textContent =
            `Updated ${formatUpdateTime()}`;

    }

    catch (error) {

        console.error(
            "MTR error:",
            error
        );


        downContainer.textContent =
            "MTR data unavailable";


        upContainer.textContent =
            "MTR data unavailable";


        document.getElementById(
            "mtrUpdated"
        ).textContent =
            "MTR update failed";

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
        !Array.isArray(trains)
    ) {

        trains = [];

    }


    /*
       Use valid trains first.
       If the API does not provide valid="Y",
       still use the returned trains rather
       than leaving the panel blank.
    */

    let validTrains =
        trains.filter(
            train =>
                train &&
                (
                    train.valid === "Y" ||
                    train.valid === undefined ||
                    train.valid === null
                )
        );


    if (
        validTrains.length === 0 &&
        trains.length > 0
    ) {

        validTrains = trains;

    }


    validTrains =
        validTrains.slice(
            0,
            4
        );


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


            const minutes =
                train.ttnt !== undefined &&
                train.ttnt !== null &&
                train.ttnt !== ""
                    ? `${train.ttnt} min`
                    : "--";


            const destination =
                formatMTRDestination(
                    train.dest
                );


            element.innerHTML = `

                <div class="train-time">
                    ${escapeHTML(minutes)}
                </div>

                <div class="train-minutes">
                    ${escapeHTML(destination)}
                </div>

            `;


            container.appendChild(
                element
            );

        }
    );

}


/* =====================================================
   MTR DESTINATION NAMES
===================================================== */

function formatMTRDestination(code) {

    const destinations = {

        "ADM":
            "金鐘 / Admiralty",

        "SHS":
            "上水 / Sheung Shui",

        "LOW":
            "羅湖 / Lo Wu",

        "LMC":
            "落馬洲 / Lok Ma Chau"

    };


    return (
        destinations[code] ||
        code ||
        "--"
    );

}


/* =====================================================
   NEWS
===================================================== */

async function loadNews() {

    await Promise.allSettled(
        [

            loadBBCNews(),

            loadNOWNews()

        ]
    );

}


/* =====================================================
   LOAD BBC NEWS
===================================================== */

async function loadBBCNews() {

    const container =
        document.getElementById(
            "bbcNews"
        );


    try {

        const url =
            RSS2JSON_API +
            encodeURIComponent(
                BBC_RSS
            );


        const response =
            await fetch(
                url,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "BBC request failed"
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
                data.message ||
                "BBC feed unavailable"
            );

        }


        renderNews(
            container,
            data.items,
            3
        );

    }

    catch (error) {

        console.error(
            "BBC error:",
            error
        );


        container.innerHTML = `

            <div class="news-item">
                BBC News unavailable
            </div>

        `;

    }

}


/* =====================================================
   LOAD NOW NEWS
===================================================== */

async function loadNOWNews() {

    const container =
        document.getElementById(
            "nowNews"
        );


    try {

        /*
           Load 港聞 and 兩岸國際.
           Each feed is requested separately.
        */

        const localURL =
            RSS2JSON_API +
            encodeURIComponent(
                NOW_LOCAL_RSS
            );


        const internationalURL =
            RSS2JSON_API +
            encodeURIComponent(
                NOW_INTERNATIONAL_RSS
            );


        const results =
            await Promise.allSettled(
                [

                    fetch(
                        localURL,
                        {
                            cache: "no-store"
                        }
                    ).then(
                        response => {

                            if (
                                !response.ok
                            ) {

                                throw new Error(
                                    "NOW local request failed"
                                );

                            }

                            return response.json();

                        }
                    ),

                    fetch(
                        internationalURL,
                        {
                            cache: "no-store"
                        }
                    ).then(
                        response => {

                            if (
                                !response.ok
                            ) {

                                throw new Error(
                                    "NOW international request failed"
                                );

                            }

                            return response.json();

                        }
                    )

                ]
            );


        const items = [];


        results.forEach(
            result => {

                if (
                    result.status === "fulfilled" &&
                    result.value?.status === "ok" &&
                    Array.isArray(
                        result.value.items
                    )
                ) {

                    result.value.items
                        .slice(
                            0,
                            3
                        )
                        .forEach(
                            item => {

                                items.push(item);

                            }
                        );

                }

            }
        );


        if (
            items.length === 0
        ) {

            throw new Error(
                "No NOW news available"
            );

        }


        /*
           Remove duplicate headlines.
        */

        const uniqueItems =
            [];

        const titles =
            new Set();


        items.forEach(
            item => {

                const title =
                    (item.title || "")
                        .trim();


                if (
                    title &&
                    !titles.has(title)
                ) {

                    titles.add(title);

                    uniqueItems.push(item);

                }

            }
        );


        renderNews(
            container,
            uniqueItems,
            3
        );

    }

    catch (error) {

        console.error(
            "NOW error:",
            error
        );


        container.innerHTML = `

            <div class="news-item">
                NOW News unavailable
            </div>

        `;

    }

}


/* =====================================================
   RENDER NEWS
===================================================== */

function renderNews(
    container,
    items,
    limit = 3
) {

    container.innerHTML = "";


    const newsItems =
        items.slice(
            0,
            limit
        );


    if (
        newsItems.length === 0
    ) {

        container.innerHTML = `

            <div class="news-item">
                No news available
            </div>

        `;

        return;

    }


    newsItems.forEach(
        item => {

            const element =
                document.createElement(
                    "a"
                );


            element.className =
                "news-item";


            element.href =
                item.link || "#";


            element.target =
                "_blank";


            element.rel =
                "noopener noreferrer";


            element.textContent =
                cleanNewsTitle(
                    item.title ||
                    "Untitled"
                );


            container.appendChild(
                element
            );

        }
    );

}


/* =====================================================
   CLEAN NEWS TITLE
===================================================== */

function cleanNewsTitle(title) {

    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.innerHTML =
        title;


    return textarea.value
        .replace(
            /<[^>]*>/g,
            ""
        )
        .trim();

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}


/* =====================================================
   UTILITY
===================================================== */

function getHongKongHour() {

    const hour =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                hour: "2-digit",
                hourCycle: "h23",
                timeZone: "Asia/Hong_Kong"
            }
        ).format(
            new Date()
        );


    return Number(hour);

}


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

loadNews();


/* =====================================================
   CLOCK
===================================================== */

setInterval(
    updateClock,
    1000
);


/* =====================================================
   WEATHER

   Refresh every 10 minutes
===================================================== */

setInterval(
    loadWeather,
    10 * 60 * 1000
);


/* =====================================================
   MTR

   Refresh every 30 seconds
===================================================== */

setInterval(
    loadMTR,
    30 * 1000
);


/* =====================================================
   NEWS

   Refresh every 10 minutes
===================================================== */

setInterval(
    loadNews,
    10 * 60 * 1000
);
