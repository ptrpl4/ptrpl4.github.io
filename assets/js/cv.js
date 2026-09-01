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
            /* Kuala Lumpur is 3°N, so sunrise and sunset barely move across the
               year — about 07:00 and 19:20, give or take a quarter hour. Fixed
               boundaries are accurate here in a way they would not be at a
               higher latitude, and with no DST they stay accurate. */
            var minutes = parseInt(time, 10) * 60 + parseInt(time.slice(3), 10);
            var daylight = minutes >= 7 * 60 && minutes < 19 * 60 + 30;
            clock.textContent = (daylight ? "☀️ " : "🌙 ") + time + " here";
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
