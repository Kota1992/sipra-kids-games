(function () {
  'use strict';

  const {
    S, t, A, register,
    flyEmoji, progressDots, celebrateEl, finishGame,
    LEVEL_COUNT, startWithLevels, createLevelHub, showLevelComplete, renderLevelHeader,
    safeTimeout
  } = window.SiPraGameKit;

  const GAME_ID = 'color-sorting';

  const LEVEL_PLAN = [
    { rounds: 2, baskets: ['red', 'yellow'] },
    { rounds: 2, baskets: ['red', 'blue'] },
    { rounds: 3, baskets: ['red', 'yellow', 'green'] },
    { rounds: 3, baskets: ['blue', 'green', 'orange'] },
    { rounds: 4, baskets: ['red', 'yellow', 'green', 'blue'] },
    { rounds: 5, baskets: ['red', 'yellow', 'green', 'blue', 'orange'] },
    { rounds: 6, baskets: null },
    { rounds: 6, baskets: null },
    { rounds: 7, baskets: null },
    { rounds: 8, baskets: null }
  ];

  const TOYS = [
    { emoji: '🍎', color: 'red', heart: '❤️', name: 'Apple' },
    { emoji: '🚗', color: 'red', heart: '❤️', name: 'Car' },
    { emoji: '🍓', color: 'red', heart: '❤️', name: 'Strawberry' },
    { emoji: '🍌', color: 'yellow', heart: '💛', name: 'Banana' },
    { emoji: '🌟', color: 'yellow', heart: '💛', name: 'Star' },
    { emoji: '🍋', color: 'yellow', heart: '💛', name: 'Lemon' },
    { emoji: '🐸', color: 'green', heart: '💚', name: 'Frog' },
    { emoji: '🌳', color: 'green', heart: '💚', name: 'Tree' },
    { emoji: '🥦', color: 'green', heart: '💚', name: 'Broccoli' },
    { emoji: '🐳', color: 'blue', heart: '💙', name: 'Whale' },
    { emoji: '🦋', color: 'blue', heart: '💙', name: 'Butterfly' },
    { emoji: '🎈', color: 'blue', heart: '💙', name: 'Balloon' },
    { emoji: '🍊', color: 'orange', heart: '🧡', name: 'Orange' },
    { emoji: '🦊', color: 'orange', heart: '🧡', name: 'Fox' },
    { emoji: '🎃', color: 'orange', heart: '🧡', name: 'Pumpkin' },
    { emoji: '🍇', color: 'purple', heart: '💜', name: 'Grapes' },
    { emoji: '🦄', color: 'purple', heart: '💜', name: 'Unicorn' },
    { emoji: '🍆', color: 'purple', heart: '💜', name: 'Eggplant' }
  ];

  const BASKETS = [
    { id: 'red', name: 'RED', hex: '#FF4D6A', light: '#FFE0E6', heart: '❤️' },
    { id: 'yellow', name: 'YELLOW', hex: '#FFD12A', light: '#FFF4C2', heart: '💛' },
    { id: 'green', name: 'GREEN', hex: '#3DCF70', light: '#D8F8E4', heart: '💚' },
    { id: 'blue', name: 'BLUE', hex: '#3B9BFF', light: '#D8ECFF', heart: '💙' },
    { id: 'orange', name: 'ORANGE', hex: '#FF9A2E', light: '#FFE6C8', heart: '🧡' },
    { id: 'purple', name: 'PURPLE', hex: '#A85BE8', light: '#F0E0FF', heart: '💜' }
  ];

  function playSound(name) {
    try {
      const audio = A();
      if (audio && typeof audio[name] === 'function') audio[name]();
    } catch (e) {}
  }

  function shuffle(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  register('color-sorting', {
    name: { en: 'Color Sorting', te: 'రంగు వేరుచేయడం' },
    desc: {
      en: 'Put each toy into the matching color basket',
      te: 'ప్రతి బొమ్మను సరైన రంగు బుట్టలో వేయండి'
    },
    icon: '🧺',
    cat: 'colors',
    introKey: 'g2_intro',

    start(stage) {
      startWithLevels(stage, '🧺', 'g2_intro', {
        gameId: GAME_ID,
        title: 'Color Carnival',
        subtitle: '10 fun sorting levels!',
        emoji: '🎠',
        themeClass: 'cs-hub'
      }, (st, lv) => play(st, lv));

      function openHub(st) {
        createLevelHub(st, {
          gameId: GAME_ID,
          title: 'Color Carnival',
          subtitle: '10 fun sorting levels!',
          emoji: '🎠',
          themeClass: 'cs-hub',
          onPlay(lv) { play(st, lv); }
        });
      }

      function play(stage, planIndex) {
        const plan = LEVEL_PLAN[planIndex] || LEVEL_PLAN[0];
        const TOTAL = plan.rounds;
        const activeIds = plan.baskets || BASKETS.map(b => b.id);
        stage.innerHTML = '';

        const arena = document.createElement('div');
        arena.className = 'gp-arena color-arena';

        arena.innerHTML = `
          <div class="cs-bg" aria-hidden="true">
            <div class="cs-sky"></div>
            <div class="cs-rainbow"></div>
            <div class="cs-cloud cs-c1"></div>
            <div class="cs-cloud cs-c2"></div>
            <div class="cs-cloud cs-c3"></div>
            <div class="cs-tree cs-tree-l">🌳</div>
            <div class="cs-tree cs-tree-r">🌲</div>
            <div class="cs-cottage">
              <span class="cs-cottage-roof"></span>
              <span class="cs-cottage-body"></span>
            </div>
            <div class="cs-fence"></div>
            <div class="cs-grass"></div>
            <div class="cs-flowers"></div>
            <div class="cs-beam"></div>
          </div>

          <header class="cs-top">
            <div class="cs-brand">
              <div class="cs-palette" aria-hidden="true">🎨</div>
              <h2 class="cs-title">
                <span class="cs-title-a">Color</span>
                <span class="cs-title-b">Sorting</span>
              </h2>
            </div>
            <div class="cs-level-pill">Level <span class="cs-level-num">${planIndex + 1}</span> of ${LEVEL_COUNT}</div>
          </header>

          <div class="cs-banner">
            Put each toy in the matching color basket!
          </div>

          <div class="cs-progress" role="status" aria-live="polite">
            <span class="cs-progress-star">⭐</span>
            <span class="cs-progress-count">Sorted: 0 / ${TOTAL}</span>
            <div class="cs-progress-dots">${progressDots(TOTAL, 0)}</div>
          </div>

          <section class="cs-stage">
            <div class="cs-mascot" aria-hidden="true">
              <div class="cs-elephant">
                <div class="cs-hat">🧢</div>
                <div class="cs-elephant-face">🐘</div>
                <div class="cs-overalls">⭐</div>
              </div>
              <div class="cs-point-hand">👉</div>
            </div>

            <div class="cs-spotlight-wrap">
              <div class="cs-spotlight">
                <div class="cs-spotlight-rim"></div>
                <div class="cs-toy" aria-live="polite">
                  <span class="cs-toy-emoji">🍎</span>
                </div>
              </div>
              <div class="cs-toy-name">Apple</div>
            </div>

            <div class="cs-bubble">
              <p class="cs-bubble-text">Which color basket should it go in?</p>
            </div>
          </section>

          <section class="cs-table" aria-label="Color baskets">
            <div class="cs-basket-grid"></div>
          </section>
        `;

        stage.appendChild(arena);
        renderLevelHeader(arena, planIndex, '', () => openHub(stage));

        const toyEl = arena.querySelector('.cs-toy');
        const toyEmoji = arena.querySelector('.cs-toy-emoji');
        const toyName = arena.querySelector('.cs-toy-name');
        const progressCount = arena.querySelector('.cs-progress-count');
        const dotsWrap = arena.querySelector('.cs-progress-dots');
        const levelNum = arena.querySelector('.cs-level-num');
        const basketGrid = arena.querySelector('.cs-basket-grid');
        const spotlight = arena.querySelector('.cs-spotlight');
        const bubbleText = arena.querySelector('.cs-bubble-text');

        let round = 0;
        let busy = false;
        let current = null;

        const pool = activeIds.slice();
        const rawColors = [];
        for (let i = 0; i < TOTAL; i++) {
          rawColors.push(pool[i % pool.length]);
        }
        const roundColors = shuffle(rawColors);

        const basketElements = {};
        basketGrid.style.setProperty('--basket-cols', String(Math.min(activeIds.length, 6)));

        BASKETS.forEach(basket => {
          if (activeIds.indexOf(basket.id) < 0) return;
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'cs-basket';
          button.dataset.color = basket.id;
          button.style.setProperty('--basket-color', basket.hex);
          button.style.setProperty('--basket-light', basket.light);
          button.setAttribute('aria-label', `${basket.name} basket`);

          button.innerHTML = `
            <span class="cs-basket-handle"></span>
            <span class="cs-basket-body">
              <span class="cs-basket-weave"></span>
              <span class="cs-basket-shine"></span>
            </span>
            <span class="cs-basket-label">
              <span class="cs-basket-heart">${basket.heart}</span>
              <span class="cs-basket-name">${basket.name}</span>
            </span>
          `;

          basketElements[basket.id] = button;
          basketGrid.appendChild(button);

          button.addEventListener('pointerdown', event => {
            event.preventDefault();
            if (busy || !current) return;

            if (button.dataset.color === current.color) {
              handleCorrectAnswer(button);
            } else {
              handleWrongAnswer(button);
            }
          });
        });

        function updateProgress() {
          progressCount.textContent = `Sorted: ${round} / ${TOTAL}`;
          dotsWrap.innerHTML = progressDots(TOTAL, round);
          levelNum.textContent = String(planIndex + 1);
        }

        function showNextToy() {
          busy = false;

          const color = roundColors[round];
          const choices = TOYS.filter(toy => toy.color === color);
          current = choices[Math.floor(Math.random() * choices.length)];

          const meta = BASKETS.find(b => b.id === current.color);
          spotlight.style.setProperty('--toy-color', meta.hex);
          spotlight.style.setProperty('--toy-light', meta.light);

          toyEmoji.textContent = current.emoji;
          toyName.textContent = current.name;
          bubbleText.textContent = 'Which color basket should it go in?';

          toyEl.classList.remove('cs-toy-arrive');
          void toyEl.offsetWidth;
          toyEl.classList.add('cs-toy-arrive');

          basketGrid.querySelectorAll('.cs-basket').forEach(b => {
            b.classList.remove('cs-basket-hint', 'cs-basket-correct', 'cs-basket-wrong');
          });
        }

        function handleWrongAnswer(button) {
          playSound('gentle');

          button.classList.remove('cs-basket-wrong');
          void button.offsetWidth;
          button.classList.add('cs-basket-wrong');

          bubbleText.textContent = 'Oops! Try another basket!';

          try {
            S().showFeedback(arena, t('try_again'), false);
          } catch (e) {}

          safeTimeout(() => {
            if (!busy && current) {
              bubbleText.textContent = 'Which color basket should it go in?';
            }
          }, 900);
        }

        function handleCorrectAnswer(button) {
          if (busy || !current) return;
          busy = true;

          button.classList.add('cs-basket-correct');
          bubbleText.textContent = 'Yes! Perfect!';

          const matchedToy = current;

          try {
            flyEmoji(matchedToy.emoji, toyEl, button, () => {
              completeMatch(button, matchedToy);
            });
          } catch (e) {
            completeMatch(button, matchedToy);
          }
        }

        function completeMatch(button, matchedToy) {
          playSound('success');

          try {
            celebrateEl(button, 'cs-basket-cheer');
          } catch (e) {}

          const rect = button.getBoundingClientRect();

          try {
            S().burstParticles(
              rect.left + rect.width / 2,
              rect.top + rect.height / 2,
              [matchedToy.heart, '⭐', matchedToy.emoji, '✨', '🎉'],
              14
            );
          } catch (e) {}

          try {
            S().pointsPopup(1, rect.left + rect.width / 2, rect.top);
          } catch (e) {}

          round++;
          updateProgress();

          if (round >= TOTAL) {
            safeTimeout(() => {
              const isFinal = planIndex >= LEVEL_COUNT - 1;
              showLevelComplete(arena, {
                levelIndex: planIndex,
                gameId: GAME_ID,
                title: isFinal ? 'Carnival champion!' : 'Level complete!',
                message: 'Every toy found its basket!',
                isFinal,
                onHub: () => openHub(stage),
                onNext: () => {
                  if (isFinal) finishGame(arena, 3);
                  else play(stage, planIndex + 1);
                }
              });
            }, 650);
          } else {
            safeTimeout(showNextToy, 800);
          }
        }

        updateProgress();
        showNextToy();
      }
    }
  });
})();
