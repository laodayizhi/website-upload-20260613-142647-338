(function () {
    var mobileButton = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('open');
            mobileButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dotsContainer = hero.querySelector('[data-hero-dots]');
        var backdrop = hero.querySelector('[data-hero-backdrop]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            if (dotsContainer) {
                Array.prototype.slice.call(dotsContainer.children).forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === index);
                });
            }

            var activeSlide = slides[index];
            if (activeSlide && activeSlide.dataset.bg) {
                var imageValue = "url('" + activeSlide.dataset.bg + "')";
                hero.style.setProperty('--hero-image', imageValue);
                if (backdrop) {
                    backdrop.style.backgroundImage = imageValue;
                }
            }
        }

        function startHero() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5200);
        }

        if (dotsContainer && slides.length > 1) {
            slides.forEach(function (_, index) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'hero-dot' + (index === 0 ? ' active' : '');
                dot.setAttribute('aria-label', '切换推荐 ' + (index + 1));
                dot.addEventListener('click', function () {
                    showSlide(index);
                });
                dotsContainer.appendChild(dot);
            });
        }

        showSlide(0);
        startHero();
    }

    function applyFilter(targetId) {
        var target = document.getElementById(targetId);
        if (!target) {
            return;
        }

        var searchInput = document.querySelector('[data-site-search][data-target="' + targetId + '"]');
        var yearFilter = document.querySelector('[data-year-filter][data-target="' + targetId + '"]');
        var regionFilter = document.querySelector('[data-region-filter][data-target="' + targetId + '"]');
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var selectedYear = yearFilter ? yearFilter.value : '';
        var selectedRegion = regionFilter ? regionFilter.value : '';
        var cards = Array.prototype.slice.call(target.querySelectorAll('[data-card]'));

        cards.forEach(function (card) {
            var text = [
                card.dataset.title || '',
                card.dataset.year || '',
                card.dataset.region || '',
                card.dataset.genre || '',
                card.dataset.category || ''
            ].join(' ').toLowerCase();
            var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchesYear = !selectedYear || card.dataset.year === selectedYear;
            var matchesRegion = !selectedRegion || card.dataset.region === selectedRegion;
            card.classList.toggle('is-hidden', !(matchesKeyword && matchesYear && matchesRegion));
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-site-search]')).forEach(function (input) {
        var targetId = input.dataset.target;
        input.addEventListener('input', function () {
            applyFilter(targetId);
        });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-year-filter], [data-region-filter]')).forEach(function (select) {
        var targetId = select.dataset.target;
        select.addEventListener('change', function () {
            applyFilter(targetId);
        });
    });

    var urlSearch = new URLSearchParams(window.location.search);
    var query = urlSearch.get('q');
    if (query) {
        Array.prototype.slice.call(document.querySelectorAll('[data-site-search]')).forEach(function (input) {
            input.value = query;
            applyFilter(input.dataset.target);
        });
    }

    function attachVideo(video, source) {
        if (!video || !source) {
            return null;
        }

        if (video.hlsInstance) {
            video.hlsInstance.destroy();
            video.hlsInstance = null;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsInstance = hls;
            return hls;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return null;
        }

        video.src = source;
        return null;
    }

    Array.prototype.slice.call(document.querySelectorAll('.movie-video')).forEach(function (video) {
        var initialSource = video.dataset.videoSrc;
        attachVideo(video, initialSource);

        var shell = video.closest('.player-section');
        if (!shell) {
            return;
        }

        var playButton = shell.querySelector('[data-play-button]');
        var sourceButtons = Array.prototype.slice.call(shell.querySelectorAll('[data-source-button]'));

        function playCurrentVideo() {
            attachVideo(video, video.dataset.videoSrc || initialSource);
            var playResult = video.play();
            if (playResult && typeof playResult.then === 'function') {
                playResult.catch(function () {});
            }
            if (playButton) {
                playButton.classList.add('is-playing');
                playButton.textContent = '播放中';
            }
        }

        if (playButton) {
            playButton.addEventListener('click', playCurrentVideo);
        }

        video.addEventListener('play', function () {
            if (playButton) {
                playButton.classList.add('is-playing');
            }
        });

        video.addEventListener('pause', function () {
            if (playButton) {
                playButton.classList.remove('is-playing');
                playButton.textContent = '继续播放';
            }
        });

        sourceButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                sourceButtons.forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                video.dataset.videoSrc = button.dataset.videoSrc;
                attachVideo(video, video.dataset.videoSrc);
                playCurrentVideo();
            });
        });
    });
})();
