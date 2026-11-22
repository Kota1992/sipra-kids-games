/* Game 10: Count the Objects — Number Kingdom */
(function () {
  'use strict';

  const {
    S, t, A, register, celebrateEl, finishGame,
    LEVEL_COUNT, startWithLevels, createLevelHub, showLevelComplete, renderLevelHeader,
    safeTimeout
  } = window.SiPraGameKit;

  const GAME_ID = 'count-objects';

  const ROUNDS = [
    { emoji: '🍎', count: 2, maxNum: 4, name: 'Apples' },
    { emoji: '⭐', count: 3, maxNum: 5, name: 'Stars' },
    { emoji: '🌸', count: 3, maxNum: 5, name: 'Flowers' },
    { emoji: '🎈', count: 4, maxNum: 6, name: 'Balloons' },
    { emoji: '🐶', count: 4, maxNum: 6, name: 'Puppies' },
    { emoji: '🐟', count: 5, maxNum: 7, name: 'Fish' },
    { emoji: '🍪', count: 6, maxNum: 8, name: 'Cookies' },
    { emoji: '🚗', count: 6, maxNum: 8, name: 'Cars' },
    { emoji: '🦋', count: 7, maxNum: 9, name: 'Butterflies' },
    { emoji: '🌈', count: 8, maxNum: 10, name: 'Rainbows' }
  ];

  function successSound() {
    try { A().success(); } catch (e) {}
  }

  register('count-objects', {
    name: { en: 'Count the Objects', te: 'వస్తువులు లెక్కించండి' },
    desc: { en: 'Count and tap the number', te: 'లెక్కించి సంఖ్యను తాకండి' },
    icon: '🔢',
    cat: 'learning',
    introKey: 'g10_intro',

    start(stage) {
      startWithLevels(stage, '🔢', 'g10_intro', {
        gameId: GAME_ID,
        title: 'Number Kingdom',
        subtitle: 'Count and rule 10 royal levels!',
        emoji: '👑',
        themeClass: 'nk-hub'
      }, (st, lv) => play(st, lv));

      function openHub(st) {
        createLevelHub(st, {
          gameId: GAME_ID,
          title: 'Number Kingdom',
          subtitle: 'Count and rule 10 royal levels!',
          emoji: '👑',
          themeClass: 'nk-hub',
          onPlay(lv) { play(st, lv); }
        });
      }

      function play(stage, planIndex) {
        const round = ROUNDS[planIndex] || ROUNDS[0];
        let answered = false;

        stage.innerHTML = '';

        const arena = document.createElement('div');
        arena.className = 'gp-arena nk-arena';
        arena.innerHTML = `
          <div class="nk-scene" aria-hidden="true">
            <div class="nk-sky"></div>
            <div class="nk-castle">🏰</div>
            <div class="nk-banner-flag"></div>
            <div class="nk-ground"></div>
          </div>

          <header class="nk-header">
            <div class="nk-brand">
              <span class="nk-crown">👑</span>
              <div>
                <h2 class="nk-title">Number Kingdom</h2>
                <p class="nk-question">${t('count_q') || 'How many?'} <strong class="nk-emoji-label">${round.emoji}</strong></p>
              </div>
            </div>
            <div class="nk-round-pill">Level ${planIndex + 1}</div>
          </header>

          <section class="nk-treasure" aria-label="Objects to count">
            <div class="nk-treasure-tray"></div>
          </section>

          <section class="nk-pad-wrap" aria-label="Number choices">
            <p class="nk-pad-hint">Tap the right number!</p>
            <div class="nk-pad"></div>
          </section>

          <div class="nk-wizard" aria-hidden="true">
            <span class="nk-wizard-face">🧙</span>
            <span class="nk-wizard-bubble">Count carefully!</span>
          </div>
        `;

        stage.appendChild(arena);
        renderLevelHeader(arena, planIndex, '', () => openHub(stage));

        const tray = arena.querySelector('.nk-treasure-tray');
        const pad = arena.querySelector('.nk-pad');
        let tappedCount = 0;

        for (let i = 0; i < round.count; i++) {
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'nk-item';
          item.textContent = round.emoji;
          item.style.animationDelay = (i * 0.08) + 's';
          item.style.border = 'none';
          item.style.background = 'transparent';
          item.style.cursor = 'pointer';
          item.setAttribute('aria-label', round.name + ' ' + (i + 1));
          item.addEventListener('click', () => {
            if (!item.classList.contains('nk-counted')) {
              item.classList.add('nk-counted');
              item.style.transform = 'scale(1.18)';
              tappedCount++;
              try { A().tone(440 + tappedCount * 55, 0.12, 'triangle', 0.14); } catch (e) {}
            } else {
              try { A().click(); } catch (e) {}
            }
          });
          tray.appendChild(item);
        }

        function completeLevel() {
          const isFinal = planIndex >= LEVEL_COUNT - 1;
          showLevelComplete(arena, {
            levelIndex: planIndex,
            gameId: GAME_ID,
            title: isFinal ? 'King of Numbers!' : 'Correct!',
            message: 'You counted ' + round.count + ' ' + round.name.toLowerCase() + '!',
            isFinal,
            onHub: () => openHub(stage),
            onNext: () => {
              if (isFinal) finishGame(arena, 3);
              else play(stage, planIndex + 1);
            }
          });
        }

        const maxNum = Math.max(round.maxNum || 10, round.count);
        for (let n = 1; n <= maxNum; n++) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'nk-orb';
          btn.textContent = String(n);
          btn.setAttribute('aria-label', 'Number ' + n);

          btn.addEventListener('click', () => {
            if (answered) return;

            if (n === round.count) {
              answered = true;
              successSound();
              celebrateEl(btn, 'nk-orb-win');
              const r = btn.getBoundingClientRect();
              try {
                S().burstParticles(r.left + r.width / 2, r.top + r.height / 2, ['⭐', round.emoji, '✨', '👑'], 12);
                S().showFeedback(arena, t('superstar'), true);
              } catch (e) {}
              safeTimeout(completeLevel, 700);
            } else {
              celebrateEl(btn, 'wiggle');
              try { S().showFeedback(arena, t('try_again'), false); } catch (e) {}
            }
          });

          pad.appendChild(btn);
        }
      }
    }
  });
})();