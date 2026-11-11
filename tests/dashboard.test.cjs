const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');

function dashboard(instant = '2026-02-17T04:00:00Z') {
    let current = instant;
    const elements = new Map();
    function element() {
        return {
            textContent: '', style: {}, children: [], parentElement: {},
            classList: { add() {}, remove() {}, contains() { return false; } },
            appendChild(child) { this.children.push(child); },
            addEventListener() {}, closest() { return null; },
            set innerHTML(value) { this.markup = value; this.children = []; },
            get innerHTML() { return this.markup || ''; }
        };
    }
    class FakeDate extends Date {
        constructor(...args) { super(...(args.length ? args : [current])); }
    }
    const context = {
        Date: FakeDate, Intl, AbortController, setTimeout, clearTimeout,
        setInterval() {}, navigator: {}, console: { error() {}, warn() {} },
        fetch: async () => { throw new Error('Offline'); },
        document: {
            addEventListener() {}, createElement: element,
            getElementById(id) {
                if (!elements.has(id)) elements.set(id, element());
                return elements.get(id);
            }
        }
    };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(root, 'holidays.js'), 'utf8'), context);
    vm.runInContext(fs.readFileSync(path.join(root, 'script.js'), 'utf8'), context);
    return { context, elements, setDate(value) { current = value; } };
}

test('offline calendar includes Lunar New Year and tomorrow', async () => {
    const { context, elements } = dashboard();
    await context.loadCalendar();
    assert.equal(elements.get('calendarToday').children[0].textContent, '農曆年初一');
    assert.equal(elements.get('calendarTomorrow').children[0].textContent, '農曆年初二');
});

test('calendar rolls over automatically at Hong Kong midnight', async () => {
    const app = dashboard('2026-02-16T15:59:59Z');
    await app.context.loadCalendar();
    app.setDate('2026-02-16T16:00:01Z');
    app.context.refreshCalendarIfNeeded();
    assert.equal(app.elements.get('calendarToday').children[0].textContent, '農曆年初一');
});

test('Hong Kong date handles year boundaries independently of device timezone', async () => {
    const { context, elements } = dashboard('2026-12-31T16:30:00Z');
    assert.equal(context.hongKongDateKey(), '2027-01-01');
    await context.loadCalendar();
    assert.equal(elements.get('calendarToday').children[0].textContent, '一月一日');
});

test('uncovered years show a data warning rather than claiming no holiday', async () => {
    const { context, elements } = dashboard('2030-02-01T04:00:00Z');
    await context.loadCalendar();
    assert.match(elements.get('calendarToday').children[0].textContent, /未涵蓋/);
});

test('MTR destination is rendered as a Chinese name using text nodes', () => {
    const { context, elements } = dashboard();
    context.renderTrains([{ valid: 'Y', ttnt: '5', dest: 'LOW' }], 'mtrUp', '往上水');
    const row = elements.get('mtrUp').children[0];
    assert.equal(row.children[0].textContent, '5 min');
    assert.equal(row.children[1].textContent, '羅湖');
    assert.equal(context.trainDestination('LMC'), '落馬洲');
    assert.equal(context.trainDestination('ADM'), '金鐘');
});

test('request timeout aborts a stalled connection', async () => {
    const { context } = dashboard();
    context.fetch = (_, { signal }) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')));
    });
    await assert.rejects(context.fetchResource('test', 'json', 15), /aborted/);
});

test('timeout also covers a stalled response body', async () => {
    const { context } = dashboard();
    context.fetch = async (_, { signal }) => ({
        ok: true, json: () => new Promise((resolve, reject) => {
            signal.addEventListener('abort', () => reject(new Error('body aborted')));
        })
    });
    await assert.rejects(context.fetchResource('test', 'json', 15), /body aborted/);
});

test('RSS switches to the working fallback after a timeout', async () => {
    const { context } = dashboard();
    const fetchResource = context.fetchResource;
    context.fetchResource = (url, type) => fetchResource(url, type, 15);
    context.fetch = (url, { signal }) => {
        if (url.includes('corsproxy')) return new Promise((resolve, reject) => {
            signal.addEventListener('abort', () => reject(new Error('aborted')));
        });
        return Promise.resolve({ ok: true, json: async () => ({ status: 'ok', items: [{ title: '後備新聞' }] }) });
    };
    const items = await context.getRSS('https://example.com/feed');
    assert.equal(items[0].title, '後備新聞');
});

test('invalid remote holiday data preserves the bundled holidays', async () => {
    const { context, elements } = dashboard();
    context.fetch = async () => ({ ok: true, json: async () => ({ vcalendar: [{ vevent: [] }] }) });
    await context.updateHolidays();
    await context.loadCalendar();
    assert.equal(elements.get('calendarToday').children[0].textContent, '農曆年初一');
});

test('weather renders through the shared timeout helper', async () => {
    const { context, elements } = dashboard();
    context.fetch = async url => ({ ok: true, json: async () => url.includes('open-meteo') ? {
        current: { weather_code: 0, temperature_2m: 23.4, relative_humidity_2m: 70 },
        daily: { temperature_2m_min: [20], temperature_2m_max: [25] },
        hourly: { time: Array.from({ length: 48 }, (_, i) => `2026-02-${17 + Math.floor(i / 24)}T${String(i % 24).padStart(2, '0')}:00`),
            temperature_2m: Array(48).fill(23), weather_code: Array(48).fill(0), precipitation_probability: Array(48).fill(10) }
    } : {} });
    await context.loadWeather();
    assert.equal(elements.get('temperature').textContent, '23°');
    assert.equal(elements.get('forecast').children.length, 8);
});

test('refresh button recovers after all loaders fail', async () => {
    const { context, elements } = dashboard();
    for (const loader of ['loadWeather', 'loadMTR', 'loadNowNews', 'loadBBCNews', 'loadCalendar']) {
        context[loader] = async () => { throw new Error('Offline'); };
    }
    context.setTimeout = callback => callback();
    await context.refreshDashboard();
    assert.equal(elements.get('refreshButton').disabled, false);
});
