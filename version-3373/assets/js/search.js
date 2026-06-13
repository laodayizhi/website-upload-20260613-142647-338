(function () {
    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function card(movie) {
        return '' +
            '<article class="movie-card">' +
                '<a href="' + movie.url + '" class="movie-card-link" aria-label="观看' + escapeHtml(movie.title) + '">' +
                    '<div class="card-image">' +
                        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                        '<span class="card-category">' + escapeHtml(movie.category) + '</span>' +
                        '<span class="card-year">' + escapeHtml(movie.year) + '年</span>' +
                    '</div>' +
                    '<div class="card-body">' +
                        '<h3>' + escapeHtml(movie.title) + '</h3>' +
                        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                        '<div class="card-meta">' +
                            '<span>' + escapeHtml(movie.region) + '</span>' +
                            '<span>' + escapeHtml(movie.type) + '</span>' +
                        '</div>' +
                    '</div>' +
                '</a>' +
            '</article>';
    }

    function runSearch(movies) {
        var params = new URLSearchParams(window.location.search);
        var q = normalize(params.get('q'));
        var title = document.getElementById('search-title');
        var summary = document.getElementById('search-summary');
        var results = document.getElementById('search-results');
        var empty = document.getElementById('search-empty');
        var input = document.getElementById('search-page-input');

        if (input) {
            input.value = params.get('q') || '';
        }
        if (!results) {
            return;
        }

        if (!q) {
            if (title) {
                title.textContent = '推荐内容';
            }
            if (summary) {
                summary.textContent = '未输入关键词时展示部分推荐影片。';
            }
            return;
        }

        var matched = movies.filter(function (movie) {
            return normalize(movie.search).indexOf(q) !== -1;
        });

        if (title) {
            title.textContent = '搜索结果';
        }
        if (summary) {
            summary.textContent = '关键词“' + (params.get('q') || '') + '”找到 ' + matched.length + ' 部相关影片。';
        }

        if (matched.length) {
            results.innerHTML = matched.slice(0, 200).map(card).join('');
            if (empty) {
                empty.hidden = true;
            }
        } else {
            results.innerHTML = '';
            if (empty) {
                empty.hidden = false;
            }
        }
    }

    fetch('assets/data/movie-index.json')
        .then(function (response) {
            return response.json();
        })
        .then(runSearch)
        .catch(function () {
            var summary = document.getElementById('search-summary');
            if (summary) {
                summary.textContent = '搜索索引加载失败，请直接进入全部影片页浏览。';
            }
        });
})();
