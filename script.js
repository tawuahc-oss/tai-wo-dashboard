/* =====================================================
   TAI WO DASHBOARD
===================================================== */


/* =====================================================
   SETTINGS
===================================================== */

const FALLBACK_LATITUDE = 22.4505;
const FALLBACK_LONGITUDE = 114.1649;

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

const HKO_FORECAST_API =
    "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=flw&lang=tc";

const HKO_SPECIAL_API =
    "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=swt&lang=tc";

const MTR_API =
    "https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php";

const RSS_TO_JSON =
    "https://api.rss2json.com/v1/api.json";

const BBC_RSS =
    "https://feeds.bbci.co.uk/news/world/rss.xml";

const NOW_LOCAL_RSS =
    "https://news.google.com/rss/search?q=site%3Anews.now.com%2Fhome%2Flocal&hl=zh-HK&gl=HK&ceid=HK%3Azh-Hant";

const NOW_INTERNATIONAL_RSS =
    "https://news.google.com/rss/search?q=site%3Anews.now.com%2Fhome%2Finternational&hl=zh-HK&gl=HK&ceid=HK%3Azh-Hant";


/* =====================================================
   WEATHER CODE
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
        96: ["⛈️", "強雷暴"],
        99: ["⛈️", "強雷暴"]

    };

    return weather[code] ||
        ["🌤️", "未知"];

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
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
                timeZone: "Asia/Hong_Kong"
            }
        ).format(now);


    const digitalTime =
        document.getElementById(
            "digitalTime"
        );

    if (digitalTime) {

        digitalTime.textContent =
            timeString;

    }


    const dateParts =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                timeZone: "Asia/Hong_Kong"
            }
        ).formatToParts(now);


    const getPart =
        type => {

            const part =
                dateParts.find(
                    item =>
                        item.type === type
                );

            return part
                ? part.value
                : "";

        };


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
                weekday: "long",
                timeZone: "Asia/Hong_Kong"
            }
        ).format(now);


    const dateMain =
        document.getElementById(
            "dateMain"
        );


    if (dateMain) {

        dateMain.textContent =
            `${year}年${month}月${day}日 ${weekday}`;

    }


    const lunarDate =
        document.getElementById(
            "lunarDate"
        );


    if (lunarDate) {

        try {

            const lunar =
                new Intl.DateTimeFormat(
                    "zh-Hant-u-ca-chinese",
                    {
                        month: "long",
                        day: "numeric",
                        timeZone: "Asia/Hong_Kong"
                    }
                ).format(now);


            lunarDate.textContent =
                `農曆 ${lunar}`;

        }

        catch {

            lunarDate.textContent =
                "農曆資料暫不可用";

        }

    }


    const hkParts =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hourCycle: "h23",
                timeZone: "Asia/Hong_Kong"
            }
        ).formatToParts(
            new Date()
        );


    const getTimePart =
        type => {

            const part =
                hkParts.find(
                    item =>
                        item.type === type
                );

            return part
                ? Number(part.value)
                : 0;

        };


    const hour =
        getTimePart("hour");

    const minute =
        getTimePart("minute");

    const second =
        getTimePart("second");


    const hourAngle =
        (hour % 12) * 30 +
        minute * 0.5 +
        second / 120;


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
   LOCATION
===================================================== */

function getCurrentLocation() {

    return new Promise(
        resolve => {

            if (!navigator.geolocation) {

                resolve({

                    latitude:
                        FALLBACK_LATITUDE,

                    longitude:
                        FALLBACK_LONGITUDE,

                    fallback: true

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

                        fallback: false

                    });

                },


                () => {

                    resolve({

                        latitude:
                            FALLBACK_LATITUDE,

                        longitude:
                            FALLBACK_LONGITUDE,

                        fallback: true

                    });

                },


                {

                    enableHighAccuracy: true,

                    timeout: 10000,

                    maximumAge: 300000

                }

            );

        }

    );

}


/* =====================================================
   FETCH JSON
===================================================== */

async function fetchJSON(url) {

    const response =
        await fetch(
            url,
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `Request failed: ${response.status}`
        );

    }


    return response.json();

}


/* =====================================================
   HKO WEATHER TEXT
===================================================== */

