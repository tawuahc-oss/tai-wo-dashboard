// Safari can report a different visible height after its toolbars move.
// Measure the visible viewport instead of relying solely on CSS viewport units.
(() => {
    const root = document.documentElement;
    let framePending = false;

    function updateViewportHeight() {
        framePending = false;
        const viewport = window.visualViewport;
        // Keep the layout stable while the user pinch-zooms to read something.
        if (viewport && Math.abs(viewport.scale - 1) > 0.01) return;
        const height = viewport?.height || window.innerHeight;
        if (height > 0) root.style.setProperty('--dashboard-viewport-height', `${height}px`);
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
})();
