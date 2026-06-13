(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                play();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    function initFilters() {
        var form = document.querySelector('.js-filter-form');
        var scope = document.querySelector('[data-filter-scope]');
        if (!form || !scope) {
            return;
        }
        var keywordInput = form.querySelector('[data-filter-keyword]');
        var yearSelect = form.querySelector('[data-filter-year]');
        var regionSelect = form.querySelector('[data-filter-region]');
        var typeSelect = form.querySelector('[data-filter-type]');
        var countNode = document.querySelector('[data-filter-count]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-filterable'));

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardType = normalize(card.getAttribute('data-type'));
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                if (region && cardRegion !== region) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = '当前显示 ' + visible + ' 部影片，共 ' + cards.length + ' 部。';
            }
        }

        form.addEventListener('input', apply);
        form.addEventListener('change', apply);
        form.addEventListener('reset', function () {
            window.setTimeout(apply, 0);
        });
        apply();
    }

    function fillSearchInputs() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        document.querySelectorAll('input[name="q"]').forEach(function (input) {
            if (!input.value) {
                input.value = q;
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        fillSearchInputs();
    });
})();
