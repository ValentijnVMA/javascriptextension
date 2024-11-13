(function() {
    'use strict';

    // Functie om advertenties te verwijderen
    function blockAds() {
        // Verwijder preroll-advertenties (video-advertenties vóór de content)
        let adElements = document.querySelectorAll('.video-ads, .ytp-ad-module');
        if (adElements.length > 0) {
            adElements.forEach(function(adElement) {
                adElement.style.display = 'none';
            });
        }

        // Verwijder banneradvertenties in video's
        let bannerAds = document.querySelectorAll('.ytp-ad-overlay-container');
        if (bannerAds.length > 0) {
            bannerAds.forEach(function(bannerAd) {
                bannerAd.style.display = 'none';
            });
        }

        // Klik op de 'Skip Ad'-knop zodra deze beschikbaar is
        let skipButton = document.querySelector('.ytp-ad-skip-button');
        if (skipButton) {
            skipButton.click();
        }
    }

    // Controleer elke seconde of er advertenties zijn en verwijder ze
    setInterval(blockAds, 1000);
})();
