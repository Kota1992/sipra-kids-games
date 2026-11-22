/* Game 9: Jigsaw — Puzzle Adventure */
(function () {
  'use strict';

  const {
    S, t, A, register, trackCleanup, celebrateEl, finishGame,
    LEVEL_COUNT, startWithLevels, createLevelHub, showLevelComplete, renderLevelHeader,
    safeTimeout
  } = window.SiPraGameKit;

  const GAME_ID = 'jigsaw';

  const PUZZLES = [
    { cols: 2, rows: 1, bg: '#FFE082', label: 'Puppy Pals', pieces: ['🐶', '🐱'] },
    { cols: 2, rows: 2, bg: '#B3E5FC', label: 'City Wheels', pieces: ['🚗', '🚕', '🚙', '🚌'] },
    { cols: 2, rows: 2, bg: '#C8E6C9', label: 'Fruit Bowl', pieces: ['🍎', '🍊', '🍋', '🍌'] },
    { cols: 3, rows: 2, bg: '#FFCCBC', label: 'Berry Patch', pieces: ['🍓', '🫐', '🍇', '🍉', '🍒', '🥝'] },
    { cols: 2, rows: 3, bg: '#D1C4E9', label: 'Farm Friends', pieces: ['🐮', '🐷', '🐑', '🐔', '🐴', '🐰'] },
    { cols: 3, rows: 2, bg: '#80DEEA', label: 'Ocean Life', pieces: ['🐠', '🐙', '🦀', '🐡', '🦞', '🐬'] },
    { cols: 3, rows: 3, bg: '#CFD8DC', label: 'Space Trip', pieces: ['🚀', '🛸', '🌙', '⭐', '🪐', '👨‍🚀', '🛰️', '☄️', '🌟'] },
    { cols: 3, rows: 3, bg: '#F8BBD0', label: 'Flower Field', pieces: ['🌸', '🌺', '🌻', '🌷', '🌼', '🪻', '💐', '🌹', '🏵️'] },
    { cols: 4, rows: 2, bg: '#FFF9C4', label: 'Snack Time', pieces: ['🍕', '🍔', '🌮', '🍩', '🧁', '🍿', '🥪', '🍦'] },
    { cols: 3, rows: 3, bg: '#B39DDB', label: 'Rainbow World', pieces: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🌈', '✨', '🎨'] }
  ];

  function successSound() {
    try { A().success(); } catch (e) {}
  }

  register('jigsaw', {
    name: { en: 'Jigsaw Puzzles', te: 'పజిల్' },
    desc: { en: 'Build the cute picture', te: 'అందమైన చిత్రం కట్టండి' },
    icon: '🧩',
    cat: 'learning',
    introKey: 'g9_intro',

    start(stage) {
      startWithLevels(stage, '🧩', 'g9_intro', {
        gameId: GAME_ID,
        title: 'Puzzle Adventure',
        subtitle: 'Build 10 jigsaw pictures!',
        emoji: '🖼️',
        themeClass: 'jg-hub'
      }, (st, lv) => play(st, lv));

      function openHub(st) {
        createLevelHub(st, {
          gameId: GAME_ID,
          title: 'Puzzle Adventure',
          subtitle: 'Build 10 jigsaw pictures!',
          emoji: '🖼️',
          themeClass: 'jg-hub',
          onPlay(lv) { play(st, lv); }
        });
      }

      function play(stage, planIndex) {
        const L = PUZZLES[planIndex] || PUZZLES[0];
        const total = L.pieces.length;
        let placed = 0;
        let levelDone = false;

        stage.innerHTML = '';

        const arena = document.createElement('div');
        arena.className = 'gp-arena jg-arena';
        arena.innerHTML = `
          <div class="jg-scene" aria-hidden="true">
            <div class="jg-wall"></div>
            <div class="jg-shelf"></div>
            <div class="jg-frame-deco">🖼️</div>
          </div>

          <header class="jg-header">
            <div class="jg-brand">
              <span class="jg-brand-icon">🧩</span>
              <div>
                <h2 class="jg-title">${L.label}</h2>
                <p class="jg-sub">${t('puzzle') || 'Build the picture!'}</p>
              </div>
            </div>
            <div class="jg-meta">
              <span class="jg-pill">${L.cols}×${L.rows}</span>
              <div class="jg-progress" role="status">
                <span class="jg-placed">0</span> / ${total}
              </div>
            </div>
          </header>

          <div class="jg-board-wrap">
            <div class="jg-board drop-zone" style="--jg-cols:${L.cols};--jg-rows:${L.rows};--jg-bg:${L.bg}"></div>
          </div>

          <section class="jg-tray" aria-label="Puzzle pieces">
            <div class="jg-tray-label">Drag pieces into the picture</div>
            <div class="jg-tray-pieces"></div>
          </section>
        `;

        stage.appendChild(arena);
        renderLevelHeader(arena, planIndex, '', () => openHub(stage));

        const board = arena.querySelector('.jg-board');
        const tray = arena.querySelector('.jg-tray-pieces');
        const placedEl = arena.querySelector('.jg-placed');
        const slots = [];

        L.pieces.forEach((emoji, i) => {
          const slot = document.createElement('div');
          slot.className = 'jg-slot drop-target';
          slot.dataset.idx = String(i);
          slot.setAttribute('aria-label', 'Slot ' + (i + 1));
          slot.innerHTML = '<span class="jg-slot-ghost" aria-hidden="true">' + emoji + '</span>';
          board.appendChild(slot);
          slots.push(slot);
        });

        function updatePlaced() {
          placedEl.textContent = String(placed);
        }

        function levelComplete() {
          if (levelDone) return;
          levelDone = true;

          try {
            S().showFeedback(arena, t('amazing'), true);
            S().spawnConfetti(arena, 14);
          } catch (e) {}

          const isFinal = planIndex >= LEVEL_COUNT - 1;
          safeTimeout(() => {
            showLevelComplete(arena, {
              levelIndex: planIndex,
              gameId: GAME_ID,
              title: isFinal ? 'Puzzle master!' : 'Picture complete!',
              message: L.label + ' looks wonderful!',
              isFinal,
              onHub: () => openHub(stage),
              onNext: () => {
                if (isFinal) finishGame(arena, 3);
                else play(stage, planIndex + 1);
              }
            });
          }, 600);
        }

        S().shuffle(L.pieces.map((e, i) => ({ e, i }))).forEach((p) => {
          const piece = document.createElement('div');
          piece.className = 'jg-piece';
          piece.dataset.idx = String(p.i);
          piece.setAttribute('aria-label', 'Puzzle piece');
          piece.textContent = p.e;
          tray.appendChild(piece);

          const clean = S().enableDrag(piece, {
            onEnd(el) {
              if (levelDone || el._placed) return;
              const slot = slots[Number(el.dataset.idx)];
              if (slot && !slot.classList.contains('jg-filled') && S().hits(el, slot, 64)) {
                slot.classList.add('jg-filled');
                slot.textContent = el.textContent;
                el.style.display = 'none';
                el._dragDisabled = true;
                el._placed = true;
                placed++;
                updatePlaced();
                celebrateEl(slot, 'jg-slot-pop');
                successSound();
                if (placed >= total) levelComplete();
              } else {
                S().returnDrag(el);
                try { S().showFeedback(arena, t('try_again'), false); } catch (e) {}
              }
            }
          });
          trackCleanup(clean);
        });

        updatePlaced();
      }
    }
  });
})();