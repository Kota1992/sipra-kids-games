(function () {
  'use strict';

  const {
    S, t, A, register, finishGame,
    LEVEL_COUNT, startWithLevels, createLevelHub, showLevelComplete, renderLevelHeader
  } = window.SiPraGameKit;

  const GAME_ID = 'magic-coloring';

  /** 10 studio levels — reuses / extends SCENES */
  const LEVEL_PLAN = [
    { sceneIndex: 0, title: 'Sunny House', minPaint: 28 },
    { sceneIndex: 1, title: 'Happy Butterfly', minPaint: 32 },
    { sceneIndex: 2, title: 'Underwater World', minPaint: 36 },
    { sceneIndex: 3, title: 'Rainbow Garden', minPaint: 40 },
    { sceneIndex: 0, title: 'Cozy Cottage', minPaint: 44 },
    { sceneIndex: 1, title: 'Butterfly Wings', minPaint: 48 },
    { sceneIndex: 2, title: 'Deep Sea', minPaint: 52 },
    { sceneIndex: 3, title: 'Flower Meadow', minPaint: 55 },
    { sceneIndex: 0, title: 'Dream Home', minPaint: 58 },
    { sceneIndex: 3, title: 'Masterpiece Garden', minPaint: 62 }
  ];

  const PALETTE = [
    { hex: '#FF4B5C', name: 'Berry Red' },
    { hex: '#FF8A00', name: 'Tangerine' },
    { hex: '#FFD600', name: 'Sunny Yellow' },
    { hex: '#7CB342', name: 'Leaf Green' },
    { hex: '#00C853', name: 'Emerald' },
    { hex: '#00BCD4', name: 'Aqua Splash' },
    { hex: '#2196F3', name: 'Sky Blue' },
    { hex: '#536DFE', name: 'Royal Blue' },
    { hex: '#9C27B0', name: 'Grape' },
    { hex: '#E040FB', name: 'Magic Pink' },
    { hex: '#FF80AB', name: 'Bubblegum' },
    { hex: '#A1887F', name: 'Warm Cocoa' },
    { hex: '#795548', name: 'Teddy Brown' },
    { hex: '#FFFFFF', name: 'Cloud White' },
    { hex: '#2B303A', name: 'Midnight' }
  ];

  const SIZES = [
    { id: 'sm', label: 'Small', px: 10 },
    { id: 'md', label: 'Medium', px: 20 },
    { id: 'lg', label: 'Big', px: 34 }
  ];

  const SVG_DEFS = `
    <defs>
      <filter id="mc-sketch-ink" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" result="noise" seed="7"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.35" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="mc-wax-grain" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" result="grain" seed="3"/>
        <feColorMatrix type="matrix" values="
          0 0 0 0 1
          0 0 0 0 0.98
          0 0 0 0 0.94
          0 0 0 0.14 0" in="grain" result="softGrain"/>
        <feComposite in="softGrain" in2="SourceGraphic" operator="atop" result="wax"/>
        <feBlend in="SourceGraphic" in2="wax" mode="normal"/>
      </filter>
    </defs>`;

  const SCENES = [
    {
      id: 'house',
      name: 'Sunny House',
      emoji: '🏡',
      description: 'Color a cozy sunny home!',
      svg: `
      <svg viewBox="0 0 440 390" xmlns="http://www.w3.org/2000/svg">
        ${SVG_DEFS}
        <g class="mc-sketch-group" stroke="#2D243B" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round">
          <circle class="colorable" data-part="sun" cx="360" cy="62" r="35"/>
          <path class="colorable" data-part="cloud1" d="M48 94 Q30 88 34 72 Q38 54 58 61 Q65 35 90 45 Q111 28 128 51 Q151 48 151 70 Q165 91 142 96 Z"/>
          <path class="colorable" data-part="cloud2" d="M250 140 Q230 137 235 121 Q240 103 257 110 Q270 88 289 103 Q309 89 324 109 Q345 105 347 124 Q354 141 332 144 Z"/>

          <path class="colorable" data-part="roof" d="M75 188 L218 75 L365 188 Z"/>
          <path class="colorable" data-part="roofline" d="M64 190 L218 67 L376 190 L359 201 L218 91 L82 201 Z"/>
          <rect class="colorable" data-part="wall" x="100" y="190" width="238" height="155" rx="5"/>
          <rect class="colorable" data-part="door" x="193" y="250" width="57" height="95" rx="8"/>
          <circle class="colorable" data-part="knob" cx="238" cy="300" r="5"/>

          <rect class="colorable" data-part="window1" x="119" y="221" width="53" height="52" rx="6"/>
          <path class="colorable" data-part="windowcross1" d="M145 221 V273 M119 247 H172"/>
          <rect class="colorable" data-part="window2" x="270" y="221" width="53" height="52" rx="6"/>
          <path class="colorable" data-part="windowcross2" d="M296 221 V273 M270 247 H323"/>

          <rect class="colorable" data-part="chimney" x="275" y="104" width="34" height="57"/>
          <path class="colorable" data-part="chimneytop" d="M268 105 H316 V116 H268 Z"/>

          <rect class="colorable" data-part="treeTrunk" x="31" y="270" width="30" height="75" rx="6"/>
          <circle class="colorable" data-part="tree1" cx="46" cy="242" r="38"/>
          <circle class="colorable" data-part="tree2" cx="22" cy="265" r="23"/>
          <circle class="colorable" data-part="tree3" cx="70" cy="264" r="23"/>

          <path class="colorable" data-part="ground" d="M12 345 Q100 324 200 345 Q310 326 428 345 L428 380 H12 Z"/>

          <path class="colorable" data-part="flower1" d="M382 310 C355 289 359 265 382 277 C405 265 409 289 382 310 Z"/>
          <circle class="colorable" data-part="flowercenter1" cx="382" cy="295" r="8"/>
          <path class="colorable" data-part="flowerstem1" d="M382 310 L382 349"/>
          <path class="colorable" data-part="flowerleaf1" d="M382 333 Q358 317 357 337 Q370 347 382 333 Z"/>

          <path class="colorable" data-part="flower2" d="M410 319 C388 298 394 279 410 288 C429 278 434 300 410 319 Z"/>
          <circle class="colorable" data-part="flowercenter2" cx="410" cy="303" r="7"/>
          <path class="colorable" data-part="flowerstem2" d="M410 319 L410 350"/>
        </g>
      </svg>`
    },
    {
      id: 'butterfly',
      name: 'Happy Butterfly',
      emoji: '🦋',
      description: 'Color magical butterfly wings!',
      svg: `
      <svg viewBox="0 0 440 390" xmlns="http://www.w3.org/2000/svg">
        ${SVG_DEFS}
        <g class="mc-sketch-group" stroke="#2D243B" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round">
          <circle class="colorable" data-part="sun" cx="360" cy="55" r="30"/>
          <path class="colorable" data-part="cloud" d="M35 93 Q17 88 23 69 Q28 52 49 57 Q59 32 82 44 Q105 28 120 53 Q143 47 145 70 Q152 91 127 96 Z"/>

          <path class="colorable" data-part="wingUL" d="M208 177 C166 58 55 42 49 120 C43 190 115 206 201 215 Z"/>
          <path class="colorable" data-part="wingLL" d="M201 215 C113 185 65 231 90 296 C115 353 181 294 208 248 Z"/>
          <path class="colorable" data-part="wingUR" d="M230 177 C271 58 383 42 390 120 C396 190 322 206 237 215 Z"/>
          <path class="colorable" data-part="wingLR" d="M237 215 C325 185 373 231 348 296 C323 353 257 294 230 248 Z"/>

          <ellipse class="colorable" data-part="body" cx="219" cy="220" rx="17" ry="70"/>
          <circle class="colorable" data-part="head" cx="219" cy="140" r="25"/>
          <path class="colorable" data-part="antenna1" d="M207 120 Q178 78 186 70"/>
          <path class="colorable" data-part="antenna2" d="M231 120 Q260 78 252 70"/>
          <circle class="colorable" data-part="antennaDot1" cx="186" cy="70" r="6"/>
          <circle class="colorable" data-part="antennaDot2" cx="252" cy="70" r="6"/>

          <ellipse class="colorable" data-part="spot1" cx="112" cy="131" rx="20" ry="15"/>
          <ellipse class="colorable" data-part="spot2" cx="147" cy="174" rx="14" ry="12"/>
          <ellipse class="colorable" data-part="spot3" cx="115" cy="250" rx="17" ry="15"/>
          <ellipse class="colorable" data-part="spot4" cx="325" cy="131" rx="20" ry="15"/>
          <ellipse class="colorable" data-part="spot5" cx="290" cy="174" rx="14" ry="12"/>
          <ellipse class="colorable" data-part="spot6" cx="325" cy="250" rx="17" ry="15"/>

          <path class="colorable" data-part="ground" d="M10 340 Q100 320 220 340 Q330 315 430 340 L430 380 H10 Z"/>
          <path class="colorable" data-part="stem1" d="M53 335 L53 290"/>
          <circle class="colorable" data-part="flower1" cx="53" cy="276" r="17"/>
          <circle class="colorable" data-part="flowercenter1" cx="53" cy="276" r="8"/>
          <path class="colorable" data-part="stem2" d="M388 335 L388 280"/>
          <circle class="colorable" data-part="flower2" cx="388" cy="265" r="17"/>
          <circle class="colorable" data-part="flowercenter2" cx="388" cy="265" r="8"/>
        </g>
      </svg>`
    },
    {
      id: 'ocean',
      name: 'Underwater World',
      emoji: '🐠',
      description: 'Color friendly ocean pals!',
      svg: `
      <svg viewBox="0 0 440 390" xmlns="http://www.w3.org/2000/svg">
        ${SVG_DEFS}
        <g class="mc-sketch-group" stroke="#2D243B" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round">
          <circle class="colorable" data-part="bubble1" cx="67" cy="65" r="19"/>
          <circle class="colorable" data-part="bubble2" cx="115" cy="110" r="11"/>
          <circle class="colorable" data-part="bubble3" cx="342" cy="72" r="21"/>
          <circle class="colorable" data-part="bubble4" cx="380" cy="125" r="12"/>

          <path class="colorable" data-part="fishbody" d="M104 187 Q174 113 259 187 Q174 261 104 187 Z"/>
          <path class="colorable" data-part="fishtail" d="M104 187 L55 145 L60 230 Z"/>
          <path class="colorable" data-part="fishfin" d="M165 135 L198 95 L213 154 Z"/>
          <path class="colorable" data-part="fishbottom" d="M174 235 L206 273 L218 224 Z"/>
          <circle class="colorable" data-part="fisheye" cx="224" cy="177" r="8"/>

          <path class="colorable" data-part="fish2body" d="M280 267 Q330 221 382 267 Q330 312 280 267 Z"/>
          <path class="colorable" data-part="fish2tail" d="M280 267 L247 235 L247 300 Z"/>
          <circle class="colorable" data-part="fish2eye" cx="356" cy="259" r="6"/>

          <path class="colorable" data-part="coral1" d="M23 350 L23 295 L43 317 L52 279 L69 317 L85 293 L83 350 Z"/>
          <path class="colorable" data-part="coral2" d="M350 350 L350 297 L369 318 L382 277 L400 318 L419 297 L417 350 Z"/>
          <path class="colorable" data-part="seaweed1" d="M125 350 Q105 300 128 278 Q112 317 148 350 Z"/>
          <path class="colorable" data-part="seaweed2" d="M151 350 Q170 302 152 278 Q181 315 170 350 Z"/>

          <path class="colorable" data-part="sand" d="M10 350 Q110 328 220 350 Q320 329 430 350 L430 380 H10 Z"/>
          <path class="colorable" data-part="starfish" d="M250 341 L263 315 L276 341 L303 346 L281 365 L286 386 L263 373 L240 386 L245 362 L225 346 Z"/>
        </g>
      </svg>`
    },
    {
      id: 'garden',
      name: 'Rainbow Garden',
      emoji: '🌈',
      description: 'Color a sunny rainbow garden!',
      svg: `
      <svg viewBox="0 0 440 390" xmlns="http://www.w3.org/2000/svg">
        ${SVG_DEFS}
        <g class="mc-sketch-group" stroke="#2D243B" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round">
          <path class="colorable" data-part="rainbow1" d="M75 235 A145 145 0 0 1 365 235 L335 235 A115 115 0 0 0 105 235 Z"/>
          <path class="colorable" data-part="rainbow2" d="M105 235 A115 115 0 0 1 335 235 L305 235 A85 85 0 0 0 135 235 Z"/>
          <path class="colorable" data-part="rainbow3" d="M135 235 A85 85 0 0 1 305 235 L275 235 A55 55 0 0 0 165 235 Z"/>

          <path class="colorable" data-part="cloud1" d="M35 243 Q17 238 22 218 Q27 201 49 206 Q59 180 82 193 Q103 177 120 200 Q141 194 145 217 Q150 239 126 243 Z"/>
          <path class="colorable" data-part="cloud2" d="M297 243 Q278 238 283 218 Q288 201 310 206 Q320 180 343 193 Q364 177 381 200 Q402 194 406 217 Q411 239 387 243 Z"/>

          <circle class="colorable" data-part="sun" cx="220" cy="52" r="31"/>
          <path class="colorable" data-part="ground" d="M10 315 Q110 292 220 315 Q330 291 430 315 L430 380 H10 Z"/>

          <path class="colorable" data-part="stem1" d="M73 320 L73 271"/>
          <circle class="colorable" data-part="flower1" cx="73" cy="255" r="19"/>
          <circle class="colorable" data-part="center1" cx="73" cy="255" r="8"/>

          <path class="colorable" data-part="stem2" d="M365 320 L365 271"/>
          <circle class="colorable" data-part="flower2" cx="365" cy="255" r="19"/>
          <circle class="colorable" data-part="center2" cx="365" cy="255" r="8"/>

          <path class="colorable" data-part="stem3" d="M133 330 L133 293"/>
          <circle class="colorable" data-part="flower3" cx="133" cy="280" r="15"/>
          <circle class="colorable" data-part="center3" cx="133" cy="280" r="7"/>

          <path class="colorable" data-part="stem4" d="M305 330 L305 293"/>
          <circle class="colorable" data-part="flower4" cx="305" cy="280" r="15"/>
          <circle class="colorable" data-part="center4" cx="305" cy="280" r="7"/>
        </g>
      </svg>`
    }
  ];

  function safeClickSound() {
    try {
      if (A && typeof A().click === 'function') A().click();
    } catch (e) {}
  }

  function hexToRgb(hex) {
    const clean = (hex || '#FF4B5C').replace('#', '');
    const n = parseInt(clean.length === 3
      ? clean.split('').map(c => c + c).join('')
      : clean, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function play(stage, levelIndex) {
    const plan = LEVEL_PLAN[levelIndex] || LEVEL_PLAN[0];
    const sceneIndex = plan.sceneIndex;

    stage.innerHTML = '';

    const arena = document.createElement('div');
    arena.className = 'coloring-stage gp-arena';

    let selectedColor = PALETTE[0].hex;
    let selectedTool = 'crayon'; // crayon | pencil | brush | fill | erase
    let selectedSize = SIZES[1].px;
    let undoStack = [];
    let redoStack = [];
    let activeSVG = null;
    let drawCanvas = null;
    let drawCtx = null;
    let paintedCells = new Set();

    const workspace = document.createElement('div');
    workspace.className = 'coloring-workspace';

    const toolbarRow = document.createElement('div');
    toolbarRow.className = 'mc-controls-row';

    const toolbar = document.createElement('div');
    toolbar.className = 'coloring-toolbar';

    const sizeGroup = document.createElement('div');
    sizeGroup.className = 'mc-size-group';
    sizeGroup.setAttribute('role', 'group');
    sizeGroup.setAttribute('aria-label', 'Crayon size');

    const paletteBox = document.createElement('div');
    paletteBox.className = 'coloring-palette-area';

    const palette = document.createElement('div');
    palette.className = 'paint-palette';

    const bottomRow = document.createElement('div');
    bottomRow.className = 'mc-bottom-row';

    const progress = document.createElement('div');
    progress.className = 'coloring-progress';

    const actionBar = document.createElement('div');
    actionBar.className = 'coloring-actions';

    function button(label, icon, className, handler) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = className;
      el.innerHTML = `<span class="mc-tool-ico">${icon}</span><span class="mc-tool-lbl">${label}</span>`;
      el.addEventListener('click', handler);
      return el;
    }

    function captureSnapshot() {
      if (!activeSVG) return null;
      return {
        svg: activeSVG.outerHTML,
        canvas: drawCanvas ? drawCanvas.toDataURL('image/png') : null,
        cells: Array.from(paintedCells)
      };
    }

    function snapshot() {
      const snap = captureSnapshot();
      if (!snap) return;
      undoStack.push(snap);
      if (undoStack.length > 40) undoStack.shift();
      redoStack = [];
      updateHistoryButtons();
    }

    function restore(snap) {
      if (!snap) return;
      const svgHost = workspace.querySelector('.mc-svg-layer');
      if (!svgHost) return;

      svgHost.innerHTML = snap.svg;
      activeSVG = svgHost.querySelector('svg');
      paintedCells = new Set(snap.cells || []);

      if (drawCanvas && drawCtx) {
        drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        if (snap.canvas) {
          const img = new Image();
          img.onload = () => {
            if (drawCtx) drawCtx.drawImage(img, 0, 0);
          };
          img.src = snap.canvas;
        }
      }

      if (activeSVG) attachSVGEvents();
      updateProgress();
      updateHistoryButtons();
    }

    function updateHistoryButtons() {
      const undo = toolbar.querySelector('[data-action="undo"]');
      const redo = toolbar.querySelector('[data-action="redo"]');
      if (undo) undo.disabled = undoStack.length === 0;
      if (redo) redo.disabled = redoStack.length === 0;
    }

    function paintPercent() {
      if (!activeSVG) return 0;
      const parts = [...activeSVG.querySelectorAll('.colorable')];
      const paintedParts = parts.filter(part => {
        const fill = part.getAttribute('fill');
        return fill && fill.toUpperCase() !== '#FFFFFF';
      }).length;
      const regionPct = Math.round((paintedParts / Math.max(parts.length, 1)) * 100);
      // 11 x 10 grid = 110 coverage cells across canvas; 55 cells ≈ 100% rich crayon work
      const strokePct = Math.min(100, Math.round((paintedCells.size / 55) * 100));
      return Math.min(100, Math.max(regionPct, strokePct, Math.round(regionPct + strokePct * 0.55)));
    }

    function updateProgress() {
      if (!activeSVG) return;
      const parts = [...activeSVG.querySelectorAll('.colorable')];
      const painted = parts.filter(part => {
        const fill = part.getAttribute('fill');
        return fill && fill.toUpperCase() !== '#FFFFFF';
      }).length;
      const percent = paintPercent();
      const goalMet = percent >= plan.minPaint;

      progress.innerHTML = `
        <span class="mc-prog-text">🖍️ ${percent}% <small>(goal ${plan.minPaint}%)</small></span>
        <div class="coloring-progress-track">
          <div class="coloring-progress-fill${goalMet ? ' goal-met' : ''}" style="width:${percent}%"></div>
        </div>
        <span class="mc-prog-badge">${goalMet ? '⭐ Ready!' : painted + ' parts'}</span>
      `;
    }

    function buildPalette() {
      palette.innerHTML = '';

      PALETTE.forEach(item => {
        const color = item.hex;
        const swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'paint-swatch mc-crayon';
        swatch.style.setProperty('--crayon-color', color);
        swatch.setAttribute('aria-label', 'Choose ' + item.name);
        swatch.setAttribute('title', item.name);
        swatch.setAttribute(
          'aria-pressed',
          String(color === selectedColor && selectedTool !== 'erase')
        );

        if (color === '#FFFFFF') {
          swatch.classList.add('paint-white');
        }
        if (color === selectedColor && selectedTool !== 'erase') {
          swatch.classList.add('selected');
        }

        swatch.innerHTML = `
          <span class="crayon-tip" aria-hidden="true"></span>
          <span class="crayon-body" aria-hidden="true">
            <span class="crayon-wrapper">
              <span class="crayon-stripe"></span>
              <span class="crayon-oval"></span>
              <span class="crayon-stripe"></span>
            </span>
          </span>
        `;

        swatch.addEventListener('click', () => {
          selectedColor = color;
          if (selectedTool === 'erase') selectedTool = 'crayon';
          buildPalette();
          updateTools();
          safeClickSound();
        });

        palette.appendChild(swatch);
      });
    }

    function buildSizes() {
      sizeGroup.innerHTML = '';
      SIZES.forEach(sz => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'mc-size-btn' + (sz.px === selectedSize ? ' active' : '');
        b.setAttribute('aria-label', sz.label + ' crayon tip');
        b.setAttribute('title', sz.label + ' tip');
        b.innerHTML = `<span class="mc-size-dot mc-dot-${sz.id}"></span>`;
        b.addEventListener('click', () => {
          selectedSize = sz.px;
          buildSizes();
          safeClickSound();
        });
        sizeGroup.appendChild(b);
      });
    }

    function updateTools() {
      toolbar.querySelectorAll('[data-tool]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === selectedTool);
      });
      if (drawCanvas) {
        drawCanvas.style.pointerEvents = selectedTool === 'fill' ? 'none' : 'auto';
      }
    }

    function buildTools() {
      toolbar.innerHTML = '';

      const tools = [
        { id: 'crayon', label: 'Crayon', icon: '🖍️' },
        { id: 'pencil', label: 'Pencil', icon: '✏️' },
        { id: 'brush', label: 'Brush', icon: '🖌️' },
        { id: 'fill', label: 'Fill', icon: '🪣' },
        { id: 'erase', label: 'Eraser', icon: '🧽' }
      ];

      tools.forEach(item => {
        const btn = button(item.label, item.icon, 'color-tool', () => {
          selectedTool = item.id;
          updateTools();
          buildPalette();
          safeClickSound();
        });
        btn.dataset.tool = item.id;
        if (item.id === selectedTool) btn.classList.add('active');
        toolbar.appendChild(btn);
      });

      const undo = button('Undo', '↩️', 'color-tool', () => {
        if (!undoStack.length || !activeSVG) return;
        const cur = captureSnapshot();
        if (cur) redoStack.push(cur);
        restore(undoStack.pop());
        safeClickSound();
      });
      undo.dataset.action = 'undo';
      toolbar.appendChild(undo);

      const redo = button('Redo', '↪️', 'color-tool', () => {
        if (!redoStack.length || !activeSVG) return;
        const cur = captureSnapshot();
        if (cur) undoStack.push(cur);
        restore(redoStack.pop());
        safeClickSound();
      });
      redo.dataset.action = 'redo';
      toolbar.appendChild(redo);

      toolbar.appendChild(button('Clear', '🗑️', 'color-tool', resetScene));
      toolbar.appendChild(button('Save', '💾', 'color-tool save-art', saveArt));

      updateHistoryButtons();
    }

    function paintPart(part) {
      if (!part || !activeSVG || !activeSVG.contains(part)) return;

      const color = selectedTool === 'erase' ? '#FFFFFF' : selectedColor;
      const currentFill = (part.getAttribute('fill') || '#FFFFFF').toUpperCase();
      if (currentFill === color.toUpperCase()) {
        safeClickSound();
        return;
      }

      snapshot();

      part.setAttribute('fill', color);
      part.style.fill = color;

      part.classList.remove('paint-flash');
      void part.getBoundingClientRect();
      part.classList.add('paint-flash');

      safeClickSound();
      updateProgress();
      updateHistoryButtons();

      try {
        const r = part.getBoundingClientRect();
        if (S().burstParticles) {
          S().burstParticles(r.left + r.width / 2, r.top + r.height / 2, ['✨', '🖍️'], 5);
        }
      } catch (e) {}
    }

    /* ---------- Realistic Wax Crayon / Pencil / Brush Stroke Engine ---------- */
    function canvasPoint(e) {
      const rect = drawCanvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * drawCanvas.width;
      const y = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * drawCanvas.height;
      return { x, y };
    }

    function recordCoverage(x, y, radius) {
      const gx = Math.floor(x / 40);
      const gy = Math.floor(y / 39);
      paintedCells.add(gx + ',' + gy);
      if (radius >= 16) {
        paintedCells.add((gx + 1) + ',' + gy);
        paintedCells.add(gx + ',' + (gy + 1));
      }
    }

    function stampStrokeSegment(p0, p1) {
      if (!drawCtx) return;
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const dist = Math.hypot(dx, dy);
      const step = selectedTool === 'pencil' ? 1.8 : selectedTool === 'crayon' ? 2.4 : 2.2;
      const steps = Math.max(1, Math.ceil(dist / step));
      const rgb = hexToRgb(selectedColor);

      if (selectedTool === 'erase') {
        drawCtx.save();
        drawCtx.globalCompositeOperation = 'destination-out';
        drawCtx.lineCap = 'round';
        drawCtx.lineJoin = 'round';
        drawCtx.lineWidth = selectedSize * 1.35;
        drawCtx.beginPath();
        drawCtx.moveTo(p0.x, p0.y);
        drawCtx.lineTo(p1.x, p1.y);
        drawCtx.stroke();
        drawCtx.restore();
        return;
      }

      drawCtx.save();
      drawCtx.globalCompositeOperation = 'source-over';

      if (selectedTool === 'brush') {
        // Soft velvety gouache paintbrush
        drawCtx.lineCap = 'round';
        drawCtx.lineJoin = 'round';
        drawCtx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.34)`;
        drawCtx.lineWidth = selectedSize * 1.18;
        drawCtx.beginPath();
        drawCtx.moveTo(p0.x, p0.y);
        drawCtx.lineTo(p1.x, p1.y);
        drawCtx.stroke();

        drawCtx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.78)`;
        drawCtx.lineWidth = selectedSize * 0.78;
        drawCtx.beginPath();
        drawCtx.moveTo(p0.x, p0.y);
        drawCtx.lineTo(p1.x, p1.y);
        drawCtx.stroke();
      } else if (selectedTool === 'pencil') {
        // Crisp textured colored pencil
        const half = Math.max(2, selectedSize * 0.22);
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const cx = p0.x + dx * t;
          const cy = p0.y + dy * t;
          for (let g = 0; g < 6; g++) {
            const ox = (Math.random() - 0.5) * half * 2;
            const oy = (Math.random() - 0.5) * half * 2;
            const alpha = 0.28 + Math.random() * 0.42;
            drawCtx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha.toFixed(2)})`;
            drawCtx.fillRect(cx + ox, cy + oy, 1.8, 1.8);
          }
        }
      } else {
        // Realistic Wax Crayon: irregular dry-tooth wax stipple & bristle clusters
        const radius = selectedSize * 0.52;
        const grains = Math.max(14, Math.round(selectedSize * 1.25));
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const cx = p0.x + dx * t;
          const cy = p0.y + dy * t;
          for (let g = 0; g < grains; g++) {
            const angle = Math.random() * Math.PI * 2;
            // Bias slightly toward center with ragged toothy outer edges
            const r = Math.pow(Math.random(), 0.65) * radius;
            const gx = cx + Math.cos(angle) * r;
            const gy = cy + Math.sin(angle) * r;
            // Paper tooth skip: leaves micro paper grain showing through the wax!
            const tooth = ((Math.sin(gx * 0.7) * Math.cos(gy * 0.7)) + 1) * 0.5;
            if (tooth < 0.26) continue;
            const dotSize = 1.4 + Math.random() * 2.4;
            const alpha = (0.38 + Math.random() * 0.46) * (1 - (r / (radius * 1.25)) * 0.45);
            drawCtx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha.toFixed(2)})`;
            drawCtx.fillRect(gx, gy, dotSize, dotSize * 0.85);
          }
        }
      }

      drawCtx.restore();
      recordCoverage(p1.x, p1.y, selectedSize * 0.5);
    }

    function attachCanvasEvents() {
      if (!drawCanvas) return;

      let drawing = false;
      let startClient = null;
      let lastPt = null;
      let moved = 0;
      let snappedForStroke = false;

      drawCanvas.addEventListener('pointerdown', (e) => {
        if (selectedTool === 'fill') return;
        e.preventDefault();
        drawing = true;
        snappedForStroke = false;
        moved = 0;
        startClient = { x: e.clientX, y: e.clientY };
        lastPt = canvasPoint(e);
        try { drawCanvas.setPointerCapture(e.pointerId); } catch (err) {}
      });

      drawCanvas.addEventListener('pointermove', (e) => {
        if (!drawing || !lastPt) return;
        e.preventDefault();
        const pt = canvasPoint(e);
        moved += Math.hypot(e.clientX - startClient.x, e.clientY - startClient.y);
        if (!snappedForStroke && moved > 5) {
          snapshot();
          snappedForStroke = true;
        }
        if (snappedForStroke) {
          stampStrokeSegment(lastPt, pt);
        }
        lastPt = pt;
      });

      function endStroke(e) {
        if (!drawing) return;
        drawing = false;
        const wasTap = !snappedForStroke && moved <= 8;
        if (wasTap && startClient) {
          // Smart tap-to-fill underlying SVG region!
          const els = document.elementsFromPoint(startClient.x, startClient.y);
          const part = els.find(el => el.classList && el.classList.contains('colorable') && activeSVG && activeSVG.contains(el));
          if (part) {
            paintPart(part);
          } else if (lastPt) {
            snapshot();
            stampStrokeSegment(lastPt, { x: lastPt.x + 1, y: lastPt.y + 1 });
            safeClickSound();
            updateProgress();
          }
        } else if (snappedForStroke) {
          updateProgress();
          updateHistoryButtons();
        }
        lastPt = null;
        startClient = null;
      }

      drawCanvas.addEventListener('pointerup', endStroke);
      drawCanvas.addEventListener('pointercancel', endStroke);
    }

    function attachSVGEvents() {
      if (!activeSVG) return;

      activeSVG.addEventListener('pointerdown', function (event) {
        const part = event.target.closest('.colorable');
        if (!part || !activeSVG.contains(part)) return;
        event.preventDefault();
        paintPart(part);
      });

      activeSVG.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const part = event.target.closest('.colorable');
        if (!part) return;
        event.preventDefault();
        paintPart(part);
      });
    }

    function renderScene() {
      const scene = SCENES[sceneIndex];

      workspace.innerHTML = '';

      // Spiral notebook metal rings across the top of the coloring sheet
      const rings = document.createElement('div');
      rings.className = 'mc-spiral-rings';
      rings.setAttribute('aria-hidden', 'true');
      rings.innerHTML = Array.from({ length: 10 }, () => '<span class="mc-ring"></span>').join('');

      const sceneHeader = document.createElement('div');
      sceneHeader.className = 'coloring-scene-header';
      sceneHeader.innerHTML = `
        <div class="mc-scene-title-wrap">
          <span class="mc-scene-emoji">${scene.emoji}</span>
          <div>
            <div class="coloring-scene-name">${plan.title}</div>
            <div class="coloring-scene-description">${scene.description}</div>
          </div>
        </div>
        <span class="coloring-scene-number">Page ${levelIndex + 1} / ${LEVEL_COUNT}</span>
      `;

      const wrap = document.createElement('div');
      wrap.className = 'coloring-svg-wrap';
      wrap.innerHTML = `
        <div class="mc-paper-stage">
          <div class="mc-svg-layer">${scene.svg}</div>
          <canvas class="mc-draw-canvas" width="440" height="390" aria-label="Crayon drawing canvas"></canvas>
        </div>
      `;

      activeSVG = wrap.querySelector('svg');
      drawCanvas = wrap.querySelector('.mc-draw-canvas');
      drawCtx = drawCanvas.getContext('2d');

      activeSVG.querySelectorAll('.colorable').forEach(part => {
        part.setAttribute('fill', '#FFFFFF');
        part.style.fill = '#FFFFFF';
        part.setAttribute('data-original-fill', '#FFFFFF');
        part.setAttribute('tabindex', '0');
      });

      workspace.appendChild(rings);
      workspace.appendChild(sceneHeader);
      workspace.appendChild(wrap);

      undoStack = [];
      redoStack = [];
      paintedCells = new Set();

      attachSVGEvents();
      attachCanvasEvents();
      updateTools();
      updateProgress();
      updateHistoryButtons();
    }

    function resetScene() {
      if (!activeSVG) return;

      snapshot();

      activeSVG.querySelectorAll('.colorable').forEach(part => {
        part.setAttribute('fill', '#FFFFFF');
        part.style.fill = '#FFFFFF';
        part.removeAttribute('filter');
      });
      if (drawCanvas && drawCtx) {
        drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
      }
      paintedCells = new Set();

      updateProgress();
      updateHistoryButtons();
      safeClickSound();
    }

    function saveArt() {
      if (!activeSVG) return;

      try {
        const state = S().state;
        const saved = Array.isArray(state.magicArtGallery)
          ? state.magicArtGallery.slice()
          : [];

        const artwork = {
          id: SCENES[sceneIndex].id,
          name: SCENES[sceneIndex].name,
          svg: activeSVG.outerHTML,
          strokes: drawCanvas ? drawCanvas.toDataURL('image/png') : null,
          date: new Date().toISOString()
        };

        const existing = saved.findIndex(item => item.id === artwork.id);
        if (existing >= 0) saved[existing] = artwork;
        else saved.push(artwork);

        state.magicArtGallery = saved;
        state.magicArt = artwork.svg;

        if (S().Store && S().Store.save) {
          S().Store.save(state);
        }

        if (S().showFeedback) {
          S().showFeedback(arena, 'Your crayon masterpiece is saved! 💖', true);
        }
        safeClickSound();
      } catch (e) {
        if (S().showFeedback) {
          S().showFeedback(arena, 'Saved for now!', true);
        }
      }
    }

    let levelCompleted = false;

    function completeLevel() {
      if (!activeSVG || levelCompleted) return;

      const percent = paintPercent();
      if (percent < plan.minPaint) {
        try {
          S().showFeedback(
            arena,
            'Keep coloring! ' + percent + '% / ' + plan.minPaint + '%',
            false
          );
        } catch (e) {}
        safeClickSound();
        return;
      }

      levelCompleted = true;
      const ratio = percent / 100;
      const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
      const isFinal = levelIndex >= LEVEL_COUNT - 1;

      showLevelComplete(arena, {
        levelIndex,
        gameId: GAME_ID,
        title: isFinal ? 'Crayon Superstar!' : 'Beautiful Art!',
        message: plan.title + ' looks amazing!',
        isFinal,
        onHub: () => openHub(stage),
        onNext: () => {
          if (isFinal) finishGame(arena, stars);
          else play(stage, levelIndex + 1);
        }
      });
    }

    const done = button(
      'Finish!',
      '⭐',
      'coloring-finish-button',
      completeLevel
    );

    buildPalette();
    buildTools();
    buildSizes();

    toolbarRow.appendChild(toolbar);
    toolbarRow.appendChild(sizeGroup);

    paletteBox.appendChild(palette);

    actionBar.appendChild(done);
    bottomRow.appendChild(progress);
    bottomRow.appendChild(actionBar);

    renderLevelHeader(arena, levelIndex, '', () => openHub(stage));
    arena.appendChild(workspace);
    arena.appendChild(toolbarRow);
    arena.appendChild(paletteBox);
    arena.appendChild(bottomRow);

    stage.appendChild(arena);
    renderScene();
  }

  function openHub(stage) {
    createLevelHub(stage, {
      gameId: GAME_ID,
      title: 'Crayon Coloring Book',
      subtitle: 'Color 10 sketchbook pages!',
      emoji: '🖍️',
      themeClass: 'mc-hub',
      onPlay(lv) { play(stage, lv); }
    });
  }

  register('magic-coloring', {
    name: {
      en: 'Magic Coloring',
      te: 'మ్యాజిక్ కలరింగ్'
    },
    desc: {
      en: 'Color a magical picture',
      te: 'మాయా చిత్రాన్ని రంగులు వేయండి'
    },
    icon: '🖍️',
    cat: 'fun',
    introKey: 'g14_intro',

    start(stage) {
      startWithLevels(stage, '🖍️', 'g14_intro', {
        gameId: GAME_ID,
        title: 'Crayon Coloring Book',
        subtitle: 'Color 10 sketchbook pages!',
        emoji: '🖍️',
        themeClass: 'mc-hub'
      }, (st, lv) => play(st, lv));
    }
  });
})();
