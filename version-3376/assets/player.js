import { H as Hls } from './hls-vendor-dru42stk.js';

(function () {
    'use strict';

    function initializePlayer(shell) {
        var video = shell.querySelector('video[data-src]');
        var button = shell.querySelector('[data-player-start]');
        if (!video || !button) {
            return;
        }
        var source = video.getAttribute('data-src');
        var initialized = false;

        function startPlayback() {
            if (!source) {
                button.innerHTML = '<strong>当前播放源不可用</strong>';
                return;
            }
            if (!initialized) {
                initialized = true;
                if (Hls && Hls.isSupported()) {
                    var hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            button.innerHTML = '<strong>播放初始化失败，请稍后重试</strong>';
                            shell.classList.remove('is-playing');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    button.innerHTML = '<strong>当前浏览器不支持 HLS 播放</strong>';
                    return;
                }
            }
            shell.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        button.addEventListener('click', startPlayback);
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                shell.classList.remove('is-playing');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('[data-player-shell]').forEach(initializePlayer);
    });
}());
