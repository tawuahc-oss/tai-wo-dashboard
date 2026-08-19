const TAI_WO_LAT = 22.4505;
const TAI_WO_LON = 114.1649;

const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const MTR_API = "https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php";

const HKO_API =
    "https://data.weather.gov.hk/weatherAPI/opendata/weather.php";

const NOW_RSSHUB_BASE = "https://rsshub.umzzz.com";
const NOW_LOCAL_RSS = `${NOW_RSSHUB_BASE}/now/news/local`;
const NOW_INTERNATIONAL_RSS = `${NOW_RSSHUB_BASE}/now/news/international`;

const BBC_RSS = "https://feeds.bbci.co.uk/news/world/rss.xml";
const RSS2JSON = "https://api.rss2json.com/v1/api.json";

let latitude = TAI_WO_LAT;
let longitude = TAI_WO_LON;
let usingTaiWo = true;

function getLocation() {
    return new Promise(resolve => {
        if (!navigator.geolocation) {
            resolve();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                usingTaiWo = false;
                resolve();
            },
            () => {
                latitude = TAI_WO_LAT;
                longitude = TAI_WO_LON;
                usingTaiWo = true;
                resolve();
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    });
}

function resizeClock() {
    const clockArea = document.querySelector(".clock-area");
    const analogClock = document.getElementById("analogClock");

    if (!clockArea || !analogClock) return;

    const availableWidth = Math.max(80, clockArea.clientWidth - 10);
    const availableHeight = Math.max(80, clockArea.clientHeight - 10);

    const size = Math.max(
        80,
        Math.min(availableWidth, availableHeight, 190)
    );

    analogClock.style.width = `${size}px`;
    analogClock.style.height = `${size}px`;
}

function updateClock() {
    const now = new Date();

    document.getElementById("digitalTime").textContent =
        new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            timeZone: "Asia/Hong_Kong"
        }).format(now);

    const dateParts =
        new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            timeZone: "Asia/Hong_Kong"
        }).formatToParts(now);

    const year = dateParts.find(p => p.type === "year").value;
    const month = dateParts.find(p => p.type === "month").value;
    const day = dateParts.find(p => p.type === "day").value;

    const weekday =
        new Intl.DateTimeFormat("zh-HK", {
            weekday: "long",
            timeZone: "Asia/Hong_Kong"
        }).format(now);

    document.getElementById("dateMain").textContent =
        `${year}年${month}月${day}日 ${weekday}`;

    try {
        const lunar =
            new Intl.DateTimeFormat("zh-Hant-u-ca-chinese", {
                month: "long",
                day: "numeric",
                timeZone: "Asia/Hong_Kong"
            }).format(now);

        document.getElementById("lunarDate").textContent =
            `農曆 ${lunar}`;
    } catch {
        document.getElementById("lunarDate").textContent =
            "農曆資料暫不可用";
    }

    const hkTime =
        new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
            timeZone: "Asia/Hong_Kong"
        }).formatToParts(now);

    const hour = Number(hkTime.find(p => p.type === "hour").value);
    const minute = Number(hkTime.find(p => p.type === "minute").value);
    const second = Number(hkTime.find(p => p.type === "second").value);

    document.getElementById("hourHand").style.transform =
        `translateX(-50%) rotate(${(hour % 12) * 30 + minute * 0.5}deg)`;

    document.getElementById("minuteHand").style.transform =
        `translateX(-50%) rotate(${minute * 6 + second * 0.1}deg)`;

    document.getElementById("secondHand").style.transform =
        `translateX(-50%) rotate(${second * 6}deg)`;
}

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

async function loadHKOText() {
    const forecastElement = document.getElementById("hkoForecast");
    const specialElement = document.getElementById("hkoSpecial");

    forecastElement.style.display = "none";
    specialElement.style.display = "none";
    forecastElement.textContent = "";
    specialElement.textContent = "";

    try {
        const response = await fetch(
            `${HKO_API}?dataType=flw&lang=tc`,
            { cache: "no-store" }
        );

        if (!response.ok) throw new Error("HKO forecast failed");

        const data = await response.json();

        const text = data.generalSituation || data.forecastDesc || "";

        if (text) {
            forecastElement.textContent = `天氣預報：${text}`;
            forecastElement.style.display = "block";
        }
    } catch (error) {
        console.warn("HKO forecast text unavailable:", error);
    }

    try {
        const response = await fetch(
            `${HKO_API}?dataType=swt&lang=tc`,
            { cache: "no-store" }
        );

        if (!response.ok) throw new Error("HKO special weather failed");

        const data = await response.json();

        const raw =
            Array.isArray(data.swt)
                ? data.swt
                : (Array.isArray(data.specialWeatherTips)
                    ? data.specialWeatherTips
                    : []);

        const tips = raw
            .map(item => {
                if (typeof item === "string") return item;
                return item.desc || item.description || item.message || "";
            })
            .filter(Boolean);

        if (tips.length > 0) {
            specialElement.textContent =
                `⚠️ 特別天氣提示：${tips.join("　")}`;
            specialElement.style.display = "block";
        }
    } catch (error) {
        console.warn("HKO special weather unavailable:", error);
    }
}