function hideHKOPanel(
    panelId,
    contentId
) {

    const panel =
        document.getElementById(
            panelId
        );


    const content =
        document.getElementById(
            contentId
        );


    if (content) {

        content.textContent =
            "";

        content.scrollTop =
            0;

    }


    if (panel) {

        panel.classList.add(
            "hidden"
        );

    }

}


function showHKOPanel(
    panelId,
    contentId,
    text
) {

    const panel =
        document.getElementById(
            panelId
        );


    const content =
        document.getElementById(
            contentId
        );


    if (
        !panel ||
        !content ||
        !text ||
        !text.trim()
    ) {

        return;

    }


    content.textContent =
        text.trim();


    content.scrollTop =
        0;


    panel.classList.remove(
        "hidden"
    );

}


async function loadHKOWeatherText() {

    hideHKOPanel(
        "hkoForecastPanel",
        "hkoForecast"
    );


    hideHKOPanel(
        "hkoSpecialPanel",
        "hkoSpecial"
    );


    const results =
        await Promise.allSettled([

            fetchJSON(
                HKO_FORECAST_API
            ),

            fetchJSON(
                HKO_SPECIAL_API
            )

        ]);


    /* =================================================
       HKO FORECAST
    ================================================= */

    if (
        results[0].status ===
        "fulfilled"
    ) {

        const data =
            results[0].value;


        const forecastText =
            data.forecastDesc ||
            data.forecastPeriod ||
            data.generalSituation ||
            "";


        if (
            forecastText &&
            forecastText.trim()
        ) {

            showHKOPanel(

                "hkoForecastPanel",

                "hkoForecast",

                forecastText

            );

        }

    }


    /* =================================================
       HKO SPECIAL WEATHER TIP
    ================================================= */

    if (
        results[1].status ===
        "fulfilled"
    ) {

        const tips =
            extractSpecialWeatherTips(
                results[1].value
            );


        if (
            tips.length > 0
        ) {

            showHKOPanel(

                "hkoSpecialPanel",

                "hkoSpecial",

                tips.join(" ")

            );

        }

    }

}


/* =====================================================
   EXTRACT HKO SPECIAL WEATHER TIPS
===================================================== */

