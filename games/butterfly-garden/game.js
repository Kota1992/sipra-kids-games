/* Game 8: Butterfly Garden — Magical Butterfly Garden */
(function () {
  'use strict';

  const {
    S, t, A, register, trackCleanup, flyEmoji, progressDots, finishGame,
    LEVEL_COUNT, startWithLevels, createLevelHub, showLevelComplete, renderLevelHeader,
    safeTimeout
  } = window.SiPraGameKit;

  const GAME_ID = 'butterfly-garden';

  const PALETTE = [
    { id: 'red', flower: '🌹', tint: '#FF5252', name: 'Rose' },
    { id: 'yellow', flower: '🌻', tint: '#FFD600', name: 'Sunflower' },
    { id: 'pink', flower: '🌸', tint: '#FF80AB', name: 'Cherry blossom' },
    { id: 'blue', flower: '💙', tint: '#40C4FF', name: 'Bluebell' },
    { id: 'purple', flower: '💜', tint: '#B388FF', name: 'Lilac' },
    { id: 'orange', flower: '🌼', tint: '#FFAB40', name: 'Marigold' }
  ];

  /** 10 levels: how many butterfly–flower pairs */
  const LEVEL_PLAN = [2, 2, 3, 3, 4, 4, 4, 5, 5, 6];

  function successSound() {
    try { A().success(); } catch (e) {}
  }

  register('butterfly-garden', {
    name: { en: 'Butterfly Garden', te: 'సీతాకోకచిలుక తోట' },
    desc: { en: 'Match butterflies to flowers', te: 'సీతాకోకచిలుకలను పువ్వులకు తీసుకెళ్లండి' },
    icon: '🦋',
    cat: 'animals',
    introKey: 'g8_intro',

    start(stage) {
      startWithLevels(stage, '🦋', 'g8_intro', {
        gameId: GAME_ID,
        title: 'Magical Butterfly Garden',
        subtitle: 'Guide butterflies to matching blooms!',
        emoji: '🌸',
        themeClass: 'bf-hub'
      }, (st, lv) => play(st, lv));

      function openHub(st) {
        createLevelHub(st, {
          gameId: GAME_ID,
          title: 'Magical Butterfly Garden',
          subtitle: 'Guide butterflies to matching blooms!',
          emoji: '🌸',
          themeClass: 'bf-hub',
          onPlay(lv) { play(st, lv); }
        });
      }

      function play(stage, planIndex) {
        const pairCount = LEVEL_PLAN[planIndex] || 2;
        const colors = PALETTE.slice(0, pairCount);
        let matched = 0;
        let levelDone = false;

        stage.innerHTML = '';

        const arena = document.createElement('div');
        arena.className = 'gp-arena bf-arena';
        arena.innerHTML = `
          <div class="bf-scene" aria-hidden="true">
            <div class="bf-sky"></div>
            <div class="bf-sun">☀️</div>
            <div class="bf-cloud bf-c1"></div>
            <div class="bf-cloud bf-c2"></div>
            <div class="bf-hills"></div>
            <div class="bf-sparkles"></div>
          </div>

          <header class="bf-header">
            <div class="bf-brand">
              <span class="bf-brand-icon">🦋</span>
              <div>
                <h2 class="bf-title">Butterfly Garden</h2>
                <p class="bf-sub">${t('guide_butterfly') || 'Match each butterfly to its flower!'}</p>
              </div>
            </div>
            <div class="bf-progress" role="status" aria-live="polite">
              <span class="bf-progress-label">Bloomed</span>
              <div class="bf-progress-dots">${progressDots(pairCount, 0)}</div>
            </div>
          </header>

          <section class="bf-sky-lane" aria-label="Butterflies">
            <div class="bf-lane-label">Butterflies</div>
            <div class="bf-butterflies"></div>
          </section>

          <section class="bf-meadow" aria-label="Garden flowers">
            <div class="bf-lane-label">Flowers</div>
            <div class="bf-flowers"></div>
          </section>

          <div class="bf-fairy" aria-hidden="true">🧚</div>
        `;

        stage.appendChild(arena);
        renderLevelHeader(arena, planIndex, '', () => openHub(stage));

        const butterfliesEl = arena.querySelector('.bf-butterflies');
        const flowersEl = arena.querySelector('.bf-flowers');
        const dotsWrap = arena.querySelector('.bf-progress-dots');
        const flowerById = {};

        colors.forEach((c) => {
          const flower = document.createElement('div');
          flower.className = 'bf-bloom drop-target';
          flower.dataset.color = c.id;
          flower.style.setProperty('--bloom-tint', c.tint);
          flower.setAttribute('aria-label', c.name + ' flower');
          flower.innerHTML = `
            <div class="bf-bloom-head">${c.flower}</div>
            <div class="bf-bloom-stem"></div>
            <div class="bf-bloom-leaf"></div>
            <span class="bf-bloom-check">✓</span>
          `;
          flowersEl.appendChild(flower);
          flowerById[c.id] = flower;
        });

        function updateDots() {
          dotsWrap.innerHTML = progressDots(pairCount, matched);
        }

        function completeLevel() {
          if (levelDone) return;
          levelDone = true;

          const isFinal = planIndex >= LEVEL_COUNT - 1;
          showLevelComplete(arena, {
            levelIndex: planIndex,
            gameId: GAME_ID,
            title: isFinal ? 'Garden guardian!' : 'Garden blooming!',
            message: 'Every butterfly found its flower!',
            isFinal,
            onHub: () => openHub(stage),
            onNext: () => {
              if (isFinal) finishGame(arena, 3);
              else play(stage, planIndex + 1);
            }
          });
        }

        function tryMatch(butterfly, color) {
          const flower = flowerById[color.id];
          if (!flower || flower.classList.contains('bf-bloomed') || levelDone) return;

          flower.classList.add('bf-bloomed');
          butterfly.classList.add('bf-matched');
          butterfly._dragDisabled = true;
          butterfly.style.pointerEvents = 'none';
          matched++;
          updateDots();
          successSound();

          const rect = flower.getBoundingClientRect();
          try {
            S().burstParticles(
              rect.left + rect.width / 2,
              rect.top + rect.height / 2,
              ['✨', color.flower, '💖', '🦋'],
              12
            );
          } catch (e) {}

          if (matched >= pairCount) safeTimeout(completeLevel, 700);
        }

        S().shuffle(colors.slice()).forEach((c) => {
          const butterfly = document.createElement('div');
          butterfly.className = 'bf-butterfly';
          butterfly.dataset.color = c.id;
          butterfly.setAttribute('aria-label', c.name + ' butterfly');
          butterfly.style.setProperty('--bf-tint', c.tint);
          butterfly.innerHTML = '<span class="bf-wing">🦋</span>';

          const clean = S().enableDrag(butterfly, {
            onEnd(el, e, meta) {
              if (el.classList.contains('bf-matched') || levelDone) return;
              const flower = flowerById[el.dataset.color];
              if (!flower || flower.classList.contains('bf-bloomed')) return;

              // Tap (< 14px movement): fly smoothly to its matching flower
              if (meta && meta.moved < 14) {
                el._dragDisabled = true;
                flyEmoji('🦋', el, flower, () => tryMatch(el, c));
                return;
              }

              // Dragged: must land on matching flower, otherwise return home
              if (S().hits(el, flower, 78)) {
                tryMatch(el, c);
              } else {
                S().returnDrag(el);
                try { S().showFeedback(arena, t('try_again'), false); } catch (err) {}
              }
            }
          });
          trackCleanup(clean);
          butterfliesEl.appendChild(butterfly);
        });

        updateDots();
      }
    }
  });
})();