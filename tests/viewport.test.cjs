const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function viewportApp(hasVisualViewport = true) {
    const properties = new Map();
    const frames = [];
    function target(extra = {}) {
        const listeners = new Map();
        return { ...extra, addEventListener(type, listener) { listeners.set(type, listener); },
            emit(type) { listeners.get(type)?.(); } };
    }
    const viewport = target({ height: 680, scale: 1 });
    const window = target({ innerHeight: 600, visualViewport: hasVisualViewport ? viewport : null,
        requestAnimationFrame(callback) { frames.push(callback); } });
    const document = target({ hidden: false,
        documentElement: { style: { setProperty(name, value) { properties.set(name, value); } } } });
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../viewport.js'), 'utf8'), { window, document });
    return { window, document, viewport,
        height: () => properties.get('--dashboard-viewport-height'),
        flush() { while (frames.length) frames.shift()(); } };
}

test('initial layout uses the actual visible height', () => {
    assert.equal(viewportApp().height(), '680px');
});

test('layout fills the extra space when Safari toolbars collapse', () => {
    const app = viewportApp();
    app.viewport.height = 810;
    app.viewport.emit('resize');
    app.flush();
    assert.equal(app.height(), '810px');
});

test('layout shrinks when toolbars return without overflowing', () => {
    const app = viewportApp();
    app.viewport.height = 600;
    app.viewport.emit('resize');
    app.flush();
    assert.equal(app.height(), '600px');
});

test('restored pages remeasure their height', () => {
    const app = viewportApp();
    app.viewport.height = 940;
    app.window.emit('pageshow');
    app.flush();
    assert.equal(app.height(), '940px');
});

test('pinch zoom does not shrink the dashboard layout', () => {
    const app = viewportApp();
    app.viewport.height = 340;
    app.viewport.scale = 2;
    app.viewport.emit('resize');
    app.flush();
    assert.equal(app.height(), '680px');
});

test('older browsers fall back to window height and respond to rotation', () => {
    const app = viewportApp(false);
    assert.equal(app.height(), '600px');
    app.window.innerHeight = 900;
    app.window.emit('orientationchange');
    app.flush();
    assert.equal(app.height(), '900px');
});
