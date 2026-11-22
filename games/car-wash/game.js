/* Game 15: Happy Car Wash — 10 levels */
(function () {
  'use strict';

  const {
    S, t, A, register, trackCleanup, progressDots, celebrateEl, finishGame,
    LEVEL_COUNT, startWithLevels, createLevelHub, showLevelComplete, renderLevelHeader,
    safeTimeout
  } = window.SiPraGameKit;

  const GAME_ID = 'car-wash';

  /** Each level: different vehicle + tougher mud */
  const LEVEL_PLAN = [
    { id: 'car', title: 'Little Blue Car', emoji: '🚗', scrub: 10, dirt: 0.95, spots: 4, spray: 12, rinse: 16 },
    { id: 'taxi', title: 'Yellow Taxi', emoji: '🚕', scrub: 12, dirt: 1, spots: 5, spray: 12, rinse: 17 },
    { id: 'bus', title: 'School Bus', emoji: '🚌', scrub: 14, dirt: 1, spots: 6, spray: 14, rinse: 18 },
    { id: 'truck', title: 'Pickup Truck', emoji: '🛻', scrub: 16, dirt: 1, spots: 6, spray: 14, rinse: 19 },
    { id: 'scooter', title: 'Cute Scooter', emoji: '🛵', scrub: 17, dirt: 1, spots: 7, spray: 15, rinse: 20 },
    { id: 'tractor', title: 'Farm Tractor', emoji: '🚜', scrub: 19, dirt: 1, spots: 8, spray: 16, rinse: 21 },
    { id: 'van', title: 'Family Van', emoji: '🚐', scrub: 20, dirt: 1, spots: 8, spray: 16, rinse: 22 },
    { id: 'fire', title: 'Fire Truck', emoji: '🚒', scrub: 22, dirt: 1, spots: 9, spray: 17, rinse: 23 },
    { id: 'ambulance', title: 'Ambulance', emoji: '🚑', scrub: 24, dirt: 1, spots: 9, spray: 18, rinse: 24 },
    { id: 'sports', title: 'Race Car', emoji: '🏎️', scrub: 28, dirt: 1, spots: 10, spray: 20, rinse: 26 }
  ];

  function dirtEllipses(n, opacity) {
    const coords = [
      [115, 110, 20, 11], [190, 120, 24, 13], [155, 70, 15, 9], [220, 105, 18, 10],
      [130, 130, 16, 10], [250, 95, 22, 12], [85, 125, 14, 9], [200, 75, 17, 10],
      [165, 145, 19, 11], [235, 115, 21, 12]
    ];
    let html = '';
    for (let i = 0; i < Math.min(n, coords.length); i++) {
      const c = coords[i];
      const o = opacity * (0.85 + (i % 3) * 0.05);
      html += `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${c[2]}" ry="${c[3]}" fill="rgba(75,55,30,${o})"/>`;
    }
    return html;
  }

  function vehicleSvg(plan) {
    const body = plan.id;
    const dirt = dirtEllipses(plan.spots, plan.dirt);

    const templates = {
      car: `
        <rect x="48" y="95" width="244" height="58" rx="22" fill="#40C4FF"/>
        <path d="M95 95 L125 48 H215 L250 95 Z" fill="#81D4FA"/>
        <rect x="132" y="58" width="42" height="30" rx="5" fill="#E1F5FE"/>
        <rect x="185" y="58" width="42" height="30" rx="5" fill="#E1F5FE"/>
        <circle cx="100" cy="155" r="24" fill="#37474F"/><circle cx="100" cy="155" r="11" fill="#90A4AE"/>
        <circle cx="240" cy="155" r="24" fill="#37474F"/><circle cx="240" cy="155" r="11" fill="#90A4AE"/>
        <circle cx="70" cy="115" r="7" fill="#FFD740"/>`,
      taxi: `
        <rect x="42" y="98" width="256" height="54" rx="20" fill="#FFD600"/>
        <path d="M88 98 L118 50 H222 L258 98 Z" fill="#FFEB3B"/>
        <rect x="145" y="72" width="50" height="22" rx="4" fill="#212121"/>
        <text x="170" y="88" text-anchor="middle" font-size="14" font-weight="900" fill="#FFD600">TAXI</text>
        <circle cx="95" cy="155" r="24" fill="#37474F"/><circle cx="95" cy="155" r="11" fill="#B0BEC5"/>
        <circle cx="245" cy="155" r="24" fill="#37474F"/><circle cx="245" cy="155" r="11" fill="#B0BEC5"/>`,
      bus: `
        <rect x="55" y="72" width="230" height="82" rx="14" fill="#FFAB00"/>
        <rect x="70" y="88" width="45" height="38" rx="4" fill="#FFF8E1"/>
        <rect x="125" y="88" width="45" height="38" rx="4" fill="#FFF8E1"/>
        <rect x="180" y="88" width="45" height="38" rx="4" fill="#FFF8E1"/>
        <rect x="235" y="88" width="35" height="38" rx="4" fill="#FFF8E1"/>
        <rect x="68" y="138" width="204" height="14" rx="4" fill="#E65100"/>
        <circle cx="100" cy="162" r="22" fill="#263238"/><circle cx="100" cy="162" r="10" fill="#90A4AE"/>
        <circle cx="240" cy="162" r="22" fill="#263238"/><circle cx="240" cy="162" r="10" fill="#90A4AE"/>`,
      truck: `
        <rect x="38" y="108" width="110" height="52" rx="10" fill="#66BB6A"/>
        <rect x="155" y="88" width="150" height="72" rx="8" fill="#43A047"/>
        <rect x="48" y="72" width="88" height="42" rx="8" fill="#81C784"/>
        <circle cx="95" cy="162" r="22" fill="#37474F"/><circle cx="95" cy="162" r="10" fill="#90A4AE"/>
        <circle cx="245" cy="162" r="22" fill="#37474F"/><circle cx="245" cy="162" r="10" fill="#90A4AE"/>`,
      scooter: `
        <ellipse cx="155" cy="145" rx="55" ry="28" fill="#F48FB1"/>
        <rect x="130" y="95" width="50" height="55" rx="12" fill="#EC407A"/>
        <path d="M175 95 L210 55 L220 95 Z" fill="#F06292"/>
        <circle cx="120" cy="162" r="20" fill="#37474F"/><circle cx="120" cy="162" r="9" fill="#90A4AE"/>
        <circle cx="195" cy="162" r="20" fill="#37474F"/><circle cx="195" cy="162" r="9" fill="#90A4AE"/>`,
      tractor: `
        <rect x="100" y="100" width="150" height="50" rx="8" fill="#8BC34A"/>
        <rect x="55" y="85" width="55" height="70" rx="6" fill="#689F38"/>
        <circle cx="75" cy="158" r="28" fill="#37474F"/><circle cx="75" cy="158" r="14" fill="#78909C"/>
        <circle cx="155" cy="158" r="22" fill="#37474F"/><circle cx="155" cy="158" r="10" fill="#90A4AE"/>
        <circle cx="230" cy="158" r="22" fill="#37474F"/><circle cx="230" cy="158" r="10" fill="#90A4AE"/>
        <rect x="200" y="72" width="8" height="35" fill="#795548"/>`,
      van: `
        <rect x="50" y="78" width="240" height="80" rx="16" fill="#7E57C2"/>
        <rect x="75" y="95" width="55" height="45" rx="5" fill="#EDE7F6"/>
        <rect x="145" y="95" width="55" height="45" rx="5" fill="#EDE7F6"/>
        <rect x="215" y="95" width="55" height="45" rx="5" fill="#EDE7F6"/>
        <circle cx="100" cy="162" r="22" fill="#37474F"/><circle cx="100" cy="162" r="10" fill="#90A4AE"/>
        <circle cx="240" cy="162" r="22" fill="#37474F"/><circle cx="240" cy="162" r="10" fill="#90A4AE"/>`,
      fire: `
        <rect x="48" y="85" width="244" height="68" rx="12" fill="#E53935"/>
        <rect x="65" y="100" width="50" height="40" rx="4" fill="#FFCDD2"/>
        <rect x="195" y="100" width="80" height="40" rx="4" fill="#FFEBEE"/>
        <path d="M160 50 L175 85 H145 Z" fill="#FFD600"/>
        <circle cx="95" cy="162" r="24" fill="#263238"/><circle cx="95" cy="162" r="11" fill="#90A4AE"/>
        <circle cx="245" cy="162" r="24" fill="#263238"/><circle cx="245" cy="162" r="11" fill="#90A4AE"/>`,
      ambulance: `
        <rect x="48" y="88" width="244" height="65" rx="14" fill="#FAFAFA" stroke="#B0BEC5" stroke-width="2"/>
        <rect x="145" y="105" width="50" height="35" rx="4" fill="#E3F2FD"/>
        <path d="M168 115 H172 V125 H182 V129 H172 V139 H168 V129 H158 V125 H168 Z" fill="#E53935"/>
        <circle cx="95" cy="162" r="24" fill="#37474F"/><circle cx="95" cy="162" r="11" fill="#90A4AE"/>
        <circle cx="245" cy="162" r="24" fill="#37474F"/><circle cx="245" cy="162" r="11" fill="#90A4AE"/>`,
      sports: `
        <path d="M55 125 Q95 95 170 105 Q245 95 285 125 L275 148 Q240 135 170 138 Q100 135 65 148 Z" fill="#212121"/>
        <path d="M100 108 L140 78 H200 L245 108 Z" fill="#424242"/>
        <rect x="150" y="88" width="40" height="22" rx="3" fill="#616161"/>
        <circle cx="110" cy="158" r="26" fill="#111"/><circle cx="110" cy="158" r="12" fill="#FFD600"/>
        <circle cx="230" cy="158" r="26" fill="#111"/><circle cx="230" cy="158" r="12" fill="#FFD600"/>
        <path d="M70 118 L200 118" stroke="#FFD600" stroke-width="3" opacity="0.8"/>`
    };

    const shape = templates[body] || templates.car;

    return `
      <svg class="car-svg" viewBox="0 0 340 190" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="170" cy="172" rx="110" ry="12" fill="rgba(0,0,0,0.12)"/>
        ${shape}
        <g id="dirt" class="dirt-layer">${dirt}</g>
        <g id="soap" class="soap-layer">
          <circle cx="105" cy="105" r="16" fill="rgba(255,255,255,0.9)"/>
          <circle cx="150" cy="115" r="20" fill="rgba(255,255,255,0.85)"/>
          <circle cx="200" cy="98" r="18" fill="rgba(255,255,255,0.9)"/>
          <circle cx="170" cy="72" r="14" fill="rgba(255,255,255,0.8)"/>
          <circle cx="235" cy="125" r="17" fill="rgba(255,255,255,0.85)"/>
        </g>
        <g id="shine" opacity="0">
          <path d="M135 55 L140 72 L155 78 L140 84 L135 101 L130 84 L115 78 L130 72 Z" fill="#FFD740"/>
          <path d="M210 88 L213 100 L225 104 L213 108 L210 120 L207 108 L195 104 L207 100 Z" fill="#FFD740"/>
        </g>
      </svg>`;
  }

  register('car-wash', {
    name: { en: 'Car Wash', te: 'కారు వాష్' },
    desc: { en: 'Wash ten vehicles shiny clean!', te: 'పది వాహనాలను మెరిసేలా కడగండి!' },
    icon: '🚗',
    cat: 'fun',
    introKey: 'g15_intro',

    start(stage) {
      startWithLevels(stage, '🚗', 'g15_intro', {
        gameId: GAME_ID,
        title: 'Happy Car Wash',
        subtitle: '10 bubbly wash levels!',
        emoji: '🫧',
        themeClass: 'cw-hub'
      }, (st, lv) => play(st, lv));

      function openHub(st) {
        createLevelHub(st, {
          gameId: GAME_ID,
          title: 'Happy Car Wash',
          subtitle: '10 bubbly wash levels!',
          emoji: '🫧',
          themeClass: 'cw-hub',
          onPlay(lv) { play(st, lv); }
        });
      }

      function play(stage, levelIndex) {
        const plan = LEVEL_PLAN[levelIndex] || LEVEL_PLAN[0];
        const steps = ['spray', 'soap', 'scrub', 'rinse', 'polish'];
        let step = 0;
        let scrub = 0;
        let scrubActive = false;
        let levelDone = false;

        stage.innerHTML = '';

        const arena = document.createElement('div');
        arena.className = 'gp-arena cw-arena';

        arena.innerHTML = `
          <div class="cw-bg" aria-hidden="true">
            <div class="cw-sky"></div>
            <div class="cw-sun">☀️</div>
            <div class="cw-cloud cw-c1">☁️</div>
            <div class="cw-cloud cw-c2">☁️</div>
            <div class="cw-bubbles"></div>
            <div class="cw-floor"></div>
          </div>
        `;

        const hero = document.createElement('header');
        hero.className = 'cw-hero';
        hero.innerHTML = `
          <div class="cw-brand">
            <span class="cw-brand-icon">🫧</span>
            <div>
              <div class="cw-brand-title">Happy Car Wash</div>
              <div class="cw-vehicle-name">${plan.emoji} ${plan.title}</div>
            </div>
          </div>
        `;

        const label = document.createElement('div');
        label.className = 'cw-step-label';
        label.textContent = t('spray');

        const dots = document.createElement('div');
        dots.className = 'cw-dots';
        dots.innerHTML = progressDots(5, 0);

        const scene = document.createElement('div');
        scene.className = 'car-scene-pro';
        scene.innerHTML = vehicleSvg(plan);

        const scrubZone = document.createElement('div');
        scrubZone.className = 'scrub-zone';
        scrubZone.style.display = 'none';
        scene.appendChild(scrubZone);

        const tools = document.createElement('div');
        tools.className = 'wash-tools-pro';
        const defs = [
          { id: 'spray', icon: '💦', key: 'spray' },
          { id: 'soap', icon: '🧼', key: 'soap' },
          { id: 'scrub', icon: '🧽', key: 'scrub' },
          { id: 'rinse', icon: '🚿', key: 'rinse' },
          { id: 'polish', icon: '✨', key: 'polish' }
        ];
        const btns = {};

        function setTools() {
          defs.forEach((d, i) => {
            const b = btns[d.id];
            b.classList.toggle('active', i === step);
            b.classList.toggle('done', i < step);
            b.disabled = i !== step || (d.id === 'scrub' && scrubActive);
          });
          label.textContent = t(steps[step] || 'car_clean');
          dots.innerHTML = progressDots(5, step);
        }

        function sprayDrops(n, color) {
          for (let i = 0; i < n; i++) {
            const d = document.createElement('div');
            d.className = 'water-spray';
            if (color) d.style.background = color;
            d.style.left = S().rand(18, 82) + '%';
            d.style.top = S().rand(18, 75) + '%';
            scene.appendChild(d);
            safeTimeout(() => d.remove(), 500);
          }
        }

        function finishLevel() {
          if (levelDone) return;
          levelDone = true;
          const isFinal = levelIndex >= LEVEL_COUNT - 1;
          showLevelComplete(arena, {
            levelIndex,
            gameId: GAME_ID,
            title: isFinal ? 'Sparkle champion!' : 'Squeaky clean!',
            message: plan.emoji + ' ' + plan.title + ' shines like new!',
            isFinal,
            onHub: () => openHub(stage),
            onNext: () => {
              if (isFinal) finishGame(arena, 3);
              else play(stage, levelIndex + 1);
            }
          });
        }

        function doStep(id) {
          if (levelDone) return;
          const dirt = scene.querySelector('#dirt');
          const soap = scene.querySelector('#soap');
          const shine = scene.querySelector('#shine');
          const car = scene.querySelector('.car-svg');

          if (id === 'spray') {
            sprayDrops(plan.spray);
            A().pop();
            dirt.style.opacity = String(Math.max(0.45, plan.dirt - 0.35));
            step++;
            setTools();
          } else if (id === 'soap') {
            soap.classList.add('show');
            A().gentle();
            celebrateEl(car, 'car-bounce');
            step++;
            setTools();
          } else if (id === 'scrub') {
            if (scrubActive) return;
            scrubActive = true;
            setTools();
            scrubZone.style.display = 'block';
            scrub = 0;
            label.textContent = (t('scrub') || 'Rub the car!') + ' ✨';

            let pointerDown = false;
            const doScrubStroke = () => {
              if (!scrubActive || levelDone) return;
              scrub++;
              sprayDrops(1, 'rgba(255,255,255,0.85)');
              if (scrub % 3 === 0) A().click();
              const fade = 1 - (scrub / plan.scrub) * 0.8;
              dirt.style.opacity = String(Math.max(0.05, fade * plan.dirt));
              if (scrub >= plan.scrub) {
                cleanupScrub();
                scrubActive = false;
                scrubZone.style.display = 'none';
                dirt.style.opacity = '0.15';
                A().success();
                step++;
                setTools();
              }
            };

            const onDown = (e) => {
              e.preventDefault();
              pointerDown = true;
              try { scrubZone.setPointerCapture(e.pointerId); } catch (err) {}
              doScrubStroke();
            };
            const onMove = (e) => {
              if (!pointerDown && e.buttons === 0) return;
              e.preventDefault();
              doScrubStroke();
            };
            const onUp = () => { pointerDown = false; };

            const cleanupScrub = () => {
              scrubZone.removeEventListener('pointerdown', onDown);
              scrubZone.removeEventListener('pointermove', onMove);
              scrubZone.removeEventListener('pointerup', onUp);
              scrubZone.removeEventListener('pointercancel', onUp);
            };

            scrubZone.addEventListener('pointerdown', onDown);
            scrubZone.addEventListener('pointermove', onMove);
            scrubZone.addEventListener('pointerup', onUp);
            scrubZone.addEventListener('pointercancel', onUp);
            trackCleanup(cleanupScrub);
          } else if (id === 'rinse') {
            sprayDrops(plan.rinse);
            soap.classList.remove('show');
            dirt.style.opacity = '0';
            A().pop();
            step++;
            setTools();
          } else if (id === 'polish') {
            shine.setAttribute('opacity', '1');
            car.classList.add('shiny');
            A().celebrate();
            try {
              S().burstParticles(
                scene.getBoundingClientRect().left + scene.offsetWidth / 2,
                scene.getBoundingClientRect().top + 60,
                ['✨', '💦', '🫧', '⭐'],
                14
              );
            } catch (e) {}
            S().showFeedback(arena, t('car_clean'), true);
            step++;
            setTools();
            safeTimeout(finishLevel, 850);
          }
        }

        defs.forEach((d) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'wash-chip';
          b.innerHTML = '<span class="t-icon">' + d.icon + '</span><span>' + t(d.key) + '</span>';
          btns[d.id] = b;
          b.addEventListener('click', () => {
            if (steps[step] !== d.id || levelDone) return;
            A().click();
            doStep(d.id);
          });
          tools.appendChild(b);
        });

        arena.appendChild(hero);
        renderLevelHeader(arena, levelIndex, '', () => openHub(stage));
        arena.appendChild(label);
        arena.appendChild(dots);
        arena.appendChild(scene);
        arena.appendChild(tools);
        stage.appendChild(arena);
        setTools();
      }
    }
  });
})();