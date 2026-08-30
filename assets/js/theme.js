// Loaded synchronously from every <head>, after the stylesheet. Synchronous and
// in <head> so data-theme is set before first paint; after the <link> so the
// CSSOM is populated when syncThemeColor reads --bg. All three matter.
(function () {
    // Storage can be refused, not just empty (Safari with cookies blocked). An
    // uncaught SecurityError here would abort the file and take the listener
    // below with it, leaving a dead button.
    function readTheme() {
        try { return localStorage.getItem("theme"); } catch (e) { return null; }
    }
    function saveTheme(next) {
        try { localStorage.setItem("theme", next); } catch (e) {}
    }

    var html = document.documentElement;
    var saved = readTheme();
    if (saved === "light" || saved === "dark") html.setAttribute("data-theme", saved);

    // Created here, not written into each page: --bg differs between landing and
    // text pages, and a literal in markup would be a second copy of it. Chrome
    // follows the toggle, never the OS — no prefers-color-scheme, no media pairs.
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "theme-color");
        document.head.appendChild(meta);
    }
    window.syncThemeColor = function () {
        // --bg is declared only on html-level selectors, so it resolves here
        // even though <body> is not parsed yet.
        var bg = getComputedStyle(html).getPropertyValue("--bg").trim();
        if (bg) meta.setAttribute("content", bg);
    };
    syncThemeColor();

    // Delegated because #theme-toggle is not parsed yet; closest() rather than
    // an id test on e.target, which breaks if the button gains a child.
    document.addEventListener("click", function (e) {
        var t = e.target;
        if (!t || !t.closest || !t.closest("#theme-toggle")) return;
        var next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", next);
        saveTheme(next);
        syncThemeColor();
        if (window.onThemeChange) window.onThemeChange(next);
    });
})();