function extractSpecialWeatherTips(data) {

    const results =
        [];


    const seen =
        new Set();


    function addText(text) {

        if (
            typeof text !==
            "string"
        ) {

            return;

        }


        const cleaned =
            text
                .replace(/\s+/g, " ")
                .trim();


        if (
            !cleaned ||
            cleaned.length < 2 ||
            seen.has(cleaned)
        ) {

            return;

        }


        seen.add(cleaned);

        results.push(cleaned);

    }


    function walk(
        value,
        keyName = ""
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return;

        }


        if (
            typeof value ===
            "string"
        ) {

            const allowedKeys = [

                "swt",
                "desc",
                "description",
                "content",
                "message",
                "text",
                "details",
                "detail",
                "tip"

            ];


            if (
                !keyName ||
                allowedKeys.includes(
                    keyName.toLowerCase()
                )
            ) {

                addText(value);

            }


            return;

        }


        if (
            Array.isArray(value)
        ) {

            value.forEach(
                item =>
                    walk(
                        item,
                        keyName
                    )
            );

            return;

        }


        if (
            typeof value ===
            "object"
        ) {

            Object.entries(value)
                .forEach(
                    ([key, item]) =>
                        walk(
                            item,
                            key
                        )
                );

        }

    }


    if (
        data &&
        data.swt !== undefined
    ) {

        walk(
            data.swt,
            "swt"
        );

    }

    else {

        walk(data);

    }


    return results.slice(
        0,
        3
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
            `&forecast_days=2`;


        const response =
            await fetch(
                url,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

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


        const weatherTitle =
            document.getElementById(
                "weatherTitle"
            );


        if (weatherTitle) {

            weatherTitle.textContent =
                location.fallback
                    ? "🌤️ TAI WO WEATHER"
                    : "📍 CURRENT WEATHER";

        }


        const weatherIcon =
            document.getElementById(
                "weatherIcon"
            );


        if (weatherIcon) {

            weatherIcon.textContent =
                info[0];

        }


        const temperature =
            document.getElementById(
                "temperature"
            );


        if (temperature) {

            temperature.textContent =
                `${Math.round(
                    data.current.temperature_2m
                )}°`;

        }


        const weatherDescription =
            document.getElementById(
                "weatherDescription"
            );


        if (weatherDescription) {

            weatherDescription.textContent =
                info[1];

        }


        const todayRange =
            document.getElementById(
                "todayRange"
            );


        if (todayRange) {

            todayRange.textContent =
                `${Math.round(
                    data.daily.temperature_2m_min[0]
                )}° — ${Math.round(
                    data.daily.temperature_2m_max[0]
                )}°`;

        }


        const humidity =
            document.getElementById(
                "humidity"
            );


        if (humidity) {

            humidity.textContent =
                `${data.current.relative_humidity_2m}%`;

        }


        const hkParts =
            new Intl.DateTimeFormat(
                "en-GB",
                {
                    hour: "numeric",
                    hourCycle: "h23",
                    timeZone: "Asia/Hong_Kong"
                }
            ).formatToParts(
                new Date()
            );


        const hourPart =
            hkParts.find(
                part =>
                    part.type ===
                    "hour"
            );


        const hkHour =
            hourPart
                ? Number(
                    hourPart.value
                )
                : 0;


        const rainProbability =
            document.getElementById(
                "rainProbability"
            );


        if (rainProbability) {

            const rain =
                data.hourly
                    .precipitation_probability[
                        hkHour
                    ] ?? 0;


            rainProbability.textContent =
                `${rain}%`;

        }


        renderForecast(
            data,
            hkHour
        );


        const weatherUpdated =
            document.getElementById(
                "weatherUpdated"
            );


        if (weatherUpdated) {

            weatherUpdated.textContent =
                `Updated ${formatTime()}`;

        }

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


    /* HKO text loads separately */

    try {

        await loadHKOWeatherText();

    }

    catch (error) {

        console.error(
            "HKO text error:",
            error
        );

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


    if (!forecast) {

        return;

    }


    forecast.innerHTML =
        "";


    const totalHours =
        data.hourly.time.length;


    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const hour =
            startHour + i;


        if (
            hour >= totalHours
        ) {

            break;

        }


        const time =
            data.hourly.time[hour]
                .split("T")[1]
                .slice(0, 5);


        const info =
            weatherInfo(
                data.hourly.weather_code[hour]
            );


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "forecast-item";


        item.innerHTML =
            `
                <div class="forecast-time">
                    ${time}
                </div>

                <div class="forecast-icon">
                    ${info[0]}
                </div>

                <div class="forecast-temp">
                    ${Math.round(
                        data.hourly.temperature_2m[
                            hour
                        ]
                    )}°
                </div>

                <div class="forecast-rain">
                    ${
                        data.hourly
                            .precipitation_probability[
                                hour
                            ] ?? 0
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
===================================================== */

async function loadMTR() {

    try {

        const response =
            await fetch(
                `${MTR_API}?line=EAL&sta=TWO&lang=TC`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "MTR unavailable"
            );

        }


        const data =
            await response.json();


        const station =
            data.data?.["EAL-TWO"];


        if (!station) {

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


    catch (error) {

        console.error(
            "MTR error:",
            error
        );


        const down =
            document.getElementById(
                "mtrDown"
            );


        const up =
            document.getElementById(
                "mtrUp"
            );


        if (down) {

            down.innerHTML =
                `<div class="train">暫無資料</div>`;

        }


        if (up) {

            up.innerHTML =
                `<div class="train">暫無資料</div>`;

        }

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


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const upcoming =
    trains
        .filter(
            train =>
                train.valid === "Y"
        )
        .slice(0, 3);


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


            item.innerHTML =
                `
                    <div class="train-time">
                        ${train.ttnt} min
                    </div>

                    <div class="train-destination">
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
   RSS HELPERS
===================================================== */

async function getRSS2JSON(
    rssURL
) {

    const url =
        `${RSS_TO_JSON}?rss_url=` +
        encodeURIComponent(
            rssURL
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
            "RSS2JSON request failed"
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
            "RSS2JSON error"
        );

    }


    return data.items || [];

}


async function getRSSCorsProxy(
    rssURL
) {

    const url =
        "https://corsproxy.io/?" +
        encodeURIComponent(
            rssURL
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
            "CorsProxy request failed"
        );

    }


    const xml =
        await response.text();


    if (
        !xml ||
        !xml.includes("<item")
    ) {

        throw new Error(
            "RSS XML unavailable"
        );

    }


    return parseRSSXML(
        xml
    );

}


async function getRSSAllOrigins(
    rssURL
) {

    const url =
        "https://api.allorigins.win/raw?url=" +
        encodeURIComponent(
            rssURL
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
            "AllOrigins request failed"
        );

    }


    const xml =
        await response.text();


    if (
        !xml ||
        !xml.includes("<item")
    ) {

        throw new Error(
            "RSS XML unavailable"
        );

    }


    return parseRSSXML(
        xml
    );

}


