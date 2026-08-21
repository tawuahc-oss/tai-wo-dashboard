/* =====================================================
   CALENDAR (穩定的本地香港假期與行程邏輯)
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


    // 香港固定/主要公眾假期快速對照表 (範例或可自行擴充)
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
