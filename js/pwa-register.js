(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', function () {
  navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(function (err) {
    console.warn('SiPra PWA: service worker registration failed', err);
  });
  });
})();