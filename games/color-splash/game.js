(function () {
  'use strict';

  const {
    S, t, A, register,
    celebrateEl, finishGame,
    LEVEL_COUNT, startWithLevels, createLevelHub,
    showLevelComplete, renderLevelHeader, progressDots,
    safeTimeout, safeInterval
  } = window.SiPraGameKit;

  const GAME_ID = 'color-splash';

  const PALETTE = [
    { id: 'red', hex: '#FF4B5C', label: 'Red' },
    { id: 'orange', hex: '#FF922B', label: 'Orange' },
    { id: 'yellow', hex: '#FFD43B', label: 'Yellow' },
    { id: 'green', hex: '#40C057', label: 'Green' },
    { id: 'blue', hex: '#339AF0', label: 'Blue' },
    { id: 'purple', hex: '#9775FA', label: 'Purple' },
    { id: 'pink', hex: '#F783AC', label: 'Pink' },
    { id: 'brown', hex: '#A1745A', label: 'Brown' }
  ];

  const TOOLS = [
    { id: 'crayon', icon: '🖍️', label: 'Crayon' },
    { id: 'pencil', icon: '✏️', label: 'Pencil' },
    { id: 'brush', icon: '🖌️', label: 'Brush' }
  ];

  /** 10 levels — more cards & stricter color matching */
  const LEVELS = [
    { cards: 2, palette: 4, hint: false, title: 'First brushstrokes' },
    { cards: 3, palette: 5, hint: true, title: 'Match the dots' },
    { cards: 3, palette: 6, hint: true, title: 'Studio practice' },
    { cards: 4, palette: 6, hint: true, title: 'Color carousel' },
    { cards: 4, palette: 7, hint: true, title: 'Easel expert' },
    { cards: 5, palette: 7, hint: true, title: 'Rainbow row' },
    { cards: 5, palette: 8, hint: true, title: 'Artist challenge' },
    { cards: 6, palette: 8, hint: true, title: 'Gallery prep' },
    { cards: 6, palette: 8, hint: true, strict: true, title: 'Perfect shades' },
    { cards: 7, palette: 8, hint: true, strict: true, title: 'Masterpiece!' }
  ];

  const ART_POOL = [
    { emoji: '🐶', target: 'brown', name: 'Puppy' },
    { emoji: '🌸', target: 'pink', name: 'Flower' },
    { emoji: '🚗', target: 'red', name: 'Car' },
    { emoji: '🏠', target: 'orange', name: 'House' },
    { emoji: '🐱', target: 'yellow', name: 'Kitty' },
    { emoji: '🌻', target: 'yellow', name: 'Sunflower' },
    { emoji: '🦋', target: 'purple', name: 'Butterfly' },
    { emoji: '🐸', target: 'green', name: 'Frog' },
    { emoji: '🐳', target: 'blue', name: 'Whale' },
    { emoji: '🍎', target: 'red', name: 'Apple' },
    { emoji: '🍌', target: 'yellow', name: 'Banana' },
    { emoji: '🌳', target: 'green', name: 'Tree' },
    { emoji: '🦄', target: 'purple', name: 'Unicorn' },
    { emoji: '🎈', target: 'blue', name: 'Balloon' },
    { emoji: '🍊', target: 'orange', name: 'Orange' },
    { emoji: '🐷', target: 'pink', name: 'Piggy' },
    { emoji: '🚂', target: 'blue', name: 'Train' },
    { emoji: '🍇', target: 'purple', name: 'Grapes' },
    { emoji: '🥕', target: 'orange', name: 'Carrot' },
    { emoji: '🐢', target: 'green', name: 'Turtle' }
  ];

  function hexFor(id) {
    const p = PALETTE.find(x => x.id === id);
    return p ? p.hex : PALETTE[0].hex;
  }

  function hexToRgb(hex) {
    const clean = (hex || '#FF4B5C').replace('#', '');
    const n = parseInt(clean, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function paintCrayonWash(canvas, hex, toolId) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const rgb = hexToRgb(hex);

    if (toolId === 'brush') {
      // Soft layered watercolor/gouache brush strokes
      for (let row = 0; row < 7; row++) {
        const y = (row + 0.5) * (h / 7);
        ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.45 + (row % 2) * 0.14).toFixed(2)})`;
        ctx.lineWidth = h / 4.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(10, y + (Math.random() - 0.5) * 8);
        ctx.quadraticCurveTo(w * 0.5, y + (Math.random() - 0.5) * 14, w - 10, y + (Math.random() - 0.5) * 8);
        ctx.stroke();
      }
      return;
    }

    if (toolId === 'pencil') {
      // Diagonal hand-hatched colored pencil shading
      ctx.lineCap = 'round';
      for (let x = -h; x < w + h; x += 6) {
        ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.35 + Math.random() * 0.35).toFixed(2)})`;
        ctx.lineWidth = 2.2 + Math.random() * 1.4;
        ctx.beginPath();
        ctx.moveTo(x + (Math.random() - 0.5) * 4, 8);
        ctx.lineTo(x + h * 0.55 + (Math.random() - 0.5) * 6, h - 8);
        ctx.stroke();
      }
      return;
    }

    // Default: realistic wax crayon diagonal scribble strokes with paper tooth gaps!
    for (let pass = 0; pass < 9; pass++) {
      const yBase = 14 + (pass / 8) * (h - 28);
      for (let x = 10; x < w - 10; x += 3) {
        const cy = yBase + Math.sin(x * 0.08 + pass) * 7;
        for (let g = 0; g < 11; g++) {
          const ox = (Math.random() - 0.5) * 14;
          const oy = (Math.random() - 0.5) * 18;
          const tooth = ((Math.sin((x + ox) * 0.65) * Math.cos((cy + oy) * 0.65)) + 1) * 0.5;
          if (tooth < 0.28) continue;
          const alpha = 0.32 + Math.random() * 0.48;
          ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha.toFixed(2)})`;
          ctx.fillRect(x + ox, cy + oy, 2.2 + Math.random() * 2.2, 1.8 + Math.random() * 1.6);
        }
      }
    }
  }

  function pickCards(count, activePalette) {
    const allowed = new Set(activePalette.map(p => p.id));
    const eligible = ART_POOL.filter(item => allowed.has(item.target));
    const shuffled = S().shuffle(eligible.slice());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  register('color-splash', {
    name: { en: 'Color Splash', te: 'కలర్ స్ప్లాష్' },
    desc: { en: 'Pick a color and paint pictures', te: 'రంగు ఎంచుకుని చిత్రాలు పెయింట్ చేయండి' },
    icon: '🎨',
    cat: 'colors',
    introKey: 'g3_intro',

    start(stage) {
      startWithLevels(stage, '🎨', 'g3_intro', {
        gameId: GAME_ID,
        title: 'Little Artist Studio',
        subtitle: '10 crayon painting adventures!',
        emoji: '🖼️',
        themeClass: 'csplash-hub'
      }, (st, lv) => play(st, lv));

      function openHub(st) {
        createLevelHub(st, {
          gameId: GAME_ID,
          title: 'Little Artist Studio',
          subtitle: '10 crayon painting adventures!',
          emoji: '🖼️',
          themeClass: 'csplash-hub',
          onPlay(lv) { play(st, lv); }
        });
      }

      function play(stage, levelIndex) {
        const plan = LEVELS[levelIndex] || LEVELS[0];
        const activePalette = PALETTE.slice(0, plan.palette);
        const cards = pickCards(plan.cards, activePalette);

        stage.innerHTML = '';
        const arena = document.createElement('div');
        arena.className = 'gp-arena csplash-game';

        arena.innerHTML = `
          <div class="csg-bg" aria-hidden="true">
            <div class="csg-wall"></div>
            <div class="csg-bunting"></div>
            <div class="csg-splatter csg-sp1"></div>
            <div class="csg-splatter csg-sp2"></div>
            <div class="csg-splatter csg-sp3"></div>
            <div class="csg-desk"></div>
          </div>
          <div class="csg-header-row">
            <div class="csg-mascot" aria-hidden="true">
              <span class="csg-painter">👩‍🎨</span>
              <span class="csg-bubble">Pick a crayon!</span>
            </div>
            <div class="csg-status">
              <span class="csg-lv-name">${plan.title}</span>
              <span class="csg-progress-wrap"></span>
            </div>
          </div>
          <div class="csg-play"></div>
        `;

        const playZone = arena.querySelector('.csg-play');
        const mascotBubble = arena.querySelector('.csg-bubble');

        const toolBar = document.createElement('div');
        toolBar.className = 'csg-tools-row';

        let selectedHex = activePalette[0].hex;
        let selectedId = activePalette[0].id;
        let selectedTool = 'crayon';
        let painted = 0;
        let levelDone = false;
        const cardEls = [];

        TOOLS.forEach(tool => {
          const tb = document.createElement('button');
          tb.type = 'button';
          tb.className = 'csg-tool-chip' + (tool.id === selectedTool ? ' active' : '');
          tb.innerHTML = `<span>${tool.icon}</span><span>${tool.label}</span>`;
          tb.addEventListener('click', () => {
            selectedTool = tool.id;
            toolBar.querySelectorAll('.csg-tool-chip').forEach(b => b.classList.remove('active'));
            tb.classList.add('active');
            A().click();
          });
          toolBar.appendChild(tb);
        });

        const resetBtn = document.createElement('button');
        resetBtn.type = 'button';
        resetBtn.className = 'csg-reset-btn';
        resetBtn.textContent = '🔄 ' + (t('reset_canvas') || 'Clear');
        resetBtn.addEventListener('click', () => {
          if (levelDone) return;
          painted = 0;
          cardEls.forEach(c => {
            c.classList.remove('done');
            c.style.removeProperty('--fill');
            c.style.background = '';
            const cv = c.querySelector('.csg-card-canvas');
            if (cv) cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
          });
          A().click();
          updateProgress();
        });
        toolBar.appendChild(resetBtn);

        const paletteTray = document.createElement('div');
        paletteTray.className = 'csg-crayon-box';
        const paletteBar = document.createElement('div');
        paletteBar.className = 'csg-palette';
        paletteBar.setAttribute('role', 'toolbar');
        paletteBar.setAttribute('aria-label', 'Crayon colors');
        paletteTray.appendChild(paletteBar);

        activePalette.forEach((p, i) => {
          const sw = document.createElement('button');
          sw.type = 'button';
          sw.className = 'csg-swatch' + (i === 0 ? ' on' : '');
          sw.style.setProperty('--crayon-hex', p.hex);
          sw.dataset.colorId = p.id;
          sw.setAttribute('aria-label', p.label + ' crayon');
          sw.setAttribute('title', p.label);
          sw.innerHTML = `
            <span class="csg-crayon-tip" aria-hidden="true"></span>
            <span class="csg-crayon-body" aria-hidden="true">
              <span class="csg-crayon-wrap">
                <span class="csg-crayon-band"></span>
                <span class="csg-crayon-dot"></span>
                <span class="csg-crayon-band"></span>
              </span>
            </span>
          `;
          sw.addEventListener('click', () => {
            selectedHex = p.hex;
            selectedId = p.id;
            paletteBar.querySelectorAll('.csg-swatch').forEach(s => s.classList.remove('on'));
            sw.classList.add('on');
            A().click();
            celebrateEl(sw, 'swatch-pop');
          });
          paletteBar.appendChild(sw);
        });

        const canvasGrid = document.createElement('div');
        canvasGrid.className = 'csg-canvas-grid';

        function updateProgress() {
          arena.querySelector('.csg-progress-wrap').innerHTML =
            progressDots(cards.length, painted);
          mascotBubble.textContent =
            painted >= cards.length
              ? 'Masterpiece! ✨'
              : plan.strict
                ? `Match ${cards.length - painted} color${cards.length - painted > 1 ? 's' : ''}!`
                : `Color ${cards.length - painted} more!`;
        }

        cards.forEach(art => {
          const card = document.createElement('button');
          card.type = 'button';
          card.className = 'csg-card';
          const hintDot = plan.hint
            ? `<span class="csg-hint" style="--hint-hex:${hexFor(art.target)}" title="Color hint"></span>`
            : '';
          card.innerHTML = `
            <span class="csg-card-holes" aria-hidden="true"><i></i><i></i><i></i></span>
            <canvas class="csg-card-canvas" width="180" height="140" aria-hidden="true"></canvas>
            <span class="csg-card-frame" aria-hidden="true"></span>
            <span class="csg-card-emoji">${art.emoji}</span>
            <span class="csg-card-footer">
              ${hintDot}
              <span class="csg-card-name">${art.name}</span>
            </span>
          `;

          card.addEventListener('click', () => {
            if (levelDone || card.classList.contains('done')) return;

            const ok = !plan.strict || selectedId === art.target;
            if (!ok) {
              celebrateEl(card, 'wiggle');
              try { if (typeof A().gentle === 'function') A().gentle(); } catch (e) {}
              try { S().showFeedback(arena, t('try_again'), false); } catch (e) {}
              mascotBubble.textContent = 'Match the color dot! 🖍️';
              return;
            }

            card.classList.add('done');
            card.style.setProperty('--fill', selectedHex);
            paintCrayonWash(card.querySelector('.csg-card-canvas'), selectedHex, selectedTool);
            painted++;
            A().pop();
            const r = card.getBoundingClientRect();
            S().burstParticles(r.left + r.width / 2, r.top + r.height / 2,
              ['✨', '🖍️', art.emoji], 10);

            updateProgress();

            if (painted >= cards.length && !levelDone) {
              levelDone = true;
              safeTimeout(() => {
                const isFinal = levelIndex >= LEVEL_COUNT - 1;
                showLevelComplete(arena, {
                  levelIndex,
                  gameId: GAME_ID,
                  title: isFinal ? 'Studio Star!' : 'Colorful Art!',
                  message: 'What a bright crayon masterpiece!',
                  isFinal,
                  onHub: () => openHub(stage),
                  onNext: () => {
                    if (isFinal) finishGame(arena, 3);
                    else play(stage, levelIndex + 1);
                  }
                });
              }, 520);
            }
          });
          cardEls.push(card);
          canvasGrid.appendChild(card);
        });

        playZone.appendChild(canvasGrid);
        playZone.appendChild(toolBar);
        playZone.appendChild(paletteTray);

        renderLevelHeader(arena, levelIndex, '', () => openHub(stage));

        let bobT = 0;
        safeInterval(() => {
          bobT++;
          const mascot = arena.querySelector('.csg-painter');
          if (mascot) mascot.style.transform = `translateY(${Math.sin(bobT * 0.12) * 3}px)`;
        }, 80);

        updateProgress();
        stage.appendChild(arena);
      }
    }
  });
})();
