/* SiPra Games – App shell: navigation, home, settings, stars, rewards */
(function () {
  'use strict';

  const S = window.SiPra;
  const GAME_ORDER = [
    'shape-matching',
    'color-sorting',
    'color-splash',
    'missing-shape',
    'guess-animal',
    'feed-animals',
    'bubble-pop',
    'butterfly-garden',
    'jigsaw',
    'count-objects',
    'shadow-match',
    'memory',
    'balloon-pop',
    'magic-coloring',
    'car-wash'
  ];

  let currentGameId = null;
  let pendingReset = false;

  /* ---------- Init ---------- */
  function init() {
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    unlockAudioOnGesture();
    bindNav();
    bindSettings();
    bindRewards();
    bindParentGate();
    renderHome();
    renderAllGames();
    renderStars();
    fillSettings();
    S.applyI18n();
    updateAvatarUI();
  }

  function unlockAudioOnGesture() {
    const unlock = () => {
      S.AudioFX.unlock();
      S.AudioFX.syncMusic();
      document.removeEventListener('pointerdown', unlock);
    };
    document.addEventListener('pointerdown', unlock, { once: true });
  }

  /* ---------- Navigation ---------- */
  function bindNav() {
    document.getElementById('bottom-nav').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-nav]');
      if (!btn) return;
      S.AudioFX.click();
      showScreen(btn.dataset.nav);
    });

    document.getElementById('category-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.cat-tab');
      if (!tab) return;
      S.AudioFX.click();
      document.querySelectorAll('.cat-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      renderHome(tab.dataset.cat);
    });

    document.getElementById('game-home-btn').addEventListener('click', () => {
      S.AudioFX.click();
      leaveGame();
      showScreen('home');
    });

    document.getElementById('game-restart-btn').addEventListener('click', () => {
      S.AudioFX.click();
      if (currentGameId) launchGame(currentGameId, true);
    });

    document.getElementById('game-sound-btn').addEventListener('click', () => {
      S.state.sfx = !S.state.sfx;
      S.state.music = S.state.sfx ? S.state.music : false;
      if (!S.state.sfx) S.AudioFX.stopMusic();
      else S.AudioFX.syncMusic();
      S.Store.save(S.state);
      updateSoundBtn();
      fillSettings();
      S.AudioFX.click();
    });

    document.getElementById('home-avatar-btn').addEventListener('click', () => {
      S.AudioFX.click();
      showScreen('settings');
    });
  }

  function showScreen(name) {
    leaveGame();
    document.getElementById('app').classList.remove('playing');
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.nav === name);
    });
    const screen = document.getElementById('screen-' + name);
    if (screen) screen.classList.add('active');
    if (name === 'home') renderHome(document.querySelector('.cat-tab.active')?.dataset.cat || 'all');
    if (name === 'games') renderAllGames();
    if (name === 'stars') renderStars();
    if (name === 'settings') fillSettings();
  }

  function showPlayScreen() {
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    document.getElementById('screen-play').classList.add('active');
    document.getElementById('app').classList.add('playing');
  }

  /* ---------- Game cards ---------- */
  function gameMeta(id) {
    const g = S.GAMES[id];
    if (!g) return null;
    const lang = S.state.language;
    return {
      id,
      name: g.name[lang] || g.name.en,
      desc: g.desc[lang] || g.desc.en,
      icon: g.icon,
      cat: g.cat,
      stars: S.state.gameStars[id] || 0
    };
  }

  function createCard(meta) {
    const card = document.createElement('article');
    card.className = 'game-card';
    card.dataset.cat = meta.cat;
    card.dataset.game = meta.id;
    const dots = [1, 2, 3].map((n) =>
      '<span class="dot' + (meta.stars >= n ? ' lit' : '') + '">⭐</span>'
    ).join('');
    card.innerHTML =
      '<div class="game-card-icon">' + meta.icon + '</div>' +
      '<h3 class="game-card-name">' + meta.name + '</h3>' +
      '<p class="game-card-desc">' + meta.desc + '</p>' +
      '<div class="progress-dots">' + dots + '</div>' +
      '<button type="button" class="play-btn">' + S.t('play') + '</button>';
    card.addEventListener('click', (e) => {
      e.preventDefault();
      S.AudioFX.click();
      launchGame(meta.id);
    });
    return card;
  }

  function renderHome(cat) {
    const filter = cat || 'all';
    const grid = document.getElementById('home-games-grid');
    grid.innerHTML = '';
    GAME_ORDER.forEach((id) => {
      const meta = gameMeta(id);
      if (!meta) return;
      if (filter !== 'all' && meta.cat !== filter) return;
      grid.appendChild(createCard(meta));
    });
  }

  function renderAllGames() {
    const grid = document.getElementById('all-games-grid');
    grid.innerHTML = '';
    GAME_ORDER.forEach((id) => {
      const meta = gameMeta(id);
      if (meta) grid.appendChild(createCard(meta));
    });
  }

  /* ---------- Launch / cleanup ---------- */
  function cleanupGame() {
    S.cleanupFns.forEach((fn) => {
      try { fn(); } catch (e) { /* */ }
    });
    S.cleanupFns = [];
    S.currentGame = null;
  }

  function leaveGame() {
    cleanupGame();
    currentGameId = null;
    document.getElementById('game-stage').innerHTML = '';
    document.getElementById('app').classList.remove('playing');
    hideReward();
  }

  function launchGame(id, restart) {
    const game = S.GAMES[id];
    if (!game) return;
    cleanupGame();
    currentGameId = id;
    S.currentGame = id;
    const lang = S.state.language;
    document.getElementById('game-title').textContent = game.name[lang] || game.name.en;
    updateSoundBtn();
    showPlayScreen();
    const stage = document.getElementById('game-stage');
    stage.innerHTML = '';
    try {
      game.start(stage);
    } catch (err) {
      console.error('Game error:', id, err);
      stage.innerHTML = '<div class="g-intro"><p class="g-intro-text">Oops! Try again.</p></div>';
    }
  }

  function updateSoundBtn() {
    const btn = document.getElementById('game-sound-btn');
    btn.textContent = S.state.sfx ? '🔊' : '🔇';
  }

  /* ---------- Rewards ---------- */
  S.onGameComplete = function (stars) {
    const awarded = Math.min(3, Math.max(1, stars || 1));
    const prev = S.state.gameStars[currentGameId] || 0;
    const gain = Math.max(0, awarded - prev);
    if (awarded > prev) {
      S.state.totalStars = (S.state.totalStars || 0) + gain;
      S.state.gameStars[currentGameId] = awarded;
    }
    S.state.completedGames[currentGameId] = true;
    unlockAccessories();
    S.Store.save(S.state);
    ACelebrate(awarded);
  };

  function unlockAccessories() {
    S.ACCESSORIES.forEach((acc) => {
      if (S.state.totalStars >= acc.stars && !S.state.unlockedAccessories.includes(acc.id)) {
        S.state.unlockedAccessories.push(acc.id);
      }
    });
  }

  function ACelebrate(stars) {
    S.AudioFX.celebrate();
    const msgs = ['you_did_it', 'superstar', 'amazing', 'wonderful', 'great_job'];
    const msg = S.t(S.pick(msgs));
    const emojis = document.getElementById('reward-emojis');
    if (emojis) emojis.textContent = S.pick(['🎉🌈⭐', '🌟💖✨', '🎈🎊🦄', '🐾🌈⭐']);
    document.getElementById('reward-msg').textContent = msg;
    document.getElementById('reward-stars').textContent = '⭐'.repeat(stars);
    const overlay = document.getElementById('reward-overlay');
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    S.burstParticles(window.innerWidth * 0.3, window.innerHeight * 0.42, ['🌈', '⭐', '🎉', '🎈'], 10);
    S.burstParticles(window.innerWidth * 0.7, window.innerHeight * 0.42, ['🌈', '⭐', '🎉', '🎈'], 10);
    S.pointsPopup(stars, window.innerWidth / 2, window.innerHeight * 0.35);
    S.bumpScorePill();
  }

  function hideReward() {
    const overlay = document.getElementById('reward-overlay');
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function bindRewards() {
    document.getElementById('reward-again').addEventListener('click', () => {
      S.AudioFX.click();
      hideReward();
      if (currentGameId) launchGame(currentGameId, true);
    });
    document.getElementById('reward-home').addEventListener('click', () => {
      S.AudioFX.click();
      hideReward();
      leaveGame();
      showScreen('home');
    });
  }

  /* ---------- Stars page ---------- */
  function renderStars() {
    document.getElementById('total-stars').textContent = String(S.state.totalStars || 0);
    const list = document.getElementById('completed-list');
    list.innerHTML = '';
    GAME_ORDER.forEach((id) => {
      const stars = S.state.gameStars[id] || 0;
      if (!stars && !S.state.completedGames[id]) return;
      const meta = gameMeta(id);
      if (!meta) return;
      const row = document.createElement('div');
      row.className = 'completed-item';
      row.innerHTML =
        '<span class="ci-icon">' + meta.icon + '</span>' +
        '<span class="ci-name">' + meta.name + '</span>' +
        '<span class="ci-stars">' + '⭐'.repeat(stars || 1) + '</span>';
      list.appendChild(row);
    });

    const grid = document.getElementById('accessories-grid');
    grid.innerHTML = '';
    const lang = S.state.language;
    S.ACCESSORIES.forEach((acc) => {
      const unlocked = S.state.unlockedAccessories.includes(acc.id) || S.state.totalStars >= acc.stars;
      if (unlocked && !S.state.unlockedAccessories.includes(acc.id)) {
        S.state.unlockedAccessories.push(acc.id);
      }
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'acc-card ' + (unlocked ? 'unlocked' : 'locked') +
        (S.state.equippedAccessory === acc.id ? ' equipped' : '');
      card.innerHTML =
        '<span class="acc-emoji">' + (acc.emoji || '😊') + '</span>' +
        '<div class="acc-name">' + (acc.name[lang] || acc.name.en) + '</div>' +
        (unlocked
          ? ''
          : '<div class="acc-need">' + S.t('locked') + ' ' + acc.stars + ' ' + S.t('stars_word') + '</div>');
      if (unlocked) {
        card.addEventListener('click', () => {
          S.AudioFX.click();
          S.state.equippedAccessory = acc.id;
          S.Store.save(S.state);
          updateAvatarUI();
          renderStars();
        });
      }
      grid.appendChild(card);
    });
    S.Store.save(S.state);
  }

  function updateAvatarUI() {
    const acc = S.ACCESSORIES.find((a) => a.id === S.state.equippedAccessory);
    const face = (acc && acc.emoji ? acc.emoji + ' ' : '') + (S.state.avatar || '🐻');
    document.getElementById('home-avatar').textContent = face.trim();
    document.getElementById('home-child-name').textContent = S.state.childName || 'Little Star';
    S.bumpScorePill();
  }

  /* ---------- Settings ---------- */
  function fillSettings() {
    document.getElementById('setting-name').value = S.state.childName || '';
    document.getElementById('setting-music').checked = !!S.state.music;
    document.getElementById('setting-sfx').checked = !!S.state.sfx;
    document.querySelectorAll('.lang-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.lang === S.state.language);
    });
    const picker = document.getElementById('avatar-picker');
    picker.innerHTML = '';
    S.AVATARS.forEach((av) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'avatar-opt' + (S.state.avatar === av ? ' selected' : '');
      btn.textContent = av;
      btn.addEventListener('click', () => {
        S.AudioFX.click();
        S.state.avatar = av;
        S.Store.save(S.state);
        updateAvatarUI();
        fillSettings();
      });
      picker.appendChild(btn);
    });
  }

  function bindSettings() {
    document.getElementById('setting-name').addEventListener('change', (e) => {
      S.state.childName = (e.target.value || 'Little Star').slice(0, 20);
      S.Store.save(S.state);
      updateAvatarUI();
    });
    document.getElementById('setting-name').addEventListener('input', (e) => {
      S.state.childName = (e.target.value || '').slice(0, 20);
      updateAvatarUI();
    });

    document.getElementById('setting-music').addEventListener('change', (e) => {
      S.state.music = e.target.checked;
      S.Store.save(S.state);
      S.AudioFX.syncMusic();
    });
    document.getElementById('setting-sfx').addEventListener('change', (e) => {
      S.state.sfx = e.target.checked;
      S.Store.save(S.state);
    });

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        S.AudioFX.click();
        S.state.language = btn.dataset.lang;
        S.Store.save(S.state);
        S.applyI18n();
        fillSettings();
        renderHome(document.querySelector('.cat-tab.active')?.dataset.cat || 'all');
        renderAllGames();
        renderStars();
        updateAvatarUI();
      });
    });

    document.getElementById('reset-progress-btn').addEventListener('click', () => {
      pendingReset = true;
      openParentGate();
    });
  }

  /* ---------- Parent gate ---------- */
  function openParentGate() {
    const overlay = document.getElementById('parent-gate');
    const answers = document.getElementById('gate-answers');
    answers.innerHTML = '';
    const correct = 5;
    const opts = S.shuffle([3, 4, 5, 6, 7]);
    opts.forEach((n) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = String(n);
      b.addEventListener('click', () => {
        if (n === correct) {
          closeParentGate();
          if (pendingReset) {
            pendingReset = false;
            S.state = S.Store.reset();
            updateAvatarUI();
            fillSettings();
            renderHome();
            renderAllGames();
            renderStars();
            S.applyI18n();
            alert(S.t('reset_confirm'));
          }
        } else {
          S.AudioFX.gentle();
        }
      });
      answers.appendChild(b);
    });
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function closeParentGate() {
    const overlay = document.getElementById('parent-gate');
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    pendingReset = false;
  }

  function bindParentGate() {
    document.getElementById('gate-cancel').addEventListener('click', () => {
      S.AudioFX.click();
      closeParentGate();
    });
  }

  /* ---------- Boot ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
