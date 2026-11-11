// Optional browser check: install Playwright and run with NODE_PATH pointing to it.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('https://**/*', route => route.abort());
        await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
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
        for (const viewport of [{ width: 1366, height: 768 }, { width: 768, height: 1024 }]) {
            await page.setViewportSize(viewport);
            const layout = await page.evaluate(() => ({
                width: innerWidth, height: innerHeight,
                overflow: document.documentElement.scrollWidth > innerWidth,
                footerBottom: document.querySelector('footer').getBoundingClientRect().bottom
            }));
            assert.equal(layout.overflow, false);
            assert.ok(layout.footerBottom <= layout.height + 1);
            console.log('Desktop/tablet layout:', layout);
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
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
