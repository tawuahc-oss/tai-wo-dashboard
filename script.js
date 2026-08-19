/* =====================================================
   TAI WO DASHBOARD
===================================================== */


/* =====================================================
   SETTINGS
===================================================== */

const FALLBACK_LATITUDE =
    22.4505;

const FALLBACK_LONGITUDE =
    114.1649;


const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";


const MTR_API =
    "https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php";


const RSS_TO_JSON =
    "https://api.rss2json.com/v1/api.json";


const BBC_RSS =
    "https://feeds.bbci.co.uk/news/world/rss.xml";


const NOW_GOOGLE_RSS =
    "https://news.google.com/rss/search?q=site%3Anews.now.com+NOW+News&hl=zh-HK&gl=HK&ceid=HK%3Azh-Hant";


/* =====================================================
   WEATHER INFO
===================================================== */

function weatherInfo(code) {

    const weather = {

        0:
            ["☀️", "晴"],

        1:
            ["🌤️", "大致晴朗"],

        2:
            ["⛅", "部分多雲"],

        3:
            ["☁️", "多雲"],

        45:
            ["🌫️", "有霧"],

        48:
            ["🌫️", "有霧"],

        51:
            ["🌦️", "毛毛雨"],

        53:
            ["🌦️", "毛毛雨"],

        55:
            ["🌧️", "毛毛雨"],

        61:
            ["🌧️", "小雨"],

        63:
            ["🌧️", "中雨"],

        65:
            ["🌧️", "大雨"],

        71:
            ["🌨️", "小雪"],

        73:
            ["🌨️", "中雪"],

        75:
            ["❄️", "大雪"],

        80:
            ["🌦️", "陣雨"],

        81:
            ["🌧️", "陣雨"],

        82:
            ["🌧️", "大驟雨"],

        95:
            ["⛈️", "雷暴"],

        96:
            ["⛈️", "雷暴"],

        99:
            ["⛈️", "強雷暴"]

    };


    return (
        weather[code] ||
        ["🌤️", "未知"]
    );

}


/* =====================================================
   CLOCK + DATE
===================================================== */

function updateClock() {

    const now =
        new Date();


    const timeString =
        new Intl.DateTimeFormat(
            "en-US",
            {

                hour:
                    "numeric",

                minute:
                    "2-digit",

                second:
                    "2-digit",

                hour12:
                    true,

                timeZone:
                    "Asia/Hong_Kong"

            }
        ).format(
            now
        );


    document.getElementById(
        "digitalTime"
    ).textContent =
        timeString;


    const dateParts =
        new Intl.DateTimeFormat(
            "en-GB",
            {

                year:
                    "numeric",

                month:
                    "numeric",

                day:
                    "numeric",

                timeZone:
                    "Asia/Hong_Kong"

            }
        ).formatToParts(
            now
        );


    const getPart =
        type =>
            dateParts.find(
                part =>
                    part.type === type
            ).value;


    const year =
        getPart("year");

    const month =
        getPart("month");

    const day =
        getPart("day");


    const weekday =
        new Intl.DateTimeFormat(
            "zh-HK",
            {

                weekday:
                    "long",

                timeZone:
                    "Asia/Hong_Kong"

            }
        ).format(
            now
        );


    document.getElementById(
        "dateMain"
    ).textContent =
        `${year}年${month}月${day}日 ${weekday}`;


    try {

        const lunar =
            new Intl.DateTimeFormat(
                "zh-Hant-u-ca-chinese",
                {

                    month:
                        "long",

                    day:
                        "numeric",

                    timeZone:
                        "Asia/Hong_Kong"

                }
            ).format(
                now
            );


        document.getElementById(
            "lunarDate"
        ).textContent =
            `農曆 ${lunar}`;

    }

    catch {

        document.getElementById(
            "lunarDate"
        ).textContent =
            "農曆資料暫不可用";

    }


    const hkParts =
        new Intl.DateTimeFormat(
            "en-GB",
            {

                hour:
                    "numeric",

                minute:
                    "numeric",

                second:
                    "numeric",

                hourCycle:
                    "h23",

                timeZone:
                    "Asia/Hong_Kong"

            }
        ).formatToParts(
            now
        );


    const getTimePart =
        type =>
            Number(
                hkParts.find(
                    part =>
                        part.type === type
                ).value
            );


    const hour =
        getTimePart(
            "hour"
        );


    const minute =
        getTimePart(
            "minute"
        );


    const second =
        getTimePart(
            "second"
        );


    const hourAngle =
        (hour % 12) *
        30 +
        minute *
        0.5 +
        second /
        120;


    const minuteAngle =
        minute *
        6 +
        second *
        0.1;


    const secondAngle =
        second *
        6;


    document.getElementById(
        "hourHand"
    ).style.transform =
        `translateX(-50%) rotate(${hourAngle}deg)`;


    document.getElementById(
        "minuteHand"
    ).style.transform =
        `translateX(-50%) rotate(${minuteAngle}deg)`;


    document.getElementById(
        "secondHand"
    ).style.transform =
        `translateX(-50%) rotate(${secondAngle}deg)`;

}


