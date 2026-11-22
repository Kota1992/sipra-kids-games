(function () {
  'use strict';

  const {
    S, A, register, trackCleanup, finishGame,
    LEVEL_COUNT, startWithLevels, createLevelHub, showLevelComplete, renderLevelHeader,
    safeTimeout, safeInterval
  } = window.SiPraGameKit;

  const GAME_ID = 'balloon-pop';

  const LEVEL_PLAN = [
    { goal: 6, interval: 1100, spawnCap: 5 },
    { goal: 8, interval: 1000, spawnCap: 6 },
    { goal: 8, interval: 950, spawnCap: 6 },
    { goal: 10, interval: 900, spawnCap: 7 },
    { goal: 10, interval: 850, spawnCap: 7 },
    { goal: 12, interval: 800, spawnCap: 8 },
    { goal: 12, interval: 750, spawnCap: 8 },
    { goal: 14, interval: 700, spawnCap: 9 },
    { goal: 14, interval: 650, spawnCap: 9 },
    { goal: 16, interval: 600, spawnCap: 10 }
  ];

  const STAGES = ['Opening Parade', 'Candy Clouds', 'Rainbow Ride', 'Grand Finale'];

  const COLORS = ['#FF5252', '#40C4FF', '#69F0AE', '#FFD740', '#FF9100', '#FF80AB', '#EA80FC', '#B388FF'];
  const DECOR = ['', '😊', '⭐', '💛', '✨', '🎉', '💖'];

  function stageName(lv) {
    return STAGES[Math.min(Math.floor(lv / 3), STAGES.length - 1)];
  }

  register('balloon-pop', {
    name: { en: 'Balloon Pop', te: 'బెలూన్ పాప్' },
    desc: { en: 'Pop rising party balloons!', te: 'పార్టీ బెలూన్లు పాప్ చేయండి!' },
    icon: '🎈',
    cat: 'fun',
    introKey: 'g13_intro',

    start(stage) {
      startWithLevels(stage, '🎈', 'g13_intro', {
        gameId: GAME_ID,
        title: 'Balloon Festival',
        subtitle: 'Pop through 10 festive levels!',
        emoji: '🎪',
        themeClass: 'bln-hub'
      }, (st, lv) => play(st, lv));

      function openHub(st) {
        createLevelHub(st, {
          gameId: GAME_ID,
          title: 'Balloon Festival',
          subtitle: 'Pop through 10 festive levels!',
          emoji: '🎪',
          themeClass: 'bln-hub',
          onPlay(lv) { play(st, lv); }
        });
      }

      function play(stage, planIndex) {
        const plan = LEVEL_PLAN[planIndex] || LEVEL_PLAN[0];
        const festName = stageName(planIndex);

        stage.innerHTML = '';
        const arena = document.createElement('div');
        arena.className = 'gp-arena bln-game';

        arena.innerHTML = `
          <div class="bln-bg" aria-hidden="true">
            <div class="bln-sky"></div>
            <div class="bln-bunting"></div>
            <div class="bln-confetti-layer"></div>
            <div class="bln-hills"></div>
            <div class="bln-crowd">🎪 🎠 🎡</div>
          </div>
          <header class="bln-top">
            <div class="bln-heading">
              <h2 class="bln-title">${festName}</h2>
              <p class="bln-subtitle">Pop the balloons!</p>
            </div>
            <div class="bln-hud" aria-live="polite">
              <span class="bln-hud-icon">🎈</span>
              <span class="bln-pop-count">0</span>
              <span class="bln-hud-sep">/</span>
              <span class="bln-goal">${plan.goal}</span>
            </div>
          </header>
          <div class="bln-field" role="application" aria-label="Balloon field"></div>
        `;

        stage.appendChild(arena);
        renderLevelHeader(arena, planIndex, '', () => openHub(stage));

        const field = arena.querySelector('.bln-field');
        const countEl = arena.querySelector('.bln-pop-count');

        let popped = 0;
        let finished = false;
        let timer = null;

        function activeBalloons() {
          return field.querySelectorAll('.bln-balloon:not(.bln-popping)').length;
        }

        function stopSpawning() {
          if (timer) {
            clearInterval(timer);
            timer = null;
          }
        }

        function tryFinish() {
          if (finished || popped < plan.goal) return;
          finished = true;
          stopSpawning();

          const isFinal = planIndex >= LEVEL_COUNT - 1;
          safeTimeout(() => {
            showLevelComplete(arena, {
              levelIndex: planIndex,
              gameId: GAME_ID,
              title: 'Festival cheer!',
              message: 'You popped ' + plan.goal + ' balloons!',
              isFinal,
              onHub: () => openHub(stage),
              onNext: () => {
                if (isFinal) finishGame(arena, 3);
                else play(stage, planIndex + 1);
              }
            });
          }, 420);
        }

        function popBalloon(b) {
          if (b.classList.contains('bln-popping') || finished) return;
          b.classList.add('bln-popping');
          try { A().pop(); } catch (e) {}
          popped = Math.min(plan.goal, popped + 1);
          countEl.textContent = String(popped);
          const r = b.getBoundingClientRect();
          try {
            S().burstParticles(r.left + r.width / 2, r.top + r.height / 2, ['🎊', '⭐', '✨', '💫'], 10);
            S().pointsPopup(1, r.left + r.width / 2, r.top);
          } catch (e) {}
          safeTimeout(() => b.remove(), 320);
          tryFinish();
        }

        function spawn() {
          if (finished || !field.isConnected) return;
          if (activeBalloons() >= plan.spawnCap) return;

          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'bln-balloon';
          const col = S().pick(COLORS);
          b.style.setProperty('--balloon', col);
          b.style.left = S().rand(4, 82) + '%';
          b.style.bottom = '-100px';
          b.style.animationDuration = S().rand(5, 9.5) + 's';
          b.setAttribute('aria-label', 'Pop balloon');

          const face = S().pick(DECOR);
          b.innerHTML = '<span class="bln-face">' + face + '</span><i class="bln-string" aria-hidden="true"></i>';

          b.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            popBalloon(b);
          });

          field.appendChild(b);

          safeTimeout(() => {
            if (b.parentNode && !b.classList.contains('bln-popping')) b.remove();
          }, 11000);
        }

        for (let i = 0; i < 4; i++) {
          safeTimeout(spawn, i * 280);
        }

        timer = safeInterval(spawn, plan.interval);
        trackCleanup(() => {
          finished = true;
          stopSpawning();
        });
      }
    }
  });
})();
