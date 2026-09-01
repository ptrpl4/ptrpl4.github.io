(function () {
    var list = document.getElementById("project-list");
    var status = document.getElementById("status");

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    // API strings are rendered as text, never markup; hrefs are
    // restricted to http(s) so a repo `homepage` cannot smuggle in
    // a javascript: URL.
    function link(className, text, url) {
        var a = el("a", className, text);
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener";
        return a;
    }

    function safeUrl(url) {
        if (!url) return null;
        var s = String(url).trim();
        if (/^https?:\/\//i.test(s)) return s;
        // Bare host, optionally with port, then a path/query/fragment
        // or nothing. The lookahead is what rejects `foo.bar:evil` —
        // a scheme can only follow the TLD as `:<digits>`.
        if (/^[\w.-]+\.[a-z]{2,}(?::\d+)?(?=[/?#]|$)/i.test(s)) return "https://" + s;
        return null;
    }

    function fallbackNote(leading) {
        var p = el("p", null, leading);
        p.id = "status";
        p.appendChild(link(null, "GitHub ↗", "https://github.com/ptrpl4"));
        p.appendChild(document.createTextNode("."));
        return p;
    }

    fetch("https://api.github.com/users/ptrpl4/repos?type=public&sort=updated&per_page=100")
        .then(function (res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(function (repos) {
            status.remove();

            var cutoff = new Date();
            cutoff.setFullYear(cutoff.getFullYear() - 2);

            var recent = repos.filter(function (r) {
                return !r.archived && new Date(r.pushed_at) >= cutoff;
            });

            if (recent.length === 0) {
                list.appendChild(fallbackNote("Nothing active right now. Older and archived work is on "));
                return;
            }

            recent.forEach(function (repo) {
                var item = el("div", "project-item");

                var url = safeUrl(repo.html_url);
                item.appendChild(
                    url
                        ? link("project-name", repo.name, url)
                        : el("span", "project-name", repo.name)
                );

                var home = safeUrl(repo.homepage);
                if (home) {
                    item.appendChild(document.createTextNode(" "));
                    item.appendChild(link("project-live", "live ↗", home));
                }

                if (repo.description) {
                    item.appendChild(el("p", "project-desc", repo.description));
                }

                var meta = [];
                if (repo.language) meta.push(repo.language);
                if (repo.stargazers_count > 0) meta.push("★ " + repo.stargazers_count);
                if (repo.license && repo.license.spdx_id && repo.license.spdx_id !== "NOASSERTION") meta.push(repo.license.spdx_id);

                if (meta.length) {
                    var metaRow = el("div", "project-meta");
                    meta.forEach(function (m) {
                        metaRow.appendChild(el("span", null, m));
                    });
                    item.appendChild(metaRow);
                }

                list.appendChild(item);
            });

            var footer = fallbackNote("All repositories on ");
            footer.style.marginTop = "2em";
            list.appendChild(footer);
        })
        .catch(function () {
            // A throw mid-render would leave partial rows above this, and
            // two nodes would share id="status". Clearing is safe: the list
            // holds only the placeholder and JS-rendered rows.
            list.textContent = "";
            status.textContent = "Could not load projects. View them on ";
            status.appendChild(link(null, "GitHub ↗", "https://github.com/ptrpl4"));
            status.appendChild(document.createTextNode("."));
            list.appendChild(status);
        });
})();
