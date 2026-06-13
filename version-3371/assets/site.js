(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMobileMenu() {
        var button = document.getElementById('mobileMenuButton');
        var panel = document.getElementById('mobilePanel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
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

        function start() {
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
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var input = document.querySelector('[data-filter-input]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var typeSelect = document.querySelector('[data-type-filter]');
        var scope = document.querySelector('[data-filter-scope]');
        if (!scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');
            var type = normalize(typeSelect ? typeSelect.value : '');
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedYear = !year || normalize(card.dataset.year) === year;
                var matchedType = !type || normalize(card.dataset.type) === type;
                card.classList.toggle('is-hidden', !(matchedQuery && matchedYear && matchedType));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', apply);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', apply);
        }
        apply();
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
    });
})();

window.setupMoviePlayer = function (streamUrl, videoId, coverId) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hlsInstance = null;
    var loaded = false;

    if (!video) {
        return;
    }

    function attach() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return;
        }
        video.src = streamUrl;
    }

    function play() {
        attach();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    if (cover) {
        cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
};
