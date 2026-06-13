(function () {
    'use strict';

    function getRoot() {
        return document.body ? (document.body.getAttribute('data-root') || './') : './';
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var isHidden = panel.hasAttribute('hidden');
            if (isHidden) {
                panel.removeAttribute('hidden');
                button.setAttribute('aria-expanded', 'true');
                button.textContent = '×';
            } else {
                panel.setAttribute('hidden', '');
                button.setAttribute('aria-expanded', 'false');
                button.textContent = '☰';
            }
        });
    }

    function setupHeroCarousel() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                start();
            });
        });

        var hero = document.querySelector('.hero-section');
        if (hero) {
            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
        }
        start();
    }

    function setupCardFilters() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll('.filter-button'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-category]'));
        if (!buttons.length || !cards.length) {
            return;
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var filter = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                cards.forEach(function (card) {
                    var category = card.getAttribute('data-category') || '';
                    var hidden = filter !== 'all' && category !== filter;
                    card.classList.toggle('is-hidden-by-filter', hidden);
                });
            });
        });
    }

    function movieMatches(movie, query) {
        var text = [
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.category,
            movie.oneLine
        ].join(' ');
        return normalize(text).indexOf(query) !== -1;
    }

    function renderSearchResults(query) {
        var panel = document.querySelector('.search-panel');
        var results = document.querySelector('.search-results');
        var movies = window.MOVIE_SEARCH_DATA || [];
        var root = getRoot();
        if (!panel || !results) {
            return;
        }
        results.innerHTML = '';
        if (!query) {
            panel.setAttribute('hidden', '');
            return;
        }
        var matches = movies.filter(function (movie) {
            return movieMatches(movie, query);
        }).slice(0, 60);
        if (!matches.length) {
            results.innerHTML = '<div class="empty-state">没有找到匹配影片，请尝试更换关键词。</div>';
        } else {
            matches.forEach(function (movie) {
                var item = document.createElement('a');
                item.className = 'search-result-item';
                item.href = root + movie.url;
                item.innerHTML = '<img src="' + root + movie.cover + '" alt="">' +
                    '<div><strong>' + movie.title + '</strong>' +
                    '<p>' + movie.region + ' · ' + movie.year + ' · ' + movie.genre + '</p>' +
                    '<p>' + movie.oneLine + '</p></div>';
                results.appendChild(item);
            });
        }
        panel.removeAttribute('hidden');
    }

    function setupSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('.site-search-form'));
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));
        var close = document.querySelector('.search-panel-close');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('.site-search-input');
                renderSearchResults(normalize(input ? input.value : ''));
            });
        });
        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                var query = normalize(input.value);
                if (query.length >= 1) {
                    renderSearchResults(query);
                }
            });
        });
        if (close) {
            close.addEventListener('click', function () {
                var panel = document.querySelector('.search-panel');
                if (panel) {
                    panel.setAttribute('hidden', '');
                }
            });
        }
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                var panel = document.querySelector('.search-panel');
                if (panel) {
                    panel.setAttribute('hidden', '');
                }
            }
        });
    }

    function setupLocalGridSearch() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.all-movie-grid .movie-card'));
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));
        if (!cards.length || !inputs.length) {
            return;
        }
        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                var query = normalize(input.value);
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre')
                    ].join(' ');
                    var hidden = query && normalize(text).indexOf(query) === -1;
                    card.classList.toggle('is-hidden-by-search', hidden);
                });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupCardFilters();
        setupSearch();
        setupLocalGridSearch();
    });
}());