function parseRSSXML(
    xml
) {

    const parser =
        new DOMParser();


    const documentXML =
        parser.parseFromString(
            xml,
            "text/xml"
        );


    const items =
        Array.from(
            documentXML.querySelectorAll(
                "item"
            )
        );


    return items.map(
        item => {

            const title =
                item.querySelector(
                    "title"
                )?.textContent
                ?.trim() ||
                "";


            const link =
                item.querySelector(
                    "link"
                )?.textContent
                ?.trim() ||
                "";


            const pubDate =
                item.querySelector(
                    "pubDate"
                )?.textContent
                ?.trim() ||
                "";


            return {

                title:
                    decodeHTML(
                        title
                    ),

                link,

                pubDate

            };

        }
    );

}


function decodeHTML(
    text
) {

    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.innerHTML =
        text;


    return textarea.value;

}


async function getRSS(
    rssURL
) {

    const methods = [

        () =>
            getRSSCorsProxy(
                rssURL
            ),

        () =>
            getRSS2JSON(
                rssURL
            ),

        () =>
            getRSSAllOrigins(
                rssURL
            )

    ];


    let lastError =
        null;


    for (
        const method of methods
    ) {

        try {

            const items =
                await method();


            if (
                Array.isArray(items) &&
                items.length > 0
            ) {

                return items;

            }

        }


        catch (error) {

            lastError =
                error;

        }

    }


    throw (
        lastError ||
        new Error(
            "All RSS methods failed"
        )
    );

}


/* =====================================================
   NEWS RENDERING
===================================================== */

function renderNews(
    elementId,
    items
) {

    const container =
        document.getElementById(
            elementId
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !items ||
        !items.length
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
                    item.title ||
                    "Untitled";


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


    if (!container) {

        return;

    }


    container.innerHTML =
        `
            <div class="news-item">
                載入 NOW News...
            </div>
        `;


    try {

        const results =
            await Promise.allSettled([

                getRSS(
                    NOW_LOCAL_RSS
                ),

                getRSS(
                    NOW_INTERNATIONAL_RSS
                )

            ]);


        let localItems =
            [];


        let internationalItems =
            [];


        if (
            results[0].status ===
            "fulfilled"
        ) {

            localItems =
                results[0].value;

        }


        if (
            results[1].status ===
            "fulfilled"
        ) {

            internationalItems =
                results[1].value;

        }


        const seen =
            new Set();


        const combined =
            [];


        [
            ...localItems,
            ...internationalItems
        ]
            .forEach(
                item => {

                    const key =
                        (
                            item.link ||
                            item.title ||
                            ""
                        )
                        .trim();


                    if (
                        !key ||
                        seen.has(key)
                    ) {

                        return;

                    }


                    seen.add(
                        key
                    );


                    combined.push(
                        item
                    );

                }
            );


        if (
            combined.length > 0
        ) {

            renderNews(
                "nowNews",
                combined
            );


            return;

        }


        throw new Error(
            "No NOW News items"
        );

    }


    catch (error) {

        console.error(
            "NOW News error:",
            error
        );


        container.innerHTML =
            "";


        const localLink =
            document.createElement(
                "a"
            );


        localLink.className =
            "news-item";


        localLink.textContent =
            "港聞｜NOW News";


        localLink.href =
            "https://news.now.com/home/local";


        localLink.target =
            "_blank";


        localLink.rel =
            "noopener noreferrer";


        container.appendChild(
            localLink
        );


        const internationalLink =
            document.createElement(
                "a"
            );


        internationalLink.className =
            "news-item";


        internationalLink.textContent =
            "兩岸國際｜NOW News";


        internationalLink.href =
            "https://news.now.com/home/international";


        internationalLink.target =
            "_blank";


        internationalLink.rel =
            "noopener noreferrer";


        container.appendChild(
            internationalLink
        );

    }

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

        const items =
            await getRSS(
                BBC_RSS
            );


        renderNews(
            "bbcNews",
            items
        );

    }


    catch (error) {

        console.error(
            "BBC News error:",
            error
        );


        container.innerHTML =
            `
                <a
                    class="news-item"
                    href="https://www.bbc.com/news/world"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    BBC World News
                </a>
            `;

    }

}


