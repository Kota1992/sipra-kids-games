(function () {
  'use strict';

  const {
    S, t, A, register, finishGame,
    LEVEL_COUNT, startWithLevels, createLevelHub, showLevelComplete, renderLevelHeader, progressDots,
    safeTimeout
  } = window.SiPraGameKit;

  const GAME_ID = 'memory';

  const LEVEL_PLAN = [
    { pairs: 2, cols: 2 },
    { pairs: 2, cols: 2 },
    { pairs: 3, cols: 3 },
    { pairs: 3, cols: 3 },
    { pairs: 4, cols: 3 },
    { pairs: 4, cols: 4 },
    { pairs: 5, cols: 4 },
    { pairs: 5, cols: 4 },
    { pairs: 6, cols: 4 },
    { pairs: 6, cols: 4 }
  ];

  const POOLS = [
    ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🦁', '🐵', '🐸', '🐢', '🦜', '🐠'],
    ['🍎', '🍌', '🍇', '🍉', '🥥', '🍍', '🧁', '🍪', '🍩', '🍭', '🧃', '🍕'],
    ['⭐', '🌙', '☀️', '🌈', '⚓', '🏝️', '💎', '🪙', '🧭', '🗺️', '🦜', '🐚']
  ];

  const CARD_BG = {
    '🐶': '#FFE082', '🐱': '#F8BBD0', '🐰': '#E1BEE7', '🦊': '#FFCC80',
    '🐻': '#D7CCC8', '🐼': '#CFD8DC', '🦁': '#FFCC80', '🐵': '#D7CCC8',
    '🐸': '#C5E1A5', '🐢': '#A5D6A7', '🦜': '#81D4FA', '🐠': '#80DEEA',
    '🍎': '#FFCDD2', '🍌': '#FFF9C4', '🍇': '#E1BEE7', '🍉': '#F8BBD0',
    '🥥': '#D7CCC8', '🍍': '#FFF59D', '🧁': '#F8BBD0', '🍪': '#D7CCC8',
    '🍩': '#FFCCBC', '🍭': '#F48FB1', '🧃': '#C8E6C9', '🍕': '#FFCC80',
    '⭐': '#FFF59D', '🌙': '#C5CAE9', '☀️': '#FFE082', '🌈': '#B2EBF2',
    '⚓': '#B0BEC5', '🏝️': '#A5D6A7', '💎': '#B3E5FC', '🪙': '#FFE082',
    '🧭': '#FFCC80', '🗺️': '#FFECB3', '🐚': '#FFCCBC'
  };

  const ISLANDS = ['Coconut Bay', 'Palm Cove', 'Treasure Reef', 'Starfish Shoal'];

  function islandForLevel(lv) {
    return ISLANDS[Math.min(Math.floor(lv / 3), ISLANDS.length - 1)];
  }

  function sound(name) {
    try {
      const audio = A();
      if (audio && typeof audio[name] === 'function') audio[name]();
    } catch (e) {}
  }

  register('memory', {
    name: { en: 'Memory Cards', te: 'మెమరీ కార్డులు' },
    desc: { en: 'Crack eggs and find pairs!', te: 'గుడ్లు పగలగొట్టి జోడులు కనుగొనండి!' },
    icon: '🃏',
    cat: 'learning',
    introKey: 'g12_intro',

    start(stage) {
      startWithLevels(stage, '🥚', 'g12_intro', {
        gameId: GAME_ID,
        title: 'Treasure Island',
        subtitle: 'Match pairs across 10 isles!',
        emoji: '🏝️',
        themeClass: 'mi-hub'
      }, (st, lv) => play(st, lv));

      function openHub(st) {
        createLevelHub(st, {
          gameId: GAME_ID,
          title: 'Treasure Island',
          subtitle: 'Match pairs across 10 isles!',
          emoji: '🏝️',
          themeClass: 'mi-hub',
          onPlay(lv) { play(st, lv); }
        });
      }

      function play(stage, planIndex) {
        const plan = LEVEL_PLAN[planIndex] || LEVEL_PLAN[0];
        const island = islandForLevel(planIndex);
        const poolIndex = planIndex % POOLS.length;
        const symbols = S().shuffle(POOLS[poolIndex]).slice(0, plan.pairs);
        const deck = S().shuffle(symbols.concat(symbols.slice()));

        stage.innerHTML = '';
        const arena = document.createElement('div');
        arena.className = 'gp-arena mi-game';

        arena.innerHTML = `
          <div class="mi-bg" aria-hidden="true">
            <div class="mi-ocean"></div>
            <div class="mi-sand"></div>
            <div class="mi-palm mi-p1">🌴</div>
            <div class="mi-palm mi-p2">🌴</div>
            <div class="mi-sun">☀️</div>
            <div class="mi-wave"></div>
            <div class="mi-chest-float">🧰</div>
          </div>
          <header class="mi-top">
            <div class="mi-heading">
              <h2 class="mi-title">${island}</h2>
              <p class="mi-subtitle">${t('memory')}</p>
            </div>
            <div class="mi-progress" aria-live="polite">
              <span class="mi-pairs-label">Pairs found</span>
              <div class="mi-dots-wrap"></div>
            </div>
          </header>
          <div class="mi-grid-wrap">
            <div class="mi-grid"></div>
          </div>
        `;

        stage.appendChild(arena);
        renderLevelHeader(arena, planIndex, '', () => openHub(stage));

        const grid = arena.querySelector('.mi-grid');
        const dotsWrap = arena.querySelector('.mi-dots-wrap');
        grid.style.gridTemplateColumns = 'repeat(' + plan.cols + ', 1fr)';

        let flipped = [];
        let matched = 0;
        let lock = false;
        let levelDone = false;

        function refreshDots() {
          dotsWrap.innerHTML = progressDots(plan.pairs, matched);
        }

        function finishLevel() {
          if (levelDone) return;
          levelDone = true;
          const isFinal = planIndex >= LEVEL_COUNT - 1;
          showLevelComplete(arena, {
            levelIndex: planIndex,
            gameId: GAME_ID,
            title: t('amazing'),
            message: 'All treasure pairs on ' + island + '!',
            isFinal,
            onHub: () => openHub(stage),
            onNext: () => {
              if (isFinal) finishGame(arena, 3);
              else play(stage, planIndex + 1);
            }
          });
        }

        refreshDots();

        deck.forEach((emoji, idx) => {
          const card = document.createElement('button');
          card.type = 'button';
          card.className = 'mi-card';
          card.dataset.emoji = emoji;
          const shellHue = ['#5DADE2', '#48C9B0', '#F4D03F', '#EB984E', '#AF7AC5', '#EC7063'][idx % 6];
          const faceBg = CARD_BG[emoji] || '#FFF8E1';

          card.innerHTML =
            '<div class="mi-card-back" style="--shell:' + shellHue + '">' +
              '<span class="mi-compass">🧭</span>' +
              '<span class="mi-q">?</span>' +
            '</div>' +
            '<div class="mi-card-face" style="--face:' + faceBg + '">' +
              '<span class="mi-emoji">' + emoji + '</span>' +
            '</div>';

          card.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (lock || levelDone || flipped.includes(card) || card.classList.contains('revealed') || card.classList.contains('matched')) return;

            A().click();
            try {
              A().tone(392, 0.12, 'triangle', 0.14);
              A().tone(523, 0.18, 'sine', 0.14);
            } catch (err) {}

            card.classList.add('revealed');
            const r = card.getBoundingClientRect();
            try {
              S().burstParticles(r.left + r.width / 2, r.top + r.height / 2, ['✨', '🪙'], 4);
            } catch (err) {}

            flipped.push(card);

            if (flipped.length === 2) {
              lock = true;
              const [a, b] = flipped;

              if (a.dataset.emoji === b.dataset.emoji) {
                safeTimeout(() => {
                  a.classList.add('matched');
                  b.classList.add('matched');
                  matched++;
                  refreshDots();
                  sound('success');
                  try {
                    S().burstParticles(r.left + r.width / 2, r.top + r.height / 2, ['⭐', '💖', a.dataset.emoji], 10);
                  } catch (err) {}
                  flipped = [];
                  lock = false;
                  if (matched >= plan.pairs) {
                    try {
                      if (S().showFeedback) S().showFeedback(arena, t('amazing'), true);
                    } catch (err) {}
                    safeTimeout(finishLevel, 550);
                  }
                }, 260);
              } else {
                safeTimeout(() => {
                  a.classList.add('wrong');
                  b.classList.add('wrong');
                  try { A().gentle(); } catch (err) {}
                }, 240);
                safeTimeout(() => {
                  a.classList.remove('revealed', 'wrong');
                  b.classList.remove('revealed', 'wrong');
                  flipped = [];
                  lock = false;
                }, 900);
              }
            }
          });

          grid.appendChild(card);
        });
      }
    }
  });
})();