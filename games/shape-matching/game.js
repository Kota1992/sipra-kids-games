(function () {
  'use strict';

  const {
    S, t, A, register, trackCleanup, finishGame,
    LEVEL_COUNT, startWithLevels, createLevelHub, showLevelComplete, renderLevelHeader,
    safeTimeout
  } = window.SiPraGameKit;

  const GAME_ID = 'shape-matching';

  /** 10 genuinely progressive levels across 4 themes */
  const LEVEL_PLAN = [
    { theme: 0, shapes: ['circle', 'square'] },
    { theme: 0, shapes: ['circle', 'square', 'triangle'] },
    { theme: 0, shapes: ['circle', 'square', 'triangle', 'star'] },
    { theme: 1, shapes: ['circle', 'square', 'triangle'] },
    { theme: 1, shapes: ['circle', 'square', 'triangle', 'rectangle'] },
    { theme: 2, shapes: ['circle', 'square', 'triangle', 'diamond'] },
    { theme: 2, shapes: ['circle', 'square', 'star', 'heart'] },
    { theme: 2, shapes: ['circle', 'triangle', 'rectangle', 'diamond', 'heart'] },
    { theme: 3, shapes: ['circle', 'square', 'triangle', 'star', 'diamond'] },
    { theme: 3, shapes: ['circle', 'square', 'triangle', 'star', 'rectangle', 'heart'] }
  ];

  const SHAPES = [
    { type: 'circle', color: '#FF3B5C', soft: '#FFE4EA', emoji: '🔴', name: 'Circle' },
    { type: 'square', color: '#2EB7F5', soft: '#E0F5FF', emoji: '🟦', name: 'Square' },
    { type: 'triangle', color: '#2ED67B', soft: '#E0FBEB', emoji: '🔺', name: 'Triangle' },
    { type: 'star', color: '#FFC021', soft: '#FFF4CC', emoji: '⭐', name: 'Star' },
    { type: 'rectangle', color: '#FF8A1F', soft: '#FFE8D1', emoji: '🟧', name: 'Rectangle' },
    { type: 'diamond', color: '#A85BE8', soft: '#F0E0FF', emoji: '🔷', name: 'Diamond' },
    { type: 'heart', color: '#FF5CA8', soft: '#FFE0F0', emoji: '💖', name: 'Heart' }
  ];

  const THEMES = [
    {
      id: 'garden',
      title: 'Shape Garden',
      subtitle: "Let's help the shapes find their homes!",
      progressLabel: 'Garden progress',
      trayLabel: 'Pick a shape',
      mascot: '🐰',
      mascotTip: 'You can do it!',
      count: 3,
      completeTitle: 'Garden is blooming!',
      completeText: 'Every shape found a cozy home!',
      nextLabel: 'Next adventure',
      particles: ['🌼', '🌻', '✨', '🍃']
    },
    {
      id: 'train',
      title: 'Shape Train',
      subtitle: 'Load every shape onto the train!',
      progressLabel: 'Train progress',
      trayLabel: 'Grab a shape',
      mascot: '🚂',
      mascotTip: 'All aboard!',
      count: 4,
      completeTitle: 'Train is ready!',
      completeText: 'The shape train is full and happy!',
      nextLabel: 'Next adventure',
      particles: ['🚂', '⭐', '✨', '🎈']
    },
    {
      id: 'town',
      title: 'Shape Town',
      subtitle: 'Deliver shapes to their houses!',
      progressLabel: 'Town progress',
      trayLabel: 'Choose a shape',
      mascot: '🐻',
      mascotTip: 'Knock knock!',
      count: 4,
      completeTitle: 'Town is happy!',
      completeText: 'Every house got the right shape!',
      nextLabel: 'Next adventure',
      particles: ['🏠', '⭐', '✨', '🎉']
    },
    {
      id: 'space',
      title: 'Shape Space',
      subtitle: 'Send shapes into their UFOs!',
      progressLabel: 'Mission progress',
      trayLabel: 'Launch a shape',
      mascot: '👨‍🚀',
      mascotTip: 'Blast off!',
      count: 5,
      completeTitle: 'Mission complete!',
      completeText: 'The UFOs are full of shapes!',
      nextLabel: 'Finish',
      particles: ['🚀', '⭐', '✨', '🪐']
    }
  ];

  const HOUSE_COLORS = ['#FF5A6A', '#3B9BFF', '#3DCF7A', '#FFC021'];

  function sound(name) {
    try {
      const audio = A();
      if (audio && typeof audio[name] === 'function') audio[name]();
    } catch (e) {}
  }

  function outlineShape(type, color, size) {
    const s = size || 72;
    const stroke = color || '#FFFFFF';
    const common = `fill="none" stroke="${stroke}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"`;
    const shapes = {
      circle: `<circle cx="${s / 2}" cy="${s / 2}" r="${s / 2 - 8}" ${common}/>`,
      square: `<rect x="10" y="10" width="${s - 20}" height="${s - 20}" rx="10" ${common}/>`,
      triangle: `<polygon points="${s / 2},10 ${s - 8},${s - 10} 8,${s - 10}" ${common}/>`,
      rectangle: `<rect x="8" y="${s * 0.28}" width="${s - 16}" height="${s * 0.44}" rx="10" ${common}/>`,
      star: `<polygon points="${s / 2},8 ${s * 0.61},${s * 0.35} ${s - 8},${s * 0.38} ${s * 0.68},${s * 0.62} ${s * 0.78},${s - 6} ${s / 2},${s * 0.72} ${s * 0.22},${s - 6} ${s * 0.32},${s * 0.62} 8,${s * 0.38} ${s * 0.39},${s * 0.35}" ${common}/>`,
      diamond: `<polygon points="${s / 2},8 ${s - 10},${s / 2} ${s / 2},${s - 8} 10,${s / 2}" ${common}/>`,
      heart: `<path d="M${s / 2},${s * 0.82} C${s * 0.2},${s * 0.6} ${s * 0.1},${s * 0.36} ${s * 0.28},${s * 0.22} C${s * 0.4},${s * 0.12} ${s * 0.48},${s * 0.24} ${s / 2},${s * 0.32} C${s * 0.52},${s * 0.24} ${s * 0.6},${s * 0.12} ${s * 0.72},${s * 0.22} C${s * 0.9},${s * 0.36} ${s * 0.8},${s * 0.6} ${s / 2},${s * 0.82} Z" ${common}/>`
    };
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" aria-hidden="true">${shapes[type] || shapes.circle}</svg>`;
  }

  function solidShape(type, color, size) {
    try {
      return S().svgShape(type, color, size || 78);
    } catch (e) {
      return outlineShape(type, color, size);
    }
  }

  register('shape-matching', {
    name: { en: 'Shape Matching', te: 'ఆకార మ్యాచ్' },
    desc: { en: 'Help the shapes find their homes', te: 'ఆకారాలకు ఇల్లు కనుగొనండి' },
    icon: '🌻',
    cat: 'colors',
    introKey: 'g1_intro',

    start(stage) {
      startWithLevels(stage, '🌻', 'g1_intro', {
        gameId: GAME_ID,
        title: 'Shape Town',
        subtitle: 'Pick a level — help shapes find home!',
        emoji: '🏡',
        themeClass: 'shape-hub'
      }, (st, lv) => play(st, lv));

      function openHub(st) {
        createLevelHub(st, {
          gameId: GAME_ID,
          title: 'Shape Town',
          subtitle: 'Pick a level — help shapes find home!',
          emoji: '🏡',
          themeClass: 'shape-hub',
          onPlay(lv) { play(st, lv); }
        });
      }

      function play(stage, planIndex) {
        stage.innerHTML = '';

        const arena = document.createElement('div');
        arena.className = 'gp-arena shape-game theme-garden';

        arena.innerHTML = `
          <div class="sg-bg" aria-hidden="true">
            <div class="sg-bg-sky"></div>
            <div class="sg-bg-sun">☀️</div>
            <div class="sg-bg-cloud c1">☁️</div>
            <div class="sg-bg-cloud c2">☁️</div>
            <div class="sg-bg-ground"></div>
            <div class="sg-bg-fence"></div>
            <div class="sg-bg-flowers"></div>
            <div class="sg-bg-tracks"></div>
            <div class="sg-bg-stars"></div>
            <div class="sg-bg-planet">🪐</div>
          </div>

          <header class="sg-top">
            <div class="sg-heading">
              <h2 class="sg-title">Shape Garden</h2>
              <p class="sg-subtitle">Let's help the shapes find their homes!</p>
            </div>
            <div class="sg-meta">
              <div class="sg-level-pill">Level <span class="sg-level-num">1</span></div>
              <div class="sg-stars" aria-label="Progress">
                <span class="sg-star">⭐</span>
                <span class="sg-star">⭐</span>
                <span class="sg-star">⭐</span>
                <span class="sg-star">⭐</span>
              </div>
            </div>
          </header>

          <div class="sg-play">
            <div class="sg-mascot" aria-hidden="true">
              <div class="sg-mascot-bubble">You can do it!</div>
              <div class="sg-mascot-face">🐰</div>
            </div>
            <div class="sg-board">
              <div class="sg-homes"></div>
            </div>
          </div>

          <section class="sg-tray" aria-label="Shapes">
            <div class="sg-tray-label">Pick a shape</div>
            <div class="sg-pieces"></div>
          </section>
        `;

        stage.appendChild(arena);
        renderLevelHeader(arena, planIndex, '', () => openHub(stage));

        const titleEl = arena.querySelector('.sg-title');
        const subtitleEl = arena.querySelector('.sg-subtitle');
        const levelNum = arena.querySelector('.sg-level-num');
        const stars = arena.querySelectorAll('.sg-star');
        const mascotFace = arena.querySelector('.sg-mascot-face');
        const mascotBubble = arena.querySelector('.sg-mascot-bubble');
        const trayLabel = arena.querySelector('.sg-tray-label');
        const homes = arena.querySelector('.sg-homes');
        const pieces = arena.querySelector('.sg-pieces');
        const board = arena.querySelector('.sg-board');

        const plan = LEVEL_PLAN[planIndex] || LEVEL_PLAN[0];
        let themeIndex = plan.theme;
        let matched = 0;
        let levelShapes = [];
        let slots = {};
        let levelToken = 0;
        let levelFinished = false;

        function theme() {
          return THEMES[themeIndex] || THEMES[0];
        }

        function updateStars() {
          const total = levelShapes.length || 1;
          const lit = matched;
          stars.forEach((star, i) => {
            // 4 stars represent level milestones; light by fill ratio
            const threshold = ((i + 1) / stars.length) * total;
            star.classList.toggle('on', lit >= threshold || (lit > 0 && i < Math.ceil((lit / total) * stars.length)));
          });
        }

        function applyTheme() {
          const th = theme();
          THEMES.forEach(t => arena.classList.remove('theme-' + t.id));
          arena.classList.add('theme-' + th.id);
          board.className = 'sg-board sg-board-' + th.id;
          homes.className = 'sg-homes sg-homes-' + th.id;

          titleEl.textContent = th.title;
          subtitleEl.textContent = th.subtitle;
          levelNum.textContent = String(planIndex + 1);
          mascotFace.textContent = th.mascot;
          mascotBubble.textContent = th.mascotTip;
          trayLabel.textContent = th.trayLabel;
        }

        function createHome(shape, index) {
          const th = theme();
          const home = document.createElement('div');
          home.className = 'sg-home drop-target sg-home-' + th.id;
          home.dataset.type = shape.type;
          home.style.setProperty('--shape-color', shape.color);
          home.style.setProperty('--shape-soft', shape.soft);
          home.style.setProperty('--house-color', HOUSE_COLORS[index % HOUSE_COLORS.length]);

          if (th.id === 'garden') {
            home.innerHTML = `
              <div class="sg-pad">
                <span class="sg-leaf">🍃</span>
                <div class="sg-nest">${outlineShape(shape.type, '#FFFFFF', 70)}</div>
                <div class="sg-home-check">✓</div>
              </div>
            `;
          } else if (th.id === 'train') {
            home.innerHTML = `
              <div class="sg-car">
                <div class="sg-car-body">
                  <div class="sg-nest">${outlineShape(shape.type, '#FFFFFF', 58)}</div>
                  <div class="sg-home-check">✓</div>
                </div>
                <div class="sg-wheels"><span></span><span></span></div>
              </div>
            `;
          } else if (th.id === 'town') {
            home.innerHTML = `
              <div class="sg-house">
                <div class="sg-roof"></div>
                <div class="sg-house-body">
                  <div class="sg-nest">${outlineShape(shape.type, shape.color, 52)}</div>
                  <div class="sg-home-check">✓</div>
                </div>
              </div>
            `;
          } else {
            home.innerHTML = `
              <div class="sg-ufo">
                <div class="sg-dome">
                  <div class="sg-nest">${outlineShape(shape.type, shape.color, 48)}</div>
                  <div class="sg-home-check">✓</div>
                </div>
                <div class="sg-saucer"></div>
                <div class="sg-beam"></div>
              </div>
            `;
          }

          return home;
        }

        function createPiece(shape) {
          const piece = document.createElement('div');
          piece.className = 'sg-piece';
          piece.dataset.type = shape.type;
          piece.setAttribute('aria-label', shape.name);
          piece.style.setProperty('--shape-color', shape.color);

          piece.innerHTML = `
            <div class="sg-piece-art">${solidShape(shape.type, shape.color, 76)}</div>
          `;

          return piece;
        }

        function celebrate(shape, home) {
          const rect = home.getBoundingClientRect();
          try {
            S().burstParticles(
              rect.left + rect.width / 2,
              rect.top + rect.height / 2,
              theme().particles.concat([shape.emoji]),
              12
            );
          } catch (e) {}
        }

        function completeLevel(token) {
          if (token !== levelToken || levelFinished) return;
          levelFinished = true;

          const th = theme();
          const isFinal = planIndex >= LEVEL_COUNT - 1;
          const nextIndex = planIndex + 1;

          showLevelComplete(arena, {
            levelIndex: planIndex,
            gameId: GAME_ID,
            title: th.completeTitle,
            message: th.completeText,
            isFinal,
            onHub: () => openHub(stage),
            onNext: () => {
              if (isFinal) {
                finishGame(arena, 3);
              } else {
                play(stage, nextIndex);
              }
            }
          });
        }

        function matchShape(shape, piece, home, token) {
          if (
            token !== levelToken ||
            levelFinished ||
            piece._matched ||
            home.classList.contains('is-filled')
          ) return;

          piece._matched = true;
          piece._dragDisabled = true;
          piece.style.pointerEvents = 'none';
          piece.classList.add('is-matched');

          home.classList.add('is-filled');

          try {
            S().snapTo(piece, home);
          } catch (e) {}

          const nest = home.querySelector('.sg-nest');
          if (nest) {
            nest.innerHTML = solidShape(shape.type, shape.color, 64);
          }

          matched++;
          updateStars();
          celebrate(shape, home);
          sound('success');

          if (matched === levelShapes.length) {
            safeTimeout(() => completeLevel(token), 650);
          }
        }

        function startLevel() {
          levelToken++;
          const token = levelToken;

          matched = 0;
          levelFinished = false;
          slots = {};

          const th = theme();
          levelShapes = plan.shapes
            .map(type => SHAPES.find(s => s.type === type))
            .filter(Boolean);
          applyTheme();

          homes.innerHTML = '';
          pieces.innerHTML = '';

          // Train: prepend cute locomotive face as decoration
          if (th.id === 'train') {
            const engine = document.createElement('div');
            engine.className = 'sg-engine';
            engine.setAttribute('aria-hidden', 'true');
            engine.innerHTML = `
              <div class="sg-engine-face">😊</div>
              <div class="sg-engine-body">🚂</div>
            `;
            homes.appendChild(engine);
          }

          S().shuffle(levelShapes.slice()).forEach((shape, i) => {
            const home = createHome(shape, i);
            homes.appendChild(home);
            slots[shape.type] = home;
          });

          S().shuffle(levelShapes.slice()).forEach(shape => {
            const piece = createPiece(shape);
            pieces.appendChild(piece);

            const cleanup = S().enableDrag(piece, {
              onEnd(el) {
                if (token !== levelToken || el._matched || levelFinished) return;

                const target = slots[el.dataset.type];

                if (
                  target &&
                  !target.classList.contains('is-filled') &&
                  S().hits(el, target, 75)
                ) {
                  matchShape(shape, el, target, token);
                } else {
                  S().returnDrag(el);
                  el.classList.remove('sg-piece-wrong');
                  void el.offsetWidth;
                  el.classList.add('sg-piece-wrong');

                  try {
                    if (S().showFeedback) {
                      S().showFeedback(arena, t('try_again'), false);
                    }
                  } catch (e) {}
                }
              }
            });

            if (typeof cleanup === 'function') {
              trackCleanup(cleanup);
            }
          });

          updateStars();
        }

        startLevel();
      }
    }
  });
})();
