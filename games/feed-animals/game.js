(function () {
  'use strict';

  const {
    S, t, A, register,
    flyEmoji, celebrateEl, finishGame,
    LEVEL_COUNT, startWithLevels, createLevelHub,
    showLevelComplete, renderLevelHeader, progressDots,
    safeTimeout, safeInterval
  } = window.SiPraGameKit;

  const GAME_ID = 'feed-animals';

  const PAIRS = [
    { animal: '🐵', food: '🍌', bg: '#D7CCC8', name: { en: 'Monkey', te: 'కోతి' } },
    { animal: '🐰', food: '🥕', bg: '#F8BBD0', name: { en: 'Rabbit', te: 'కుందేలు' } },
    { animal: '🐄', food: '🌿', bg: '#C8E6C9', name: { en: 'Cow', te: 'ఆవు' } },
    { animal: '🐘', food: '🍉', bg: '#B0BEC5', name: { en: 'Elephant', te: 'ఏనుగు' } },
    { animal: '🐶', food: '🦴', bg: '#FFE0B2', name: { en: 'Dog', te: 'కుక్క' } },
    { animal: '🐱', food: '🐟', bg: '#F8BBD0', name: { en: 'Cat', te: 'పిల్లి' } },
    { animal: '🐔', food: '🌽', bg: '#FFF9C4', name: { en: 'Chicken', te: 'కోడి' } },
    { animal: '🐴', food: '🍎', bg: '#FFCCBC', name: { en: 'Horse', te: 'గుర్రం' } },
    { animal: '🐼', food: '🎋', bg: '#E8F5E9', name: { en: 'Panda', te: 'పాండా' } },
    { animal: '🦆', food: '🍞', bg: '#FFFDE7', name: { en: 'Duck', te: 'బాతు' } }
  ];

  /** 10 levels — rounds per level & food choices */
  const LEVELS = [
    { rounds: 1, choices: 2, title: 'Morning snack' },
    { rounds: 1, choices: 3, title: 'Barn breakfast' },
    { rounds: 2, choices: 3, title: 'Hayride lunch' },
    { rounds: 2, choices: 3, title: 'Pond picnic' },
    { rounds: 2, choices: 3, title: 'Stable treats' },
    { rounds: 3, choices: 3, title: 'Farm feast' },
    { rounds: 3, choices: 3, title: 'Harvest helper' },
    { rounds: 3, choices: 3, title: 'Sunny supper' },
    { rounds: 4, choices: 3, title: 'Barnyard banquet' },
    { rounds: 4, choices: 3, title: 'Happy harvest!' }
  ];

  function pairName(p) {
    const lang = S().state.language || 'en';
    return p.name[lang] || p.name.en;
  }

  register('feed-animals', {
    name: { en: 'Feed the Animals', te: 'జంతువులకు ఆహారం' },
    desc: { en: 'Give each animal the yummy food', te: 'ప్రతి జంతువుకు రుచికరమైన ఆహారం' },
    icon: '🍌',
    cat: 'animals',
    introKey: 'g6_intro',

    start(stage) {
      startWithLevels(stage, '🍌', 'g6_intro', {
        gameId: GAME_ID,
        title: 'Happy Animal Farm',
        subtitle: '10 feeding chores!',
        emoji: '🏡',
        themeClass: 'feed-hub'
      }, (st, lv) => play(st, lv));

      function openHub(st) {
        createLevelHub(st, {
          gameId: GAME_ID,
          title: 'Happy Animal Farm',
          subtitle: '10 feeding chores!',
          emoji: '🏡',
          themeClass: 'feed-hub',
          onPlay(lv) { play(st, lv); }
        });
      }

      function play(stage, levelIndex) {
        const plan = LEVELS[levelIndex] || LEVELS[0];
        const queue = S().shuffle(PAIRS).slice(0, plan.rounds);
        let round = 0;
        let busy = false;
        let levelDone = false;

        stage.innerHTML = '';
        const arena = document.createElement('div');
        arena.className = 'gp-arena feed-game';

        arena.innerHTML = `
          <div class="fdg-bg" aria-hidden="true">
            <div class="fdg-sky"></div>
            <div class="fdg-hill"></div>
            <div class="fdg-barn">🏠</div>
            <div class="fdg-fence"></div>
            <div class="fdg-hay fdg-h1">🌾</div>
            <div class="fdg-hay fdg-h2">🌾</div>
          </div>
          <div class="fdg-farmer" aria-hidden="true">
            <span class="fdg-farmer-face">👨‍🌾</span>
            <span class="fdg-farmer-tip">Tap the right food!</span>
          </div>
        `;

        const titleEl = document.createElement('div');
        titleEl.className = 'fdg-title gp-title';
        titleEl.textContent = t('feed_animals');

        const choreEl = document.createElement('div');
        choreEl.className = 'fdg-chore';
        choreEl.textContent = plan.title;

        const dotsWrap = document.createElement('div');
        dotsWrap.className = 'fdg-dots dots-wrap';

        const hero = document.createElement('div');
        hero.className = 'fdg-hero';

        const tray = document.createElement('div');
        tray.className = 'fdg-tray';

        const tipEl = arena.querySelector('.fdg-farmer-tip');

        function updateDots() {
          dotsWrap.innerHTML = progressDots(plan.rounds, round);
        }

        function renderRound() {
          if (round >= plan.rounds) {
            if (levelDone) return;
            levelDone = true;
            safeTimeout(() => {
              const isFinal = levelIndex >= LEVEL_COUNT - 1;
              showLevelComplete(arena, {
                levelIndex,
                gameId: GAME_ID,
                title: isFinal ? 'Farm champion!' : 'Level complete!',
                message: 'Every animal is full and happy!',
                isFinal,
                onHub: () => openHub(stage),
                onNext: () => {
                  if (isFinal) finishGame(arena, 3);
                  else play(stage, levelIndex + 1);
                }
              });
            }, 400);
            return;
          }

          busy = false;
          const current = queue[round];
          const others = S().shuffle(PAIRS.filter(p => p.food !== current.food))
            .slice(0, plan.choices - 1)
            .map(p => p.food);
          const foods = S().shuffle([current.food, ...others]);

          hero.innerHTML = `
            <div class="fdg-thought">
              <span class="fdg-thought-bubble">${current.food}</span>
            </div>
            <div class="fdg-buddy" style="--buddy-bg:${current.bg}">
              <div class="fdg-buddy-face">${current.animal}</div>
              <div class="fdg-buddy-name">${pairName(current)}</div>
            </div>
          `;

          tray.innerHTML = '';
          foods.forEach(foodEmoji => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'fdg-food';
            chip.textContent = foodEmoji;

            const onPick = (fromEl) => {
              if (busy) return;
              const buddy = hero.querySelector('.fdg-buddy-face');
              if (foodEmoji === current.food) {
                busy = true;
                flyEmoji(foodEmoji, fromEl, buddy, () => {
                  buddy.textContent = current.animal + '😋';
                  celebrateEl(hero.querySelector('.fdg-buddy'), 'friend-cheer');
                  A().success();
                  const r = buddy.getBoundingClientRect();
                  S().burstParticles(r.left + r.width / 2, r.top + r.height / 2,
                    ['💖', '⭐', foodEmoji], 12);
                  try { S().pointsPopup(1, r.left + r.width / 2, r.top); } catch (e) {}
                  tipEl.textContent = 'Yummy!';
                  round++;
                  updateDots();
                  safeTimeout(renderRound, 800);
                });
              } else {
                celebrateEl(chip, 'wiggle');
                celebrateEl(hero.querySelector('.fdg-buddy'), 'wiggle');
                try { S().showFeedback(arena, t('try_again'), false); } catch (e) {}
                tipEl.textContent = 'That friend wants something else!';
              }
            };

            chip.addEventListener('pointerdown', e => {
              e.preventDefault();
              if (busy || levelDone) return;

              if (e.pointerType !== 'touch') {
                onPick(chip);
                return;
              }

              const startX = e.clientX;
              const startY = e.clientY;
              let dragGhost = document.createElement('div');
              dragGhost.className = 'fdg-drag-ghost';
              dragGhost.textContent = foodEmoji;
              dragGhost.style.left = startX + 'px';
              dragGhost.style.top = startY + 'px';
              document.body.appendChild(dragGhost);

              const move = (me) => {
                if (dragGhost) {
                  dragGhost.style.left = me.clientX + 'px';
                  dragGhost.style.top = me.clientY + 'px';
                }
              };
              const up = (ue) => {
                document.removeEventListener('pointermove', move);
                document.removeEventListener('pointerup', up);
                document.removeEventListener('pointercancel', up);
                if (dragGhost) {
                  dragGhost.remove();
                  dragGhost = null;
                }
                if (busy || levelDone) return;
                const moved = Math.hypot(ue.clientX - startX, ue.clientY - startY);
                if (moved < 20) {
                  onPick(chip);
                  return;
                }
                const buddy = hero.querySelector('.fdg-buddy');
                if (buddy) {
                  const br = buddy.getBoundingClientRect();
                  const pad = 44;
                  if (ue.clientX >= br.left - pad && ue.clientX <= br.right + pad &&
                      ue.clientY >= br.top - pad && ue.clientY <= br.bottom + pad) {
                    onPick(chip);
                  }
                }
              };
              document.addEventListener('pointermove', move);
              document.addEventListener('pointerup', up);
              document.addEventListener('pointercancel', up);
            });

            tray.appendChild(chip);
          });

          tipEl.textContent = `Feed the ${pairName(current)}!`;
          updateDots();
        }

        arena.insertBefore(titleEl, arena.querySelector('.fdg-farmer'));
        arena.insertBefore(choreEl, arena.querySelector('.fdg-farmer'));
        arena.appendChild(dotsWrap);
        arena.appendChild(hero);
        arena.appendChild(tray);

        renderLevelHeader(arena, levelIndex, '', () => openHub(stage));

        let hayT = 0;
        safeInterval(() => {
          hayT++;
          arena.querySelectorAll('.fdg-hay').forEach((el, i) => {
            el.style.transform = `rotate(${Math.sin(hayT * 0.1 + i) * 4}deg)`;
          });
        }, 120);

        updateDots();
        renderRound();
        stage.appendChild(arena);
      }
    }
  });
})();