/* =====================================================
   LOCATION
===================================================== */

function getCurrentLocation() {

    return new Promise(
        resolve => {

            if (
                !navigator.geolocation
            ) {

                resolve({

                    latitude:
                        FALLBACK_LATITUDE,

                    longitude:
                        FALLBACK_LONGITUDE,

                    fallback:
                        true

                });

                return;

            }


            navigator.geolocation.getCurrentPosition(

                position => {

                    resolve({

                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude,

                        fallback:
                            false

                    });

                },


                () => {

                    resolve({

                        latitude:
                            FALLBACK_LATITUDE,

                        longitude:
                            FALLBACK_LONGITUDE,

                        fallback:
                            true

                    });

                },


                {

                    enableHighAccuracy:
                        true,

                    timeout:
                        10000,

                    maximumAge:
                        300000

                }

            );

        }
    );

}


/* =====================================================
   WEATHER
===================================================== */

async function loadWeather() {

    try {

        const location =
            await getCurrentLocation();


        const url =

            `${WEATHER_API}` +

            `?latitude=${location.latitude}` +

            `&longitude=${location.longitude}` +

            `&current=temperature_2m,relative_humidity_2m,weather_code` +

            `&hourly=temperature_2m,precipitation_probability,weather_code` +

            `&daily=temperature_2m_max,temperature_2m_min` +

            `&timezone=Asia%2FHong_Kong` +

            `&forecast_days=1`;


        const response =
            await fetch(
                url,
                {
                    cache:
                        "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Weather unavailable"
            );

        }


        const data =
            await response.json();


        const info =
            weatherInfo(
                data.current.weather_code
            );


        document.getElementById(
            "weatherTitle"
        ).textContent =

            location.fallback

                ? "🌤️ TAI WO WEATHER"

                : "📍 CURRENT WEATHER";


        document.getElementById(
            "weatherIcon"
        ).textContent =
            info[0];


        document.getElementById(
            "temperature"
        ).textContent =
            `${Math.round(
                data.current.temperature_2m
            )}°`;


        document.getElementById(
            "weatherDescription"
        ).textContent =
            info[1];


        document.getElementById(
            "todayRange"
        ).textContent =

            `${Math.round(
                data.daily.temperature_2m_min[0]
            )}° — ` +

            `${Math.round(
                data.daily.temperature_2m_max[0]
            )}°`;


        document.getElementById(
            "humidity"
        ).textContent =

            `${data.current.relative_humidity_2m}%`;


        const currentHour =
            Number(
                new Date().toLocaleString(
                    "en-US",
                    {

                        timeZone:
                            "Asia/Hong_Kong",

                        hour:
                            "numeric",

                        hourCycle:
                            "h23"

                    }
                )
            );


        document.getElementById(
            "rainProbability"
        ).textContent =

            `${data.hourly.precipitation_probability[currentHour] || 0}%`;


        renderForecast(
            data,
            currentHour
        );


        document.getElementById(
            "weatherUpdated"
        ).textContent =
            `Updated ${formatTime()}`;

    }

    catch(error) {

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
    startHour
) {

    const forecast =
        document.getElementById(
            "forecast"
        );


    forecast.innerHTML =
        "";


    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const hour =
            (startHour + i) %
            24;


        const time =
            data.hourly.time[
                hour
            ]
            .split("T")[1]
            .slice(0, 5);


        const info =
            weatherInfo(
                data.hourly.weather_code[
                    hour
                ]
            );


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "forecast-hour";


        item.innerHTML = `

            <div class="forecast-time">
                ${time}
            </div>

            <div class="forecast-icon">
                ${info[0]}
            </div>

            <div class="forecast-temp">
                ${
                    Math.round(
                        data.hourly
                            .temperature_2m[
                                hour
                            ]
                    )
                }°
            </div>

            <div class="forecast-rain">
                ${
                    data.hourly
                        .precipitation_probability[
                            hour
                        ] || 0
                }%
            </div>

        `;


        forecast.appendChild(
            item
        );

    }

}


/* =====================================================
   MTR
   ONLY THE NEXT TWO TRAINS
===================================================== */

async function loadMTR() {

    try {

        const response =
            await fetch(

                `${MTR_API}?line=EAL&sta=TWO&lang=TC`,

                {
                    cache:
                        "no-store"
                }

            );


        if (
            !response.ok
        ) {

            throw new Error(
                "MTR unavailable"
            );

        }


        const data =
            await response.json();


        const station =
            data.data?.[
                "EAL-TWO"
            ];


        if (
            !station
        ) {

            throw new Error(
                "Tai Wo unavailable"
            );

        }


        renderTrains(
            station.DOWN || [],
            "mtrDown"
        );


        renderTrains(
            station.UP || [],
            "mtrUp"
        );

    }

    catch(error) {

        console.error(
            "MTR error:",
            error
        );


        document.getElementById(
            "mtrDown"
        ).innerHTML =
            `<div class="train">暫無班次</div>`;


        document.getElementById(
            "mtrUp"
        ).innerHTML =
            `<div class="train">暫無班次</div>`;

    }

}


