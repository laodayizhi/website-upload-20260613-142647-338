(function () {
    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return "" +
            "<article class=\"movie-card\">" +
                "<a class=\"movie-link\" href=\"" + escapeHtml(movie.url) + "\">" +
                    "<div class=\"movie-poster\">" +
                        "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                        "<span class=\"movie-badge\">" + escapeHtml(movie.type) + "</span>" +
                        "<span class=\"movie-play\">▶</span>" +
                    "</div>" +
                    "<div class=\"movie-body\">" +
                        "<div class=\"movie-meta-row\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>" +
                        "<h3>" + escapeHtml(movie.title) + "</h3>" +
                        "<p>" + escapeHtml(movie.description) + "</p>" +
                        "<div class=\"tag-list\">" + tags + "</div>" +
                    "</div>" +
                "</a>" +
            "</article>";
    }

    function runSearch(query) {
        var source = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];
        var lowered = query.trim().toLowerCase();

        if (!lowered) {
            return [];
        }

        return source.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.description,
                movie.region,
                movie.year,
                movie.type,
                movie.genre,
                (movie.tags || []).join(" ")
            ].join(" ").toLowerCase();
            return haystack.indexOf(lowered) !== -1;
        }).slice(0, 120);
    }

    function render() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var input = document.getElementById("search-input");
        var results = document.getElementById("search-results");
        var empty = document.getElementById("search-empty");

        if (input) {
            input.value = query;
        }

        if (!results || !empty) {
            return;
        }

        var matches = runSearch(query);
        results.innerHTML = matches.map(card).join("");
        empty.style.display = matches.length ? "none" : "block";
    }

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("search-form");

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = document.getElementById("search-input");
                var query = input ? input.value.trim() : "";
                var url = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
                window.location.href = url;
            });
        }

        render();
    });
})();
