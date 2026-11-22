/* Game 7: Bubble Pop — Underwater Bubble Adventure */
(function () {
  'use strict';

  const {
    S, t, A, register, trackCleanup, progressDots, finishGame,
    LEVEL_COUNT, startWithLevels, createLevelHub, showLevelComplete, renderLevelHeader,
    safeTimeout, safeInterval
  } = window.SiPraGameKit;

  const GAME_ID = 'bubble-pop';

  const LEVEL_PLAN = [
    { goal: 6, spawnMs: 950, lifetime: 7500 },
    { goal: 7, spawnMs: 900, lifetime: 7200 },
    { goal: 8, spawnMs: 850, lifetime: 7000 },
    { goal: 9, spawnMs: 800, lifetime: 6800 },
    { goal: 10, spawnMs: 750, lifetime: 6500 },
    { goal: 11, spawnMs: 700, lifetime: 6200 },
    { goal: 12, spawnMs: 650, lifetime: 6000 },
    { goal: 13, spawnMs: 600, lifetime: 5800 },
    { goal: 14, spawnMs: 550, lifetime: 5500 },
    { goal: 16, spawnMs: 500, lifetime: 5200 }
  ];

  const BUBBLE_INSIDES = ['⭐', '🐟', '😊', '💖', '🌈', '✨', '🦋', '🐠', '🐚', ''];
  const BUBBLE_GRADIENTS = [
    'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85) 0%, rgba(100,210,255,0.35) 45%, rgba(0,120,200,0.25) 100%)',
    'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85) 0%, rgba(80,230,200,0.35) 45%, rgba(0,160,140,0.22) 100%)',
    'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85) 0%, rgba(180,140,255,0.35) 45%, rgba(100,60,200,0.22) 100%)',
    'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85) 0%, rgba(255,200,120,0.4) 45%, rgba(255,140,60,0.25) 100%)',
    'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85) 0%, rgba(255,150,200,0.35) 45%, rgba(220,80,160,0.22) 100%)'
  ];

  function popSound() {
    try { A().pop(); } catch (e) {}
  }

  register('bubble-pop', {
    name: { en: 'Bubble Pop', te: 'బుడగ పాప్' },
    desc: { en: 'Pop the shiny bubbles!', te: 'మెరిసే బుడగలు పాప్ చేయండి!' },
    icon: '🫧',
    cat: 'animals',
    introKey: 'g7_intro',

    start(stage) {
      startWithLevels(stage, '🫧', 'g7_intro', {
        gameId: GAME_ID,
        title: 'Underwater Bubble Adventure',
        subtitle: 'Pop bubbles across 10 ocean levels!',
        emoji: '🐠',
        themeClass: 'bp-hub'
      }, (st, lv) => play(st, lv));

      function openHub(st) {
        createLevelHub(st, {
          gameId: GAME_ID,
          title: 'Underwater Bubble Adventure',
          subtitle: 'Pop bubbles across 10 ocean levels!',
          emoji: '🐠',
          themeClass: 'bp-hub',
          onPlay(lv) { play(st, lv); }
        });
      }

      function play(stage, planIndex) {
        const plan = LEVEL_PLAN[planIndex] || LEVEL_PLAN[0];
        const GOAL = plan.goal;
        let popped = 0;
        let finished = false;
        let timer = null;
        const active = new Set();

        stage.innerHTML = '';

        const arena = document.createElement('div');
        arena.className = 'gp-arena bp-arena';
        arena.innerHTML = `
          <div class="bp-scene" aria-hidden="true">
            <div class="bp-water-top"></div>
            <div class="bp-rays"></div>
            <div class="bp-bubbles-bg"></div>
            <div class="bp-fish bp-fish-1">🐠</div>
            <div class="bp-fish bp-fish-2">🐡</div>
            <div class="bp-fish bp-fish-3">🦑</div>
            <div class="bp-kelp bp-kelp-l"></div>
            <div class="bp-kelp bp-kelp-r"></div>
            <div class="bp-sand"></div>
            <div class="bp-rocks">🪨</div>
          </div>

          <header class="bp-header">
            <div class="bp-brand">
              <span class="bp-brand-icon">🫧</span>
              <div>
                <h2 class="bp-title">Bubble Pop</h2>
                <p class="bp-tagline">Pop the shiny sea bubbles!</p>
              </div>
            </div>
            <div class="bp-hud" role="status" aria-live="polite">
              <span class="bp-hud-label">Popped</span>
              <span class="bp-hud-count"><span class="bp-count">0</span> / ${GOAL}</span>
              <div class="bp-hud-dots">${progressDots(GOAL, 0)}</div>
            </div>
          </header>

          <button type="button" class="bp-mascot" aria-hidden="true" tabindex="-1">
            <span class="bp-diver">🤿</span>
            <span class="bp-mascot-tip">Tap a bubble!</span>
          </button>

          <div class="bp-playfield" aria-label="Bubble field"></div>
        `;

        stage.appendChild(arena);
        renderLevelHeader(arena, planIndex, '', () => openHub(stage));

        const playfield = arena.querySelector('.bp-playfield');
        const countEl = arena.querySelector('.bp-count');
        const dotsWrap = arena.querySelector('.bp-hud-dots');

        function updateHud() {
          countEl.textContent = String(popped);
          dotsWrap.innerHTML = progressDots(GOAL, popped);
        }

        function clearSpawner() {
          if (timer) {
            clearInterval(timer);
            timer = null;
          }
        }

        function endLevel() {
          clearSpawner();
          active.forEach(el => { try { el.remove(); } catch (e) {} });
          active.clear();

          const isFinal = planIndex >= LEVEL_COUNT - 1;
          showLevelComplete(arena, {
            levelIndex: planIndex,
            gameId: GAME_ID,
            title: isFinal ? 'Ocean hero!' : 'Bubbles cleared!',
            message: 'You popped every bubble in this reef!',
            isFinal,
            onHub: () => openHub(stage),
            onNext: () => {
              if (isFinal) finishGame(arena, 3);
              else play(stage, planIndex + 1);
            }
          });
        }

        function spawnBubble() {
          if (finished || active.size > 14 || !playfield.isConnected) return;

          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'bp-bubble';
          const size = S().rand(52, 96);
          b.style.width = size + 'px';
          b.style.height = size + 'px';
          b.style.left = S().rand(3, 82) + '%';
          b.style.top = S().rand(14, 68) + '%';
          b.style.background = S().pick(BUBBLE_GRADIENTS);
          b.style.animationDuration = S().rand(2.4, 4.8) + 's';
          b.setAttribute('aria-label', 'Pop bubble');
          b.innerHTML = '<span class="bp-bubble-shine"></span><span class="bp-bubble-emoji">' + S().pick(BUBBLE_INSIDES) + '</span>';

          b.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (b.classList.contains('bp-popping') || finished) return;
            b.classList.add('bp-popping');
            popSound();
            popped = Math.min(GOAL, popped + 1);
            updateHud();
            active.delete(b);
            const r = b.getBoundingClientRect();
            try {
              S().burstParticles(r.left + r.width / 2, r.top + r.height / 2, ['✨', '💧', '⭐', '🫧'], 9);
              S().pointsPopup(1, r.left + r.width / 2, r.top);
            } catch (err) {}
            safeTimeout(() => b.remove(), 300);
            if (popped >= GOAL) {
              finished = true;
              clearSpawner();
              safeTimeout(endLevel, 420);
            }
          });

          playfield.appendChild(b);
          active.add(b);

          safeTimeout(() => {
            if (b.parentNode && !b.classList.contains('bp-popping')) {
              active.delete(b);
              b.remove();
            }
          }, plan.lifetime);
        }

        for (let i = 0; i < 5; i++) safeTimeout(spawnBubble, i * 160);
        timer = safeInterval(spawnBubble, plan.spawnMs);
        trackCleanup(() => {
          finished = true;
          clearSpawner();
        });

        updateHud();
      }
    }
  });
})();