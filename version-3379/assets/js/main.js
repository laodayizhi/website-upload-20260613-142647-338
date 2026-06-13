(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMobileNavigation();
    initHeroCarousel();
    initFilters();
    initQueryFromUrl();
    initPlayer();
  });

  function initMobileNavigation() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.nav-panel');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', String(isOpen));
      button.textContent = isOpen ? '×' : '☰';
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function initQueryFromUrl() {
    var searchInput = document.querySelector('[data-filter-search]');

    if (!searchInput) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      searchInput.value = query;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    if (!panel || !cards.length) {
      return;
    }

    var search = panel.querySelector('[data-filter-search]');
    var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-field]'));
    var reset = panel.querySelector('[data-filter-reset]');
    var result = panel.querySelector('[data-filter-result]');
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function yearMatches(cardYear, range) {
      if (!range) {
        return true;
      }

      var year = parseInt(cardYear, 10);
      var parts = range.split('-').map(function (part) {
        return parseInt(part, 10);
      });

      if (!year || parts.length !== 2) {
        return true;
      }

      return year >= parts[0] && year <= parts[1];
    }

    function apply() {
      var query = normalize(search ? search.value : '');
      var activeFilters = {};
      var visible = 0;

      selects.forEach(function (select) {
        activeFilters[select.getAttribute('data-filter-field')] = select.value;
      });

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' '));

        var matches = !query || haystack.indexOf(query) !== -1;

        Object.keys(activeFilters).forEach(function (field) {
          var value = activeFilters[field];

          if (!value || !matches) {
            return;
          }

          if (field === 'year-range') {
            matches = yearMatches(card.getAttribute('data-year'), value);
          } else {
            matches = normalize(card.getAttribute('data-' + field)) === normalize(value);
          }
        });

        card.classList.toggle('hidden-by-filter', !matches);

        if (matches) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = '当前显示 ' + visible + ' 部影片 / 共 ' + cards.length + ' 部';
      }

      if (emptyState) {
        emptyState.classList.toggle('visible', visible === 0);
      }
    }

    if (search) {
      search.addEventListener('input', apply);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (search) {
          search.value = '';
        }

        selects.forEach(function (select) {
          select.value = '';
        });

        apply();
      });
    }

    apply();
  }

  function initPlayer() {
    var shell = document.querySelector('[data-player-shell]');

    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var cover = shell.querySelector('[data-player-cover]');
    var button = shell.querySelector('[data-player-start]');
    var note = shell.querySelector('[data-player-note]');
    var source = video ? video.getAttribute('data-src') : '';
    var hlsInstance = null;
    var loaded = false;

    function setNote(message) {
      if (note) {
        note.textContent = message;
      }
    }

    function attachSource() {
      if (!video || !source || loaded) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setNote('播放源已加载，正在使用 HLS 播放。');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setNote('播放源连接异常，请刷新页面后重试。');
            if (hlsInstance) {
              hlsInstance.destroy();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setNote('播放源已加载，正在使用浏览器原生 HLS 播放。');
      } else {
        video.src = source;
        setNote('当前浏览器可能需要 HLS 支持才能播放 m3u8 视频。');
      }

      loaded = true;
    }

    function play() {
      attachSource();

      if (cover) {
        cover.classList.add('hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setNote('浏览器阻止了自动播放，请使用播放器控制栏手动播放。');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('error', function () {
        setNote('视频暂时无法播放，请稍后重试或更换浏览器。');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
