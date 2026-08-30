// ROT13 is its own inverse, so the same pass encodes and decodes.
(function () {
    var a = document.getElementById("contact");
    if (!a) return;
    a.href = "mailto:" + a.getAttribute("data-c").replace(/[a-z]/gi, function (ch) {
        var base = ch < "a" ? 65 : 97;
        return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
    });
})();
