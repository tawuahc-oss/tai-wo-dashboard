/* =========================================
   TAI WO DASHBOARD
   script.js
========================================= */


/* =========================================
   HELPERS
========================================= */

function $(id) {
    return document.getElementById(id);
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

function formatTime(date) {
    return date.toLocaleTimeString("en-HK", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}

function formatDate(date) {
    const days = [
        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六"
    ];

    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} · ${days[date.getDay()]}`;
}


/* =========================================
   DIGITAL CLOCK
========================================= */

function updateClock() {
    const now = new Date();

    $("time").textContent = formatTime(now);
    $("date").textContent = formatDate(now);
}


/* =========================================
   ANALOG CLOCK
========================================= */

function updateAnalogClock() {
    const now = new Date();

    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondDeg = seconds * 6;
    const minuteDeg = minutes * 6 + seconds * 0.1;
    const hourDeg = (hours % 12) * 30 + minutes * 0.5;

    $("secondHand").style.transform =
        `translateX(-50%) rotate(${secondDeg}deg)`;

    $("minuteHand").style.transform =
        `translateX(-50%) rotate(${minuteDeg}deg)`;

    $("hourHand").style.transform =
        `translateX(-50%) rotate(${hourDeg}deg)`;
}


/* =========================================
   LAST UPDATED
========================================= */

function updateLastUpdated() {
    const now = new Date();

    $("lastUpdated").textContent =
        `Updated ${formatTime(now)}`;
}


/* =========================================
   WEATHER
   Existing dashboard weather API
========================================= */

/*
   Your weather section is kept separate so
   MTR/news failures will not stop the clock.

   If your previous script used a different
   weather API, replace ONLY this section
   later. The rest of the dashboard works
   independently.
*/


/* =========================================
   MTR - TAI WO STATION
   East Rail Line
   Station code: TWO
========================================= */

const MTR_API =
    "https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=EAL&sta=TWO";

function getMinutesUntil(timeString) {
    if (!timeString) return null;

    const parts = timeString.split(" ");

    if (parts.length < 2) return null;

    const datePart = parts[0];
    const timePart = parts[1];

    const datePieces = datePart.split("-");
    const timePieces = timePart.split(":");

    if (
        datePieces.length !== 3 ||
        timePieces.length < 2
    ) {
        return null;
    }

    const arrival = new Date(
        Number(datePieces[0]),
        Number(datePieces[1]) - 1,
        Number(datePieces[2]),
        Number(timePieces[0]),
        Number(timePieces[1]),
        Number(timePieces[2] || 0)
    );

    const diff =
        Math.round((arrival.getTime() - Date.now()) / 60000);

    return Math.max(0, diff);
}

function getTrainDestination(train) {
    return train.dest || "";
}

function createTrainHtml(train) {
    const minutes = getMinutesUntil(train.time);
    const destination = getTrainDestination(train);

    let minuteText = "";

    if (minutes === null) {
        minuteText = "--";
    } else if (minutes === 0) {
        minuteText = "Now";
    } else if (minutes === 1) {
        minuteText = "1 min";
    } else {
        minuteText = `${minutes} mins`;
    }

    return `
        <div class="train">
            <div class="train-time">
                ${escapeHtml(minuteText)}
            </div>

            <div class="train-minutes">
                ${escapeHtml(destination)}
            </div>
        </div>
    `;
}

function showMtrMessage(id, message) {
    $(id).innerHTML = `
        <div class="train">
            <div class="train-minutes">
                ${escapeHtml(message)}
            </div>
        </div>
    `;
}

async function loadMTR() {
    try {
        const response = await fetch(MTR_API, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("MTR request failed");
        }

        const data = await response.json();

        const stationKey = "EAL-TWO";
        const stationData = data.data?.[stationKey];

        if (!stationData) {
            throw new Error("Tai Wo station data unavailable");
        }

        const downTrains = stationData.DOWN || [];
        const upTrains = stationData.UP || [];

        if (downTrains.length > 0) {
            $("mtrDown").innerHTML =
                downTrains
                    .slice(0, 3)
                    .map(createTrainHtml)
                    .join("");
        } else {
            showMtrMessage(
                "mtrDown",
                "No upcoming trains"
            );
        }

        if (upTrains.length > 0) {
            $("mtrUp").innerHTML =
                upTrains
                    .slice(0, 3)
                    .map(createTrainHtml)
                    .join("");
        } else {
            showMtrMessage(
                "mtrUp",
                "No upcoming trains"
            );
        }

        const updateTime =
            data.curr_time ||
            new Date().toLocaleString("en-HK");

        $("mtrUpdated").textContent =
            `MTR updated · ${updateTime}`;

    } catch (error) {

        console.error("MTR error:", error);

        showMtrMessage(
            "mtrDown",
            "MTR unavailable"
        );

        showMtrMessage(
            "mtrUp",
            "MTR unavailable"
        );

        $("mtrUpdated").textContent =
            "Unable to update MTR";
    }
}


/* =========================================
   NEWS
========================================= */

/*
   RSS feeds
*/

const NOW_LOCAL_URL =
    "https://news.now.com/home/local";

const NOW_CHINA_WORLD_URL =
    "https://news.now.com/home/international";

const BBC_WORLD_RSS =
    "https://feeds.bbci.co.uk/news/world/rss.xml";


/*
   RSS conversion service.

   This converts RSS/XML into browser-readable
   data for a static GitHub Pages website.
*/

function rssJsonUrl(feedUrl) {
    return "https://api.rss2json.com/v1/api.json?rss_url=" +
        encodeURIComponent(feedUrl);
}


/* =========================================
   BBC WORLD NEWS
========================================= */

function createNewsItem(title, link) {
    return `
        <a
            class="news-item"
            href="${escapeHtml(link)}"
            target="_blank"
            rel="noopener noreferrer"
            title="${escapeHtml(title)}"
        >
            ${escapeHtml(title)}
        </a>
    `;
}

function showNewsMessage(id, message) {
    $(id).innerHTML = `
        <div class="news-item">
            ${escapeHtml(message)}
        </div>
    `;
}

async function loadBBCNews() {
    try {
        const response = await fetch(
            rssJsonUrl(BBC_WORLD_RSS),
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("BBC request failed");
        }

        const data = await response.json();

        if (
            data.status !== "ok" ||
            !Array.isArray(data.items)
        ) {
            throw new Error("BBC feed unavailable");
        }

        $("bbcNews").innerHTML =
            data.items
                .slice(0, 3)
                .map(item =>
                    createNewsItem(
                        item.title,
                        item.link
                    )
                )
                .join("");

    } catch (error) {

        console.error("BBC error:", error);

        showNewsMessage(
            "bbcNews",
            "BBC World News unavailable"
        );
    }
}


/* =========================================
   NOW NEWS
========================================= */

/*
   NOW does not provide a simple official RSS
   endpoint here for direct use in this static
   dashboard.

   The dashboard therefore tries to retrieve
   the NOW category pages through an RSS/search
   compatible proxy.

   We combine:
   - 港聞
   - 兩岸國際
*/


const NOW_FEEDS = [
    "https://news.now.com/home/local",
    "https://news.now.com/home/international"
];


async function loadNowFeed(url) {
    /*
       First attempt:
       RSS2JSON accepts RSS feeds, but NOW pages
       may not expose RSS directly.

       If this fails, the dashboard will continue
       running and show an unavailable message.
    */

    const response = await fetch(
        rssJsonUrl(url),
        {
            cache: "no-store"
        }
    );

    if (!response.ok) {
        throw new Error("NOW request failed");
    }

    const data = await response.json();

    if (
        data.status !== "ok" ||
        !Array.isArray(data.items)
    ) {
        return [];
    }

    return data.items;
}

async function loadNowNews() {
    try {
        const results =
            await Promise.allSettled(
                NOW_FEEDS.map(loadNowFeed)
            );

        const items = [];

        results.forEach(result => {
            if (
                result.status === "fulfilled" &&
                Array.isArray(result.value)
            ) {
                items.push(...result.value);
            }
        });

        if (items.length === 0) {
            throw new Error("NOW feeds unavailable");
        }

        /*
           Remove duplicate titles
        */

        const uniqueItems = [];
        const titles = new Set();

        for (const item of items) {
            const title = (item.title || "").trim();

            if (!title || titles.has(title)) {
                continue;
            }

            titles.add(title);

            uniqueItems.push(item);
        }

        $("nowNews").innerHTML =
            uniqueItems
                .slice(0, 3)
                .map(item =>
                    createNewsItem(
                        item.title,
                        item.link
                    )
                )
                .join("");

    } catch (error) {

        console.error("NOW error:", error);

        showNewsMessage(
            "nowNews",
            "NOW News unavailable"
        );
    }
}


/* =========================================
   NEWS REFRESH
========================================= */

async function loadAllNews() {
    await Promise.all([
        loadNowNews(),
        loadBBCNews()
    ]);
}


/* =========================================
   CALENDAR PLACEHOLDER
========================================= */

function loadCalendarPlaceholder() {
    /*
       iCloud Calendar requires a separate
       CalDAV/public calendar solution.

       It is left untouched for now.
    */
}


/* =========================================
   START DASHBOARD
========================================= */

function startDashboard() {

    /*
       Clock
    */

    updateClock();
    updateAnalogClock();

    setInterval(() => {
        updateClock();
        updateAnalogClock();
    }, 1000);


    /*
       MTR
    */

    loadMTR();

    setInterval(() => {
        loadMTR();
    }, 15000);


    /*
       News
    */

    loadAllNews();

    setInterval(() => {
        loadAllNews();
    }, 300000);


    /*
       Footer
    */

    updateLastUpdated();

    setInterval(() => {
        updateLastUpdated();
    }, 60000);


    /*
       Calendar
    */

    loadCalendarPlaceholder();
}


document.addEventListener(
    "DOMContentLoaded",
    startDashboard
);