async function loadWeather() {
    const weatherUpdated = document.getElementById("weatherUpdated");

    try {
        weatherUpdated.textContent = "Weather updating...";

        await getLocation();

        const weatherURL =
            `${WEATHER_API}` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,weather_code` +
            `&hourly=temperature_2m,precipitation_probability,weather_code` +
            `&daily=temperature_2m_max,temperature_2m_min` +
            `&timezone=Asia%2FHong_Kong` +
            `&forecast_days=1`;

        const response =
            await fetch(weatherURL, { cache: "no-store" });

        if (!response.ok) throw new Error("Weather API failed");

        const data = await response.json();
        const info = weatherInfo(data.current.weather_code);

        document.getElementById("weatherIcon").textContent = info[0];

        document.getElementById("temperature").textContent =
            `${Math.round(data.current.temperature_2m)}°`;

        document.getElementById("weatherDescription").textContent =
            info[1];

        document.getElementById("todayRange").textContent =
            `${Math.round(data.daily.temperature_2m_min[0])}° — ` +
            `${Math.round(data.daily.temperature_2m_max[0])}°`;

        document.getElementById("humidity").textContent =
            `${data.current.relative_humidity_2m}%`;

        const hkParts =
            new Intl.DateTimeFormat("en-US", {
                hour: "numeric",
                hour12: false,
                timeZone: "Asia/Hong_Kong"
            }).formatToParts(new Date());

        const currentHour = Number(
            hkParts.find(p => p.type === "hour").value
        );

        const rain =
            data.hourly.precipitation_probability[
                Math.min(
                    currentHour,
                    data.hourly.precipitation_probability.length - 1
                )
            ] ?? 0;

        document.getElementById("rainProbability").textContent =
            `${rain}%`;

        document.getElementById("weatherTitle").textContent =
            usingTaiWo
                ? "🌤️ TAI WO WEATHER"
                : "📍 CURRENT LOCATION WEATHER";

        document.getElementById("forecastTitle").textContent =
            "🌦️ TODAY'S FORECAST";

        renderForecast(data, currentHour);

        await loadHKOText();

        weatherUpdated.textContent = `Updated ${formatTime()}`;
        updateLastUpdated();

    } catch (error) {
        console.error("Weather error:", error);

        document.getElementById("weatherDescription").textContent =
            "Weather unavailable";

        weatherUpdated.textContent =
            "Unable to update weather";
    }
}

function renderForecast(data, startHour) {
    const container = document.getElementById("forecast");
    container.innerHTML = "";

    const total =
        Math.min(startHour + 8, data.hourly.time.length);

    for (let i = startHour; i < total; i++) {
        const time =
            data.hourly.time[i]
                .split("T")[1]
                .substring(0, 5);

        const info =
            weatherInfo(data.hourly.weather_code[i]);

        const item = document.createElement("div");
        item.className = "forecast-item";

        item.innerHTML = `
            <div class="forecast-time">${time}</div>
            <div class="forecast-icon">${info[0]}</div>
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

async function loadMTR() {
    try {
        const response = await fetch(
            `${MTR_API}?line=EAL&sta=TWO&lang=TC`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("MTR API failed");
        }

        const data = await response.json();

        const station =
            data.data?.["EAL-TWO"];

        if (!station) {
            throw new Error("MTR station unavailable");
        }

        renderTrains(
            station.DOWN || [],
            "mtrDown"
        );

        renderTrains(
            station.UP || [],
            "mtrUp"
        );

    } catch (error) {
        console.error("MTR error:", error);

        document.getElementById("mtrDown").innerHTML =
            `<div class="train">暫無資料</div>`;

        document.getElementById("mtrUp").innerHTML =
            `<div class="train">暫無資料</div>`;
    }
}

function renderTrains(trains, elementId) {
    const container =
        document.getElementById(elementId);

    container.innerHTML = "";

    const validTrains =
        trains
            .filter(train => train.valid === "Y")
            .slice(0, 2);

    if (validTrains.length === 0) {
        container.innerHTML =
            `<div class="train">暫無班次</div>`;
        return;
    }

    validTrains.forEach(train => {
        const item = document.createElement("div");

        item.className = "train";

        item.innerHTML = `
            <div class="train-time">
                ${train.ttnt} min
            </div>
            <div class="train-destination">
                ${train.dest || ""}
            </div>
        `;

        container.appendChild(item);
    });
}

async function getRSS(rssURL) {
    const url =
        `${RSS2JSON}?rss_url=` +
        encodeURIComponent(rssURL);

    const response =
        await fetch(url, {
            cache: "no-store"
        });

    if (!response.ok) {
        throw new Error(
            `RSS failed: HTTP ${response.status}`
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
            "RSS conversion failed"
        );
    }

    return data;
}

function addNewsItem(container, title, link) {
    const item =
        document.createElement("a");

    item.className = "news-item";

    item.textContent =
        title || "Untitled";

    item.href =
        link || "#";

    item.target = "_blank";
    item.rel = "noopener noreferrer";

    container.appendChild(item);
}

async function loadNowNews() {
    const container =
        document.getElementById("nowNews");

    container.innerHTML = "";

    try {
        const results =
            await Promise.all([
                getRSS(NOW_LOCAL_RSS),
                getRSS(NOW_INTERNATIONAL_RSS)
            ]);

        const allItems =
            results.flatMap(
                result => result.items || []
            );

        const seen =
            new Set();

        const unique =
            allItems.filter(item => {
                if (seen.has(item.title)) {
                    return false;
                }

                seen.add(item.title);
                return true;
            });

        unique
            .slice(0, 30)
            .forEach(item =>
                addNewsItem(
                    container,
                    item.title,
                    item.link
                )
            );

        if (!container.children.length) {
            throw new Error("No NOW news");
        }

    } catch (error) {
        console.error(
            "NOW News error:",
            error
        );

        container.innerHTML = `
            <a
                class="news-item"
                href="https://news.now.com/home/local"
                target="_blank"
                rel="noopener noreferrer"
            >
                NOW 港聞新聞
            </a>

            <a
                class="news-item"
                href="https://news.now.com/home/international"
                target="_blank"
                rel="noopener noreferrer"
            >
                NOW 兩岸國際新聞
            </a>

            <div
                class="news-item"
                style="
                    color:var(--muted);
                    cursor:default;
                "
            >
                NOW 即時標題暫時無法載入。
            </div>
        `;
    }
}

async function loadBBCNews() {
    const container =
        document.getElementById("bbcNews");

    container.innerHTML = "";

    try {
        const data =
            await getRSS(BBC_RSS);

        (data.items || [])
            .slice(0, 30)
            .forEach(item =>
                addNewsItem(
                    container,
                    item.title,
                    item.link
                )
            );

        if (!container.children.length) {
            throw new Error("No BBC news");
        }

    } catch (error) {
        console.error(
            "BBC error:",
            error
        );

        container.innerHTML = `
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

function loadCalendar() {
    document.getElementById("calendar").innerHTML = `
        <div class="calendar-empty">
            iCloud Calendar 尚未連接
        </div>
    `;
}

function formatTime() {
    return new Intl.DateTimeFormat(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            timeZone: "Asia/Hong_Kong"
        }
    ).format(new Date());
}

function updateLastUpdated() {
    document.getElementById("lastUpdated").textContent =
        `Updated ${formatTime()}`;
}

async function refreshDashboard() {
    const button =
        document.getElementById("refreshButton");

    button.classList.add("loading");
    button.disabled = true;

    try {
        await Promise.allSettled([
            loadWeather(),
            loadMTR(),
            loadNowNews(),
            loadBBCNews()
        ]);

        updateLastUpdated();

    } finally {
        setTimeout(() => {
            button.classList.remove("loading");
            button.disabled = false;
        }, 500);
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        resizeClock();
        updateClock();

        loadWeather();
        loadMTR();
        loadNowNews();
        loadBBCNews();
        loadCalendar();

        updateLastUpdated();

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
            loadNowNews,
            10 * 60 * 1000
        );

        setInterval(
            loadBBCNews,
            10 * 60 * 1000
        );

        window.addEventListener(
            "resize",
            resizeClock
        );

        if (window.ResizeObserver) {
            const observer =
                new ResizeObserver(
                    resizeClock
                );

            const clockArea =
                document.querySelector(
                    ".clock-area"
                );

            if (clockArea) {
                observer.observe(
                    clockArea
                );
            }
        }

        document
            .getElementById("refreshButton")
            .addEventListener(
                "click",
                refreshDashboard
            );
    }
);
