/* DEPRECATED – games now live in games/<id>/game.js
 * Kept only as a pointer. Safe to delete.
 * Load order: js/core.js → games/_kit/game-kit.js → games/*/game.js → js/app.js
 */
(function () {
  'use strict';
  if (!window.SiPra || !window.SiPra.GAMES || !Object.keys(window.SiPra.GAMES).length) {
    console.warn('SiPra: load games/_kit/game-kit.js and games/<id>/game.js instead of js/games.js');
  }
})();
