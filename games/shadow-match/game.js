(function () {
  'use strict';

  const {
    S, t, A, register, finishGame, celebrateEl,
    LEVEL_COUNT, startWithLevels, createLevelHub, showLevelComplete, renderLevelHeader,
    safeTimeout
  } = window.SiPraGameKit;

  const GAME_ID = 'shadow-match';

  const LEVEL_PLAN = [
    { rounds: 2, choices: 3 },
    { rounds: 3, choices: 3 },
    { rounds: 3, choices: 3 },
    { rounds: 4, choices: 3 },
    { rounds: 4, choices: 4 },
    { rounds: 5, choices: 4 },
    { rounds: 5, choices: 4 },
    { rounds: 6, choices: 4 },
    { rounds: 6, choices: 4 },
    { rounds: 7, choices: 4 }
  ];

  const ZONES = [
    { id: 'alley', title: 'Mystery Alley', mascot: '🔦', tip: 'Spot the shadow!', complete: 'Case cracked in the alley!' },
    { id: 'park', title: 'Park Clues', mascot: '🌳', tip: 'Which one matches?', complete: 'Park mystery solved!' },
    { id: 'zoo', title: 'Zoo Files', mascot: '🦁', tip: 'Compare carefully!', complete: 'Zoo case closed!' },
    { id: 'harbor', title: 'Harbor Hunt', mascot: '⚓', tip: 'Shadow detective!', complete: 'Harbor mystery done!' }
  ];

  const ITEMS = [
    { emoji: '🐘', bg: '#B0BEC5', name: 'Elephant' },
    { emoji: '🚗', bg: '#90CAF9', name: 'Car' },
    { emoji: '🍎', bg: '#FFCDD2', name: 'Apple' },
    { emoji: '🏠', bg: '#FFE0B2', name: 'House' },
    { emoji: '🐱', bg: '#F8BBD0', name: 'Cat' },
    { emoji: '✈️', bg: '#B3E5FC', name: 'Plane' },
    { emoji: '🦆', bg: '#FFF59D', name: 'Duck' },
    { emoji: '🎸', bg: '#E1BEE7', name: 'Guitar' },
    { emoji: '🐸', bg: '#C5E1A5', name: 'Frog' },
    { emoji: '🚂', bg: '#FFCC80', name: 'Train' },
    { emoji: '🌻', bg: '#FFF9C4', name: 'Flower' },
    { emoji: '🎈', bg: '#F48FB1', name: 'Balloon' }
  ];

  function zoneForLevel(lv) {
    return ZONES[Math.min(Math.floor(lv / 3), ZONES.length - 1)];
  }

  function sound(name) {
    try {
      const audio = A();
      if (audio && typeof audio[name] === 'function') audio[name]();
    } catch (e) {}
  }

  register('shadow-match', {
    name: { en: 'Shadow Matching', te: 'నీడ మ్యాచ్' },
    desc: { en: 'Match the picture to its shadow', te: 'చిత్రాన్ని నీడతో సరిపోల్చండి' },
    icon: '👤',
    cat: 'learning',
    introKey: 'g11_intro',

    start(stage) {
      startWithLevels(stage, '👤', 'g11_intro', {
        gameId: GAME_ID,
        title: 'Shadow Detective',
        subtitle: '10 clue-filled levels!',
        emoji: '🔍',
        themeClass: 'sd-hub'
      }, (st, lv) => play(st, lv));

      function openHub(st) {
        createLevelHub(st, {
          gameId: GAME_ID,
          title: 'Shadow Detective',
          subtitle: '10 clue-filled levels!',
          emoji: '🔍',
          themeClass: 'sd-hub',
          onPlay(lv) { play(st, lv); }
        });
      }

      function play(stage, planIndex) {
        const plan = LEVEL_PLAN[planIndex] || LEVEL_PLAN[0];
        const zone = zoneForLevel(planIndex);
        const roundItems = S().shuffle(ITEMS).slice(0, plan.rounds);

        stage.innerHTML = '';
        const arena = document.createElement('div');
        arena.className = 'gp-arena sd-game zone-' + zone.id;

        arena.innerHTML = `
          <div class="sd-bg" aria-hidden="true">
            <div class="sd-sky"></div>
            <div class="sd-fog"></div>
            <div class="sd-moon">🌙</div>
            <div class="sd-lamp">💡</div>
            <div class="sd-ground"></div>
            <div class="sd-clues">🔎 🧩 📋</div>
          </div>
          <header class="sd-top">
            <div class="sd-heading">
              <h2 class="sd-title">${zone.title}</h2>
              <p class="sd-subtitle">${t('match_shadow')}</p>
            </div>
            <div class="sd-mascot" aria-hidden="true">
              <span class="sd-mascot-face">${zone.mascot}</span>
              <span class="sd-mascot-tip">${zone.tip}</span>
            </div>
          </header>
          <div class="sd-board">
            <div class="sd-case-label">Evidence shadow</div>
            <div class="sd-shadow-slot"></div>
            <div class="sd-round-track" aria-live="polite"></div>
            <div class="sd-choices-label">Pick the real picture</div>
            <div class="sd-choices"></div>
          </div>
        `;

        stage.appendChild(arena);
        renderLevelHeader(arena, planIndex, '', () => openHub(stage));

        const shadowSlot = arena.querySelector('.sd-shadow-slot');
        const choicesEl = arena.querySelector('.sd-choices');
        const roundTrack = arena.querySelector('.sd-round-track');

        let roundIdx = 0;
        let roundBusy = false;
        let levelDone = false;

        function updateTrack() {
          const shown = Math.min(roundIdx + 1, plan.rounds);
          roundTrack.innerHTML =
            '<span class="sd-track-text">Clue ' + shown + ' / ' + plan.rounds + '</span>';
        }

        function finishLevel() {
          if (levelDone) return;
          levelDone = true;
          const isFinal = planIndex >= LEVEL_COUNT - 1;
          showLevelComplete(arena, {
            levelIndex: planIndex,
            gameId: GAME_ID,
            title: zone.complete,
            message: t('wonderful'),
            isFinal,
            onHub: () => openHub(stage),
            onNext: () => {
              if (isFinal) finishGame(arena, 3);
              else play(stage, planIndex + 1);
            }
          });
        }

        function showRound() {
          if (roundIdx >= plan.rounds) {
            finishLevel();
            return;
          }

          roundBusy = false;
          const correct = roundItems[roundIdx];
          const pool = ITEMS.filter((x) => x.emoji !== correct.emoji);
          const distractors = S().shuffle(pool).slice(0, plan.choices - 1);
          const choices = S().shuffle([correct, ...distractors]);

          shadowSlot.innerHTML = '';
          shadowSlot.classList.remove('sd-lit');

          const plate = document.createElement('div');
          plate.className = 'sd-shadow-plate';
          plate.setAttribute('aria-label', 'Shadow shape');
          plate.innerHTML = '<span class="sd-shadow-emoji">' + correct.emoji + '</span>';
          shadowSlot.appendChild(plate);

          choicesEl.innerHTML = '';
          choices.forEach((c) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'sd-pick';
            btn.style.setProperty('--pick-bg', c.bg);
            btn.setAttribute('aria-label', c.name);
            btn.innerHTML = '<span class="sd-pick-emoji">' + c.emoji + '</span>';

            btn.addEventListener('click', () => {
              if (levelDone || roundBusy) return;
              A().click();

              if (c.emoji === correct.emoji) {
                roundBusy = true;
                plate.classList.add('sd-solved');
                plate.style.setProperty('--pick-bg', c.bg);
                shadowSlot.classList.add('sd-lit');
                sound('success');

                const r = plate.getBoundingClientRect();
                try {
                  S().burstParticles(r.left + r.width / 2, r.top + r.height / 2, ['⭐', c.emoji, '🔍', '✨'], 12);
                } catch (e) {}

                try {
                  if (S().showFeedback) S().showFeedback(arena, t('wonderful'), true);
                } catch (e) {}

                roundIdx++;
                updateTrack();
                safeTimeout(() => showRound(), 720);
              } else {
                celebrateEl(btn, 'wiggle');
                try {
                  if (S().showFeedback) S().showFeedback(arena, t('try_again'), false);
                } catch (e) {}
              }
            });

            choicesEl.appendChild(btn);
          });

          updateTrack();
        }

        showRound();
      }
    }
  });
})();