function renderTrains(
    trains,
    elementId
) {

    const container =
        document.getElementById(
            elementId
        );


    container.innerHTML =
        "";


    /*
       ONLY 2 upcoming trains.
    */

    const upcoming =
        trains

            .filter(
                train =>
                    train.valid === "Y"
            )

            .slice(
                0,
                2
            );


    if (
        upcoming.length === 0
    ) {

        container.innerHTML =
            `<div class="train">暫無班次</div>`;

        return;

    }


    upcoming.forEach(
        train => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "train";


            item.innerHTML = `

                <div class="train-time">
                    ${train.ttnt} min
                </div>

                <div class="train-minutes">
                    ${train.dest || ""}
                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =====================================================
   RSS
===================================================== */

async function getRSS(
    rssURL
) {

    const response =
        await fetch(

            `${RSS_TO_JSON}?rss_url=${
                encodeURIComponent(
                    rssURL
                )
            }`,

            {
                cache:
                    "no-store"
            }

        );


    if (
        !response.ok
    ) {

        throw new Error(
            "RSS unavailable"
        );

    }


    const data =
        await response.json();


    if (
        data.status &&
        data.status !== "ok"
    ) {

        throw new Error(
            data.message ||
            "RSS error"
        );

    }


    return data.items || [];

}


/* =====================================================
   NEWS RENDER
===================================================== */

function renderNews(
    elementId,
    items
) {

    const container =
        document.getElementById(
            elementId
        );


    container.innerHTML =
        "";


    if (
        !items ||
        items.length === 0
    ) {

        container.textContent =
            "暫時沒有新聞";

        return;

    }


    items
        .slice(
            0,
            30
        )
        .forEach(
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
                    item.link ||
                    "#";


                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";


                container.appendChild(
                    link
                );

            }
        );

}


/* =====================================================
   NOW NEWS
===================================================== */

async function loadNowNews() {

    const container =
        document.getElementById(
            "nowNews"
        );


    try {

        const items =
            await getRSS(
                NOW_GOOGLE_RSS
            );


        renderNews(
            "nowNews",
            items
        );

    }

    catch(error) {

        console.error(
            "NOW News error:",
            error
        );


        container.innerHTML =
            "";


        const fallback =
            document.createElement(
                "a"
            );


        fallback.className =
            "news-item";


        fallback.textContent =
            "NOW News 暫時無法載入，按此開啟 NOW News";


        fallback.href =
            "https://news.now.com/";


        fallback.target =
            "_blank";


        fallback.rel =
            "noopener noreferrer";


        container.appendChild(
            fallback
        );

    }

}


/* =====================================================
   BBC NEWS
===================================================== */

async function loadBBCNews() {

    try {

        const items =
            await getRSS(
                BBC_RSS
            );


        renderNews(
            "bbcNews",
            items
        );

    }

    catch(error) {

        console.error(
            "BBC News error:",
            error
        );


        document.getElementById(
            "bbcNews"
        ).innerHTML =

            `<div class="news-item">
                暫時無法載入 BBC News
            </div>`;

    }

}


/* =====================================================
   CALENDAR
===================================================== */

function loadCalendar() {

    document.getElementById(
        "calendar"
    ).innerHTML =

        `<div>
            iCloud Calendar 尚未連接
        </div>`;

}


/* =====================================================
   TIME
===================================================== */

function formatTime() {

    return new Intl.DateTimeFormat(

        "en-US",

        {

            hour:
                "numeric",

            minute:
                "2-digit",

            second:
                "2-digit",

            hour12:
                true,

            timeZone:
                "Asia/Hong_Kong"

        }

    ).format(
        new Date()
    );

}


function updateLastUpdated() {

    document.getElementById(
        "lastUpdated"
    ).textContent =

        `Updated ${formatTime()}`;

}


/* =====================================================
   REFRESH
===================================================== */

async function refreshDashboard() {

    const button =
        document.getElementById(
            "refreshButton"
        );


    button.classList.add(
        "loading"
    );


    button.disabled =
        true;


    try {

        await Promise.allSettled([

            loadWeather(),

            loadMTR(),

            loadNowNews(),

            loadBBCNews()

        ]);


        updateLastUpdated();

    }

    finally {

        setTimeout(

            () => {

                button.classList.remove(
                    "loading"
                );


                button.disabled =
                    false;

            },

            500

        );

    }

}


/* =====================================================
   START
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        updateClock();


        loadWeather();


        loadMTR();


        loadNowNews();


        loadBBCNews();


        loadCalendar();


        updateLastUpdated();


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


        /* NOW */

        setInterval(

            loadNowNews,

            10 * 60 * 1000

        );


        /* BBC */

        setInterval(

            loadBBCNews,

            10 * 60 * 1000

        );


        /* REFRESH */

        document
            .getElementById(
                "refreshButton"
            )
            .addEventListener(
                "click",
                refreshDashboard
            );

    }

);
