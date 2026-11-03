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

    // One copy for every page, inserted here because each <head> already loads
    // this script. Same-origin links prerender on hover; /projects/ is only
    // prefetched, since prerendering it spends a GitHub API call (60/h per IP)
    // on every hover, clicked or not. Exclude any other API-backed page here.
    if (window.HTMLScriptElement && HTMLScriptElement.supports &&
        HTMLScriptElement.supports("speculationrules")) {
        var rules = document.createElement("script");
        rules.type = "speculationrules";
        rules.textContent = JSON.stringify({
            prerender: [{
                where: { and: [{ href_matches: "/*" }, { not: { href_matches: "/projects/" } }] },
                eagerness: "moderate",
            }],
            prefetch: [{ where: { href_matches: "/projects/" }, eagerness: "moderate" }],
        });
        document.head.appendChild(rules);
    }

    // A prerendered page runs ahead of the visit. html.prerendering (main.css)
    // holds animations at frame zero, so one-shot intros play on arrival rather
    // than unseen before it, and turns transitions off. On activation the theme
    // is re-read, since a toggle on the referring page may have come after the
    // prerender started; Chrome hands over the initiator's sessionStorage at
    // that point. The class is still on while the theme changes, so the page
    // arrives painted in the right theme instead of fading into it, the way a
    // cold load would.
    if (document.prerendering) {
        html.classList.add("prerendering");
        document.addEventListener("prerenderingchange", function () {
            var s = readTheme();
            if ((s === "light" || s === "dark") && s !== html.getAttribute("data-theme")) {
                html.setAttribute("data-theme", s);
                syncThemeColor();
                // silent: re-place without the toggle's animated reroll.
                if (window.onThemeChange) window.onThemeChange(s, { silent: true });
            }
            html.offsetHeight; // flush styles with transitions still off
            html.classList.remove("prerendering");
        }, { once: true });
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
