import { H as Hls } from './hls.esm.js';

function initPlayer(frame) {
    const source = frame.getAttribute('data-src');
    const video = frame.querySelector('video');
    const button = frame.querySelector('[data-player-button]');
    let hlsInstance = null;
    let loaded = false;

    if (!source || !video || !button) {
        return;
    }

    function start() {
        if (!loaded) {
            if (Hls && Hls.isSupported && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
            loaded = true;
        }

        button.classList.add('is-hidden');
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                button.classList.remove('is-hidden');
            });
        }
    }

    button.addEventListener('click', start);
    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
            button.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.js-movie-player').forEach(initPlayer);
});
