(function () {
  'use strict';

  const {
    S, t, A, register,
    celebrateEl, finishGame,
    LEVEL_COUNT, startWithLevels, createLevelHub,
    showLevelComplete, renderLevelHeader,
    safeTimeout, safeInterval
  } = window.SiPraGameKit;

  const GAME_ID = 'missing-shape';

  /** 10 unique pattern puzzles */
  const LEVELS = [
    { seq: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', choices: ['🔴', '🟢', '🟡'], name: 'Color hop' },
    { seq: ['⭐', '⭐', '🌙', '⭐', '⭐'], answer: '🌙', choices: ['🌙', '⭐', '☀️'], name: 'Star trail' },
    { seq: ['🐶', '🐱', '🐶', '🐱'], answer: '🐶', choices: ['🐶', '🐸', '🐱'], name: 'Pet parade' },
    { seq: ['🍎', '🍌', '🍇', '🍎', '🍌'], answer: '🍇', choices: ['🍇', '🍎', '🍊'], name: 'Fruit freight' },
    { seq: ['🔺', '🟦', '🔺', '🟦'], answer: '🔺', choices: ['🔺', '🟦', '⭕'], name: 'Shape switch' },
    { seq: ['1️⃣', '2️⃣', '3️⃣', '1️⃣', '2️⃣'], answer: '3️⃣', choices: ['3️⃣', '4️⃣', '1️⃣'], name: 'Number line' },
    { seq: ['🌸', '🌼', '🌸', '🌼', '🌸'], answer: '🌼', choices: ['🌼', '🌸', '🌺'], name: 'Garden cars' },
    { seq: ['🟥', '🟨', '🟩', '🟥', '🟨'], answer: '🟩', choices: ['🟩', '🟦', '🟥'], name: 'Rainbow rails' },
    { seq: ['🐧', '🐧', '🦭', '🐧', '🐧', '🦭'], answer: '🐧', choices: ['🐧', '🦭', '🐻‍❄️'], name: 'Polar express' },
    { seq: ['🔵', '🔵', '🟡', '🔵', '🔵', '🟡', '🔵'], answer: '🔵', choices: ['🔵', '🟡', '🟢'], name: 'Grand finale' }
  ];

  register('missing-shape', {
    name: { en: 'Missing Shape', te: 'మిస్సింగ్ ఆకారం' },
    desc: { en: 'What comes next in the pattern?', te: 'ప్యాటర్న్‌లో తర్వాత ఏమి వస్తుంది?' },
    icon: '❓',
    cat: 'colors',
    introKey: 'g4_intro',

    start(stage) {
      startWithLevels(stage, '❓', 'g4_intro', {
        gameId: GAME_ID,
        title: 'Pattern Express',
        subtitle: 'All aboard — 10 patterns!',
        emoji: '🚂',
        themeClass: 'mshape-hub'
      }, (st, lv) => play(st, lv));

      function openHub(st) {
        createLevelHub(st, {
          gameId: GAME_ID,
          title: 'Pattern Express',
          subtitle: 'All aboard — 10 patterns!',
          emoji: '🚂',
          themeClass: 'mshape-hub',
          onPlay(lv) { play(st, lv); }
        });
      }

      function play(stage, levelIndex) {
        const puzzle = LEVELS[levelIndex] || LEVELS[0];
        stage.innerHTML = '';

        const arena = document.createElement('div');
        arena.className = 'gp-arena mshape-game';

        arena.innerHTML = `
          <div class="msg-bg" aria-hidden="true">
            <div class="msg-sky"></div>
            <div class="msg-hills"></div>
            <div class="msg-track"></div>
            <div class="msg-cloud msg-c1"></div>
            <div class="msg-cloud msg-c2"></div>
          </div>
          <div class="msg-conductor" aria-hidden="true">
            <span class="msg-cap">🧢</span>
            <span class="msg-face">🧑‍✈️</span>
            <span class="msg-tip">What comes next?</span>
          </div>
        `;

        const titleEl = document.createElement('div');
        titleEl.className = 'msg-title gp-title';
        titleEl.textContent = t('missing_shape');

        const subEl = document.createElement('div');
        subEl.className = 'msg-sub';
        subEl.textContent = puzzle.name;

        const trainWrap = document.createElement('div');
        trainWrap.className = 'msg-train-wrap';
        trainWrap.innerHTML = '<div class="msg-engine">🚂</div>';

        const train = document.createElement('div');
        train.className = 'msg-train';

        puzzle.seq.forEach((item, i) => {
          const car = document.createElement('div');
          car.className = 'msg-car';
          car.textContent = item;
          car.style.animationDelay = (i * 0.06) + 's';
          train.appendChild(car);
        });

        const mystery = document.createElement('div');
        mystery.className = 'msg-car msg-mystery';
        mystery.textContent = '?';
        train.appendChild(mystery);

        trainWrap.appendChild(train);

        const choices = document.createElement('div');
        choices.className = 'msg-choices';

        const tipEl = arena.querySelector('.msg-tip');
        let solved = false;

        S().shuffle(puzzle.choices).forEach(choice => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'msg-choice';
          btn.textContent = choice;
          btn.addEventListener('click', () => {
            if (solved) return;
            if (choice === puzzle.answer) {
              solved = true;
              mystery.textContent = choice;
              mystery.classList.add('solved');
              A().success();
              const r = mystery.getBoundingClientRect();
              S().burstParticles(r.left + r.width / 2, r.top + r.height / 2,
                ['⭐', choice, '✨', '🚂'], 12);
              try { S().showFeedback(arena, t('amazing'), true); } catch (e) {}
              tipEl.textContent = 'Choo choo! Great job!';

              safeTimeout(() => {
                const isFinal = levelIndex >= LEVEL_COUNT - 1;
                showLevelComplete(arena, {
                  levelIndex,
                  gameId: GAME_ID,
                  title: isFinal ? 'Express champion!' : 'Level complete!',
                  message: 'The pattern train keeps rolling!',
                  isFinal,
                  onHub: () => openHub(stage),
                  onNext: () => {
                    if (isFinal) finishGame(arena, 3);
                    else play(stage, levelIndex + 1);
                  }
                });
              }, 750);
            } else {
              celebrateEl(btn, 'wiggle');
              try { S().showFeedback(arena, t('try_again'), false); } catch (e) {}
              tipEl.textContent = 'Look again at the pattern!';
            }
          });
          choices.appendChild(btn);
        });

        arena.insertBefore(titleEl, arena.firstChild.nextSibling);
        arena.insertBefore(subEl, arena.querySelector('.msg-conductor'));
        arena.appendChild(trainWrap);
        arena.appendChild(choices);

        renderLevelHeader(arena, levelIndex, '', () => openHub(stage));

        let smokeT = 0;
        safeInterval(() => {
          smokeT++;
          const engine = arena.querySelector('.msg-engine');
          if (engine) engine.style.transform = `translateY(${Math.sin(smokeT * 0.15) * 2}px)`;
        }, 90);

        stage.appendChild(arena);
      }
    }
  });
})();