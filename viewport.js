// Safari can report a different visible height after its toolbars move.
// Measure the visible viewport instead of relying solely on CSS viewport units.
(() => {
    const root = document.documentElement;
    let framePending = false;
    let diagnostic = null;

    function updateDiagnostic() {
        if (!diagnostic) return;
        const dashboard = document.querySelector('.dashboard')?.getBoundingClientRect();
        const news = document.querySelector('.news-grid')?.getBoundingClientRect();
        const viewport = window.visualViewport;
        diagnostic.textContent = `版面檢查 20261113-weather-backup\n畫面 ${window.innerWidth} × ${window.innerHeight} / 可見 ${Math.round(viewport?.height || 0)} / 縮放 ${viewport?.scale || 1}\n版面底 ${Math.round(dashboard?.bottom || 0)} / 新聞底 ${Math.round(news?.bottom || 0)}`;
    }

    function updateViewportHeight() {
        framePending = false;
        const viewport = window.visualViewport;
        // Keep the layout stable while the user pinch-zooms to read something.
        if (viewport && Math.abs(viewport.scale - 1) > 0.01) return;
        const height = viewport?.height || window.innerHeight;
        if (height > 0) root.style.setProperty('--dashboard-viewport-height', `${height}px`);
        updateDiagnostic();
    }

    function scheduleUpdate() {
        if (framePending) return;
        framePending = true;
        window.requestAnimationFrame(updateViewportHeight);
    }

    updateViewportHeight();
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('orientationchange', scheduleUpdate);
    window.addEventListener('pageshow', scheduleUpdate);
    window.visualViewport?.addEventListener('resize', scheduleUpdate);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) scheduleUpdate();
    });
    if (window.location?.search.includes('layoutcheck=1')) {
        document.addEventListener('DOMContentLoaded', () => {
            diagnostic = document.createElement('div');
            diagnostic.style.cssText = 'position:fixed;right:6px;bottom:6px;z-index:9999;max-width:95vw;padding:6px 9px;background:#242424;color:white;font:12px/1.4 monospace;white-space:pre-wrap;pointer-events:none;border-radius:6px';
            document.body.appendChild(diagnostic);
            updateDiagnostic();
        });
    }
})();
