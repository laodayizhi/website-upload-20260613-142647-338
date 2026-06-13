function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var overlay = document.getElementById(config.overlayId);
  var button = document.getElementById(config.buttonId);
  var hls = null;
  var attached = false;

  if (!video || !config.streamUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(config.streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = config.streamUrl;
  }

  function startPlayback() {
    attachStream();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      startPlayback();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function (event) {
      event.preventDefault();
      startPlayback();
    });
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('emptied', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
      hls = null;
    }
    attached = false;
  });
}
