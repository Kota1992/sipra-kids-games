/* SiPra Games – shared helpers for all mini-games */
(function (global) {
  'use strict';
  const S = () => global.SiPra;
  const t = (k) => S().t(k);
  const A = () => S().AudioFX;

  const LEVEL_COUNT = 10;

  function register(id, def) { S().GAMES[id] = def; }
  function onComplete(stars) { if (S().onGameComplete) S().onGameComplete(stars); }
  function trackCleanup(fn) {
    if (typeof fn === 'function') S().cleanupFns.push(fn);
  }

  function runCleanup() {
    const fns = S().cleanupFns || [];
    S().cleanupFns = [];
    fns.forEach((fn) => {
      try { fn(); } catch (e) { /* */ }
    });
  }

  function safeTimeout(fn, ms) {
    let active = true;
    const id = setTimeout(() => {
      if (!active) return;
      active = false;
      fn();
    }, ms);
    trackCleanup(() => {
      active = false;
      clearTimeout(id);
    });
    return id;
  }

  function safeInterval(fn, ms) {
    let active = true;
    const id = setInterval(() => {
      if (!active) return;
      fn();
    }, ms);
    trackCleanup(() => {
      active = false;
      clearInterval(id);
    });
    return id;
  }

  function flyEmoji(emoji, fromEl, toEl, done) {
    if (!fromEl || !toEl || !fromEl.isConnected || !toEl.isConnected) {
      if (done) done();
      return;
    }
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const flyer = document.createElement('div');
    flyer.className = 'fly-emoji';
    flyer.textContent = emoji;
    flyer.style.left = (a.left + a.width / 2 - 28) + 'px';
    flyer.style.top = (a.top + a.height / 2 - 28) + 'px';
    document.body.appendChild(flyer);
    requestAnimationFrame(() => {
      flyer.style.left = (b.left + b.width / 2 - 28) + 'px';
      flyer.style.top = (b.top + b.height / 2 - 28) + 'px';
      flyer.style.transform = 'scale(0.35) rotate(360deg)';
      flyer.style.opacity = '0.15';
    });
    let cancelled = false;
    const tid = setTimeout(() => {
      flyer.remove();
      if (!cancelled && done) done();
    }, 380);
    trackCleanup(() => {
      cancelled = true;
      clearTimeout(tid);
      flyer.remove();
    });
  }

  function progressDots(n, filled) {
    let html = '<div class="round-dots">';
    for (let i = 0; i < n; i++) {
      html += '<span class="rdot' + (i < filled ? ' on' : '') + '">⭐</span>';
    }
    return html + '</div>';
  }

  function celebrateEl(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function finishGame(stage, stars) {
    if (!stage || stage._gkFinished) return;
    stage._gkFinished = true;
    try { S().spawnConfetti(stage); } catch (e) {}
    try { A().celebrate(); } catch (e) {}
    safeTimeout(() => onComplete(stars), 700);
  }

  /* ---------- Level progression (10 levels, persisted) ---------- */

  function ensureLevelProgress(gameId) {
    const state = S().state;
    if (!state.gameLevelProgress || typeof state.gameLevelProgress !== 'object') {
      state.gameLevelProgress = {};
    }
    if (!state.gameLevelProgress[gameId] || typeof state.gameLevelProgress[gameId] !== 'object') {
      state.gameLevelProgress[gameId] = { unlocked: 0, cleared: [] };
    }
    const p = state.gameLevelProgress[gameId];
    if (!Array.isArray(p.cleared)) p.cleared = [];
    if (typeof p.unlocked !== 'number' || Number.isNaN(p.unlocked)) p.unlocked = 0;
    return p;
  }

  function saveLevelProgress() {
    S().Store.save(S().state);
  }

  function isLevelUnlocked(gameId, levelIndex) {
    return levelIndex <= ensureLevelProgress(gameId).unlocked;
  }

  function isLevelCleared(gameId, levelIndex) {
    return ensureLevelProgress(gameId).cleared.indexOf(levelIndex) >= 0;
  }

  function recordLevelCleared(gameId, levelIndex) {
    const p = ensureLevelProgress(gameId);
    if (p.cleared.indexOf(levelIndex) < 0) p.cleared.push(levelIndex);
    if (levelIndex + 1 > p.unlocked && levelIndex + 1 < LEVEL_COUNT) {
      p.unlocked = levelIndex + 1;
    }
    saveLevelProgress();
  }

  /**
   * After intro: level picker with lock / clear states.
   * onPlay(levelIndex) starts that level.
   */
  function createLevelHub(stage, opts) {
    runCleanup();
    const {
      gameId,
      title,
      subtitle,
      emoji,
      themeClass,
      onPlay
    } = opts;

    const prog = ensureLevelProgress(gameId);
    stage.innerHTML = '';

    const hub = document.createElement('div');
    hub.className = 'gp-arena gk-level-hub' + (themeClass ? ' ' + themeClass : '');

    const head = document.createElement('header');
    head.className = 'gk-hub-head';
    head.innerHTML =
      '<div class="gk-hub-icon">' + (emoji || '⭐') + '</div>' +
      '<div class="gk-hub-titles">' +
        '<h2 class="gk-hub-title">' + (title || 'Choose a Level') + '</h2>' +
        '<p class="gk-hub-sub">' + (subtitle || 'Tap a level to play!') + '</p>' +
      '</div>';

    const grid = document.createElement('div');
    grid.className = 'gk-level-grid';

    for (let i = 0; i < LEVEL_COUNT; i++) {
      const locked = i > prog.unlocked;
      const cleared = prog.cleared.indexOf(i) >= 0;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gk-level-btn' +
        (locked ? ' locked' : '') +
        (cleared ? ' cleared' : '') +
        (i === prog.unlocked && !cleared ? ' current' : '');
      btn.dataset.level = String(i);
      btn.disabled = locked;
      btn.setAttribute('aria-label', locked ? 'Level ' + (i + 1) + ' locked' : 'Level ' + (i + 1));

      btn.innerHTML =
        (locked ? '<span class="gk-lock">🔒</span>' : '') +
        '<span class="gk-lv-num">' + (i + 1) + '</span>' +
        (cleared ? '<span class="gk-lv-check">✓</span>' : '');

      if (!locked) {
        btn.addEventListener('click', () => {
          A().click();
          runCleanup();
          if (typeof onPlay === 'function') onPlay(i);
        });
      }
      grid.appendChild(btn);
    }

    hub.appendChild(head);
    hub.appendChild(grid);
    stage.appendChild(hub);
    return hub;
  }

  /** Standard in-game level header strip (optional onHub callback adds a Map button) */
  function renderLevelHeader(arena, levelIndex, extraHtml, onHub) {
    let bar = arena.querySelector('.gk-level-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'gk-level-bar';
      arena.insertBefore(bar, arena.firstChild);
    }
    const mapBtn = typeof onHub === 'function'
      ? '<button type="button" class="gk-map-btn gk-btn-ghost" aria-label="Level map">🗺️ Map</button>'
      : '';
    bar.innerHTML =
      '<span class="gk-lv-pill">Level ' + (levelIndex + 1) + ' / ' + LEVEL_COUNT + '</span>' +
      '<span class="gk-lv-dots">' + progressDots(LEVEL_COUNT, levelIndex) + '</span>' +
      (extraHtml || '') +
      mapBtn;
    if (typeof onHub === 'function') {
      const btn = bar.querySelector('.gk-map-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          A().click();
          runCleanup();
          onHub();
        });
      }
    }
    return bar;
  }

  /** Cheerful overlay between levels */
  function showLevelComplete(arena, opts) {
    if (!arena || !arena.isConnected) return null;
    if (arena.querySelector('.gk-level-overlay')) return null;

    const {
      levelIndex,
      gameId,
      title,
      message,
      onNext,
      onHub,
      isFinal
    } = opts;

    if (gameId != null && levelIndex != null) {
      recordLevelCleared(gameId, levelIndex);
    }

    try { A().success(); } catch (e) {}

    const overlay = document.createElement('div');
    overlay.className = 'gk-level-overlay';

    overlay.innerHTML =
      '<div class="gk-level-card">' +
        '<div class="gk-level-card-art">' + (isFinal ? '🏆' : '⭐') + '</div>' +
        '<div class="gk-level-card-title">' + (title || (isFinal ? 'You did it!' : 'Level complete!')) + '</div>' +
        '<div class="gk-level-card-msg">' + (message || 'Wonderful work!') + '</div>' +
        '<div class="gk-level-card-stars">⭐ ⭐ ⭐</div>' +
        '<div class="gk-level-card-actions">' +
          (isFinal
            ? '<button type="button" class="gk-btn-primary gk-finish-btn">Finish! 🎉</button>'
            : '<button type="button" class="gk-btn-primary gk-next-btn">Next level ➜</button>') +
          '<button type="button" class="gk-btn-ghost gk-hub-btn">Level map</button>' +
        '</div>' +
      '</div>';

    arena.appendChild(overlay);

    let acted = false;
    overlay.querySelector('.gk-hub-btn').addEventListener('click', () => {
      if (acted) return;
      acted = true;
      overlay.remove();
      runCleanup();
      if (typeof onHub === 'function') onHub();
    });

    if (isFinal) {
      overlay.querySelector('.gk-finish-btn').addEventListener('click', () => {
        if (acted) return;
        acted = true;
        overlay.remove();
        if (typeof onNext === 'function') onNext();
      });
    } else {
      overlay.querySelector('.gk-next-btn').addEventListener('click', () => {
        if (acted) return;
        acted = true;
        overlay.remove();
        runCleanup();
        if (typeof onNext === 'function') onNext();
      });
    }

    try {
      const r = overlay.getBoundingClientRect();
      S().burstParticles(r.left + r.width / 2, r.top + r.height * 0.35, ['🌈', '⭐', '🎉', '✨'], 12);
    } catch (e) {}

    return overlay;
  }

  /** Intro → level hub helper */
  function startWithLevels(stage, introIcon, introKey, hubOpts, onPlayLevel) {
    S().createIntro(stage, introIcon, introKey, () => {
      createLevelHub(stage, {
        ...hubOpts,
        onPlay(levelIndex) {
          if (typeof onPlayLevel === 'function') onPlayLevel(stage, levelIndex);
        }
      });
    });
  }

  global.SiPraGameKit = {
    S, t, A, register, onComplete, trackCleanup, runCleanup,
    safeTimeout, safeInterval,
    flyEmoji, progressDots, celebrateEl, finishGame,
    LEVEL_COUNT,
    ensureLevelProgress,
    saveLevelProgress,
    isLevelUnlocked,
    isLevelCleared,
    recordLevelCleared,
    createLevelHub,
    renderLevelHeader,
    showLevelComplete,
    startWithLevels
  };
})(window);
