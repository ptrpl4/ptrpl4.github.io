/* Local time in Kuala Lumpur, so a reader can tell at a glance whether a reply
   is likely today. Computed in the visitor's own browser: GitHub exposes no
   timezone field, and Malaysia has never observed DST, so the zone is a
   constant and no network call is needed. There is no markup fallback: with JS
   off the span stays empty and the contact row simply has no clock. */
(function () {
    var clock = document.getElementById("cv-clock");
    if (!clock) return;

    function render() {
        try {
            var time = new Intl.DateTimeFormat("en-GB", {
                timeZone: "Asia/Kuala_Lumpur",
                hour: "2-digit",
                minute: "2-digit",
                hourCycle: "h23",
            }).format(new Date());
            var hour = parseInt(time, 10);
            clock.textContent = (hour >= 8 && hour < 22 ? "☀️ " : "🌙 ") +
                time + " here";
        } catch (e) {
            /* An Intl build without the tz database: the span stays empty. */
        }
    }

    render();
    /* Aligned to the boundary: a bare setInterval from load leaves the display
       up to 59s behind, permanently, on the one element meant to be current. */
    setTimeout(function () {
        render();
        setInterval(render, 60000);
    }, 60000 - (Date.now() % 60000));
})();
