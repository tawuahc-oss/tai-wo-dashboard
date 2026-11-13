// Optional browser check: install Playwright and run with NODE_PATH pointing to it.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
    const browser = process.env.QA_ENGINE === 'webkit'
        ? await webkit.launch({ headless: true, timeout: 15000 })
        : await chromium.launch({ channel: 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('https://**/*', route => route.abort());
        await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
        await page.evaluate(() => loadWeather());
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        const mobile = await page.evaluate(() => ({
            position: getComputedStyle(document.querySelector('.dashboard')).position,
            footerBottom: document.querySelector('footer').getBoundingClientRect().bottom,
            viewport: innerHeight, scrollY,
            overflow: document.documentElement.scrollWidth > innerWidth
        }));
        assert.equal(mobile.position, 'relative');
        assert.ok(mobile.scrollY > 0);
        assert.ok(mobile.footerBottom <= mobile.viewport + 1);
        assert.equal(mobile.overflow, false);
        console.log('Mobile scrolling and footer:', mobile);
        // Use populated cards: empty placeholders cannot expose clipped weather or trains.
        await page.evaluate(() => {
            document.getElementById('temperature').textContent = '26°';
            document.getElementById('weatherDescription').textContent = '部分多雲';
            document.getElementById('todayRange').textContent = '22° — 28°';
            document.getElementById('humidity').textContent = '78%';
            document.getElementById('rainProbability').textContent = '35%';
            const trains = ['LOW', 'LMC', 'SHS'].map((dest, index) => ({ dest, ttnt: String(index * 4 + 2), valid: 'Y' }));
            renderTrains(trains, 'mtrUp', '往上水');
            renderTrains(trains.map(train => ({ ...train, dest: 'ADM' })), 'mtrDown', '往金鐘');
            renderForecast({ hourly: {
                time: Array.from({ length: 8 }, (_, index) => `2026-11-13T${String(index + 9).padStart(2, '0')}:00`),
                temperature_2m: Array(8).fill(26), weather_code: Array(8).fill(2), precipitation_probability: Array(8).fill(35)
            } }, 0);
            for (const id of ['nowNews', 'bbcNews']) renderNews(id, Array.from({ length: 30 }, (_, index) => ({ title: `新聞測試 ${index + 1}：今日最新消息`, link: 'https://example.com' })));
            showHKOPanel('hkoForecastPanel', 'hkoForecast', '本港今日部分時間有陽光，早晚清涼，日間溫暖。'.repeat(10));
            showHKOPanel('hkoSpecialPanel', 'hkoSpecial', '特別天氣提示，請留意最新天氣資訊。'.repeat(10));
        });
        for (const viewport of [
            { width: 1366, height: 768 }, { width: 768, height: 1024 },
            { width: 810, height: 1080 }, { width: 1080, height: 810 },
            { width: 810, height: 940 }, { width: 1080, height: 680 },
            { width: 768, height: 880 }, { width: 1024, height: 600 },
            { width: 820, height: 1024 }, { width: 1180, height: 690 },
            { width: 1024, height: 1366 }, { width: 1366, height: 900 }
        ]) {
            await page.setViewportSize(viewport);
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            const layout = await page.evaluate(() => ({
                width: innerWidth, height: innerHeight,
                overflow: document.documentElement.scrollWidth > innerWidth,
                footerBottom: document.querySelector('footer').getBoundingClientRect().bottom,
                pageScrolls: document.documentElement.scrollHeight > innerHeight + 1,
                bottomGap: innerHeight - document.querySelector('footer').getBoundingClientRect().bottom,
                dashboardBottom: document.querySelector('.dashboard').getBoundingClientRect().bottom,
                clipped: [...document.querySelectorAll('.card, .date-bubble, .train, .train-time, .train-destination, .forecast-item, .forecast-time, .forecast-icon, .forecast-temp, .forecast-rain, .weather-details, .weather-main, .digital-time, .analog-clock')].filter(element => {
                    const box = element.getBoundingClientRect();
                    if (box.top < -1 || box.bottom > innerHeight + 1 || box.left < -1 || box.right > innerWidth + 1) return true;
                    for (let parent = element.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
                        if (getComputedStyle(parent).overflow === 'hidden') {
                            const bounds = parent.getBoundingClientRect();
                            if (box.bottom > bounds.bottom + 1 || box.top < bounds.top - 1 || box.left < bounds.left - 1 || box.right > bounds.right + 1) return true;
                        }
                    }
                    return false;
                }).map(element => element.className)
            }));
            console.log('Desktop/tablet layout:', layout);
            assert.equal(layout.overflow, false);
            assert.equal(layout.pageScrolls, false);
            assert.ok(Math.abs(layout.dashboardBottom - layout.height) < 1);
            assert.ok(layout.bottomGap <= 12);
            assert.deepEqual(layout.clipped, []);
            assert.ok(layout.footerBottom <= layout.height + 1);
            if (process.env.QA_SCREENSHOTS && viewport.width === 1080 && viewport.height === 680) {
                await page.screenshot({ path: path.join(process.env.QA_SCREENSHOTS, 'ipad-landscape.png') });
            }
            if (process.env.QA_SCREENSHOTS && viewport.width === 810 && viewport.height === 940) {
                await page.screenshot({ path: path.join(process.env.QA_SCREENSHOTS, 'ipad-portrait.png') });
            }
        }
        await page.evaluate(() => {
            document.getElementById('hkoForecastPanel').classList.remove('hidden');
            document.getElementById('hkoSpecialPanel').classList.add('hidden');
        });
        const panel = await page.locator('.weather-hko-text').evaluate(element => ({
            height: element.clientHeight,
            panelHeight: document.getElementById('hkoForecastPanel').clientHeight
        }));
        assert.ok(Math.abs(panel.height - panel.panelHeight) < 2);
        assert.deepEqual(errors, []);
        console.log('Single weather panel fills available height; no page errors.');
        // Simulate Safari reporting a visible height different from CSS viewport units.
        await page.evaluate(() => {
            const viewport = new EventTarget();
            viewport.height = innerHeight - 100;
            viewport.scale = 1;
            Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
            window.dispatchEvent(new Event('resize'));
        });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        assert.ok(await page.evaluate(() => Math.abs(document.querySelector('.dashboard').getBoundingClientRect().height - visualViewport.height) < 1));
        await page.evaluate(() => {
            visualViewport.height = innerHeight;
            window.dispatchEvent(new Event('resize'));
        });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        assert.ok(await page.evaluate(() => Math.abs(document.querySelector('.dashboard').getBoundingClientRect().bottom - innerHeight) < 1));
        console.log('Safari viewport-height mismatch and restored height: passed.');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