/* =====================================================
   CALENDAR (穩定的本地香港假期邏輯 - 100% 成功秒開)
===================================================== */

async function loadCalendar() {

    const todayContainer =
        document.getElementById(
            "calendarToday"
        );

    const tomorrowContainer =
        document.getElementById(
            "calendarTomorrow"
        );


    if (!todayContainer || !tomorrowContainer) {

        return;

    }


    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);


    // 香港主要公眾假期快速對照表 (可依需求自行擴充)
    const holidays = {
        "1-1": "元旦",
        "5-1": "勞動節",
        "7-1": "香港特別行政區成立紀念日",
        "10-1": "國慶日",
        "12-25": "聖誕節",
        "12-26": "聖誕節後第一個周日"
    };


    function getHolidaysForDate(date) {
        const key = `${date.getMonth() + 1}-${date.getDate()}`;
        const results = [];
        if (holidays[key]) {
            results.push(holidays[key]);
        }
        return results;
    }


    const todayHolidays = getHolidaysForDate(now);
    const tomorrowHolidays = getHolidaysForDate(tomorrow);


    /* 渲染今日 */

    if (todayHolidays.length === 0) {

        todayContainer.innerHTML =
            `<div class="calendar-empty">今日無公眾假期</div>`;

    }

    else {

        todayContainer.innerHTML =
            "";

        todayHolidays.forEach(
            h => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "calendar-item";

                item.style.padding =
                    "3px 0";

                item.style.fontSize =
                    "clamp(11px, 1.1vw, 15px)";

                item.style.fontWeight =
                    "600";

                item.textContent =
                    h;

                todayContainer.appendChild(
                    item
                );

            }
        );

    }


    /* 渲染明日 */

    if (tomorrowHolidays.length === 0) {

        tomorrowContainer.innerHTML =
            `<div class="calendar-empty">明日無公眾假期</div>`;

    }

    else {

        tomorrowContainer.innerHTML =
            "";

        tomorrowHolidays.forEach(
            h => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "calendar-item";

                item.style.padding =
                    "3px 0";

                item.style.fontSize =
                    "clamp(11px, 1.1vw, 15px)";

                item.style.fontWeight =
                    "600";

                item.textContent =
                    h;

                tomorrowContainer.appendChild(
                    item
                );

            }
        );

    }

}


/* =====================================================
   TIME FORMAT
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


/* =====================================================
   LAST UPDATED
===================================================== */

function updateLastUpdated() {

    const element =
        document.getElementById(
            "lastUpdated"
        );


    if (!element) {

        return;

    }


    element.textContent =
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


    if (!button) {

        return;

    }


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

            loadBBCNews(),

            loadCalendar()

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
   START DASHBOARD
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


        /* WEATHER + HKO */

        setInterval(
            loadWeather,
            10 * 60 * 1000
        );


        /* MTR */

        setInterval(
            loadMTR,
            30 * 1000
        );


        /* NOW NEWS */

        setInterval(
            loadNowNews,
            10 * 60 * 1000
        );


        /* BBC NEWS */

        setInterval(
            loadBBCNews,
            10 * 60 * 1000
        );


        /* REFRESH BUTTON */

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
);
