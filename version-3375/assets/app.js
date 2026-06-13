(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  var panel = document.querySelector('[data-filter-panel]');
  var grid = document.querySelector('[data-filter-grid]');

  if (panel && grid) {
    var input = panel.querySelector('[data-filter-input]');
    var region = panel.querySelector('[data-region-filter]');
    var genre = panel.querySelector('[data-genre-filter]');
    var sort = panel.querySelector('[data-sort-filter]');
    var noResults = document.querySelector('[data-no-results]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function includesValue(source, value) {
      return String(source || '').toLowerCase().indexOf(String(value || '').toLowerCase()) !== -1;
    }

    function cardScore(card, key) {
      if (key === 'views') {
        return Number(card.getAttribute('data-views')) || 0;
      }

      if (key === 'likes') {
        return Number(card.getAttribute('data-likes')) || 0;
      }

      if (key === 'year') {
        return Number(String(card.getAttribute('data-year') || '').replace(/\D/g, '')) || 0;
      }

      return Number(card.getAttribute('data-views')) || 0;
    }

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : 'all';
      var genreValue = genre ? genre.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-keywords')
        ].join(' ').toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesRegion = regionValue === 'all' || card.getAttribute('data-region') === regionValue;
        var matchesGenre = genreValue === 'all' || includesValue(card.getAttribute('data-genre'), genreValue);
        var show = matchesKeyword && matchesRegion && matchesGenre;

        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle('show', visible === 0);
      }
    }

    function applySort() {
      var key = sort ? sort.value : 'default';
      var ordered = cards.slice();

      if (key !== 'default') {
        ordered.sort(function (a, b) {
          return cardScore(b, key) - cardScore(a, key);
        });
      }

      ordered.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = ordered;
      applyFilters();
    }

    [input, region, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (sort) {
      sort.addEventListener('change', applySort);
    }

    applySort();
  }
})();
