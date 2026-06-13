(function () {
    function initMoviePlayer(videoId, buttonId, sourceUrl, wrapperId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var wrapper = document.getElementById(wrapperId);
        var attached = false;
        var hls = null;

        if (!video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = sourceUrl;
        }

        function hideButton() {
            if (button) {
                button.classList.add("is-hidden");
            }
        }

        function showButton() {
            if (button && video.paused && !video.ended) {
                button.classList.remove("is-hidden");
            }
        }

        function start() {
            attachSource();
            hideButton();
            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    showButton();
                });
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }

        if (wrapper) {
            wrapper.addEventListener("click", function (event) {
                if (event.target === video && video.paused) {
                    start();
                }
            });
        }

        video.addEventListener("play", hideButton);
        video.addEventListener("pause", showButton);
        video.addEventListener("ended", showButton);

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
