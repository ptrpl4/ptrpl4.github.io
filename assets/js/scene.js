(function () {
    function createStars() {
        var el = document.getElementById("stars");
        var wrapper = document.querySelector(".space");
        if (!el || !wrapper) return;
        var w = wrapper.offsetWidth;
        var h = wrapper.offsetHeight;
        var shadows = [];
        for (var i = 0; i < 90; i++) {
            var x = Math.round(Math.random() * w);
            var y = Math.round(Math.random() * h);
            var a = (0.25 + Math.random() * 0.65).toFixed(2);
            shadows.push(x + "px " + y + "px 1px rgba(200,220,255," + a + ")");
        }
        el.style.boxShadow = shadows.join(",");
    }

    createStars();

    function setMoonPhase() {
        var el = document.getElementById("sky-object");
        if (!el) return;
        if (Math.random() < 0.15) {
            // Full moon
            el.style.setProperty("--crescent-opacity", "0");
        } else {
            // Random crescent: left 2px (thin sliver) to -38px (thick gibbous)
            var left = (2 - Math.random() * 40).toFixed(1);
            el.style.setProperty("--crescent-left", left + "px");
            el.style.setProperty("--crescent-opacity", "1");
        }
    }

    if (document.documentElement.getAttribute("data-theme") === "dark") {
        setMoonPhase();
    }

    // The two draws are held across calls so a resize re-solves the same
    // slot against new geometry instead of teleporting; reroll picks a new
    // one. angleSeed is a fraction of maxAngle, so the clamp still adapts.
    var angleSeed = Math.random() * 2 - 1;
    var distSeed  = Math.random();

    function placeSkyObject(animate, reroll) {
        if (reroll) {
            angleSeed = Math.random() * 2 - 1;
            distSeed  = Math.random();
        }

        var wrapper = document.querySelector(".space");
        var circle  = document.querySelector(".circle");
        var el      = document.getElementById("sky-object");
        if (!el || !wrapper || !circle) return;

        var wRect = wrapper.getBoundingClientRect();
        var cRect = circle.getBoundingClientRect();
        var ex = cRect.left - wRect.left + cRect.width  / 2;
        var ey = cRect.top  - wRect.top  + cRect.height / 2;
        var er = cRect.width / 2;

        var dist  = er * 1.45 + distSeed * er * 0.15;
        var skyR  = el.offsetWidth / 2 || 32;
        var maxX  = wRect.width / 2 - skyR - 8;
        var maxAngle = Math.min(70 * Math.PI / 180, Math.asin(Math.min(0.99, maxX / dist)));
        var angle = angleSeed * maxAngle;
        var x = ex + dist * Math.sin(angle);
        var y = ey - dist * Math.cos(angle);

        if (!animate) {
            el.style.transition = "none";
            el.style.left = x + "px";
            el.style.top  = y + "px";
            el.offsetHeight; // force reflow before restoring transition
            el.style.transition = "";
        } else {
            el.style.left = x + "px";
            el.style.top  = y + "px";
        }
    }

    placeSkyObject(false);

    // .space changes size on resize / device rotation, which would
    // strand the sky object at stale pixel coordinates — possibly
    // over Earth, where the crescent overlay stops matching --bg.
    var resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            placeSkyObject(false);
        }, 150);
    });

    // Runs after the head script's own toggle work. A toggle is the one
    // time the sky object rerolls to a new slot. silent is a prerendered
    // page catching up on activation: it should look like a cold load, so
    // the object is placed in its existing slot without animating.
    window.onThemeChange = function (next, opts) {
        var silent = opts && opts.silent;
        placeSkyObject(!silent, !silent);
        if (next === "dark") setMoonPhase();
    };
})();
