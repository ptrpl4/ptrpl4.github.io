// Loaded synchronously from every <head>, after the stylesheet. Synchronous and
// in <head> so data-theme is set before first paint; after the <link> so the
// CSSOM is populated when syncThemeColor reads --bg. All three matter.
(function () {
    // sessionStorage, not localStorage: it is per-tab, so a new tab starts from
    // the system theme while a toggle still survives navigation within the tab.
    // Access can be refused outright (Safari with cookies blocked); an uncaught
    // SecurityError here would take the listeners below with it.
    function readTheme() {
        try { return sessionStorage.getItem("theme"); } catch (e) { return null; }
    }
    function saveTheme(next) {
        try { sessionStorage.setItem("theme", next); } catch (e) {}
    }

    var html = document.documentElement;
    var mql = window.matchMedia ? matchMedia("(prefers-color-scheme: light)") : null;
    var saved = readTheme();

    // The OS decides until this tab makes a choice, which then holds.
    html.setAttribute("data-theme",
        saved === "light" || saved === "dark" ? saved : (mql && mql.matches ? "light" : "dark"));

    // Created here, not written into each page: --bg differs between landing and
    // text pages, and a literal in markup would be a second copy of it. Never a
    // media-keyed pair — the meta must track the theme actually applied.
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

    // Follow the OS live, but only while this tab has made no choice of its own.
    if (mql && mql.addEventListener) {
        mql.addEventListener("change", function (e) {
            if (readTheme()) return;
            html.setAttribute("data-theme", e.matches ? "light" : "dark");
            syncThemeColor();
            if (window.onThemeChange) window.onThemeChange(html.getAttribute("data-theme"));
        });
    }

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
