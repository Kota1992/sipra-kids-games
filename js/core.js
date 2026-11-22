/* SiPra Games – Core utilities: storage, audio, i18n, drag */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'sipra_games_v1';

  const DEFAULTS = {
    childName: 'Little Star',
    avatar: '🐻',
    accessory: '',
    language: 'en',
    music: true,
    sfx: true,
    totalStars: 0,
    gameStars: {},
    completedGames: {},
    unlockedAccessories: ['none'],
    equippedAccessory: 'none',
    magicArt: null,
    gameLevelProgress: {}
  };

  const ACCESSORIES = [
    { id: 'none', emoji: '', name: { en: 'None', te: 'లేదు' }, stars: 0 },
    { id: 'crown', emoji: '👑', name: { en: 'Crown', te: 'కిరీటం' }, stars: 5 },
    { id: 'hat', emoji: '🎩', name: { en: 'Fancy Hat', te: 'టోపీ' }, stars: 10 },
    { id: 'flower', emoji: '🌸', name: { en: 'Flower', te: 'పువ్వు' }, stars: 15 },
    { id: 'star', emoji: '🌟', name: { en: 'Star Glow', te: 'నక్షత్రం' }, stars: 20 },
    { id: 'rainbow', emoji: '🌈', name: { en: 'Rainbow', te: 'ఇంద్రధనస్సు' }, stars: 30 }
  ];

  const AVATARS = ['🐻', '🐰', '🐱', '🐶', '🦊', '🐼', '🦄', '🐯', '🐸', '🐵', '🦁', '🐷'];

  /* ---------- i18n ---------- */
  const STRINGS = {
    en: {
      tagline: 'My Little World',
      welcome: 'Welcome to My Little World!',
      cat_all: 'All',
      cat_colors: 'Colors & Shapes',
      cat_animals: 'Animals & Nature',
      cat_learning: 'Learning & Puzzles',
      cat_fun: 'Fun & Creativity',
      all_games: 'All Games',
      pick_game: 'Pick a game to play!',
      my_stars: 'My Stars',
      stars_sub: 'Look at all your shiny stars!',
      total_stars: 'Total Stars',
      accessories: 'Avatar Accessories',
      settings: 'Settings',
      settings_sub: 'Grown-ups can help here',
      child_name: "Child's name",
      choose_avatar: 'Choose avatar',
      language: 'Language',
      music: 'Background music',
      sfx: 'Sound effects',
      reset_progress: 'Reset progress',
      nav_home: 'Home',
      nav_games: 'Games',
      nav_stars: 'Stars',
      nav_settings: 'Settings',
      play: 'Play!',
      play_again: 'Play again',
      go_home: 'Home',
      cancel: 'Cancel',
      parent_gate: 'Ask a grown-up: What is 2 + 3?',
      start: "Let's play!",
      wonderful: 'Wonderful!',
      try_again: 'Try again!',
      you_did_it: 'You did it!',
      superstar: 'Superstar!',
      amazing: 'Amazing!',
      great_job: 'Great job!',
      locked: 'Need',
      stars_word: 'stars',
      reset_confirm: 'Progress cleared! Starting fresh.',
      done: "I'm done!",
      reset_canvas: 'Reset',
      save_drawing: 'Save',
      saved: 'Saved!',
      how_many: 'How many',
      tap_color: 'Pick a color, then tap to paint!',
      spray: 'Spray',
      soap: 'Soap',
      scrub: 'Scrub',
      rinse: 'Rinse',
      polish: 'Polish',
      car_clean: 'Sparkly clean!',
      pop_bubbles: 'Pop the bubbles!',
      pop_balloons: 'Pop the balloons!',
      guide_butterfly: 'Guide butterflies to matching flowers!',
      find_animal: 'Which animal is this?',
      feed_animals: 'Feed the animals!',
      match_shapes: 'Match the shapes!',
      sort_colors: 'Sort by color!',
      missing_shape: 'What comes next?',
      match_shadow: 'Find the match!',
      memory: 'Find the pairs!',
      count_q: 'How many?',
      puzzle: 'Build the puzzle!',
      color_splash: 'Color the pictures!',
      magic_color: 'Magic coloring!',
      car_wash: 'Wash the car!',
      g1_intro: 'Drag each shape into its outline!',
      g2_intro: 'Put each toy in the matching color basket!',
      g3_intro: 'Pick a color, then tap a picture to paint it!',
      g4_intro: 'Look at the pattern. What comes next?',
      g5_intro: 'Listen and guess the animal!',
      g6_intro: 'Drag the right food to each animal!',
      g7_intro: 'Tap the bubbles to pop them!',
      g8_intro: 'Guide each butterfly to a matching flower!',
      g9_intro: 'Drag puzzle pieces into place!',
      g10_intro: 'Count the objects and tap the number!',
      g11_intro: 'Match the picture to its shadow!',
      g12_intro: 'Flip cards and find matching pairs!',
      g13_intro: 'Tap balloons to pop them!',
      g14_intro: 'Pick colors and fill the picture!',
      g15_intro: 'Spray, soap, scrub, rinse, and polish!'
    },
    te: {
      tagline: 'నా చిన్న ప్రపంచం',
      welcome: 'నా చిన్న ప్రపంచానికి స్వాగతం!',
      cat_all: 'అన్నీ',
      cat_colors: 'రంగులు & ఆకారాలు',
      cat_animals: 'జంతువులు & ప్రకృతి',
      cat_learning: 'నేర్చుకోవడం & పజిల్స్',
      cat_fun: 'సరదా & సృజన',
      all_games: 'అన్ని ఆటలు',
      pick_game: 'ఆడటానికి ఒక ఆట ఎంచుకోండి!',
      my_stars: 'నా నక్షత్రాలు',
      stars_sub: 'మీ మెరిసే నక్షత్రాలను చూడండి!',
      total_stars: 'మొత్తం నక్షత్రాలు',
      accessories: 'అవతార్ అలంకరణలు',
      settings: 'సెట్టింగులు',
      settings_sub: 'పెద్దవారు ఇక్కడ సహాయం చేయవచ్చు',
      child_name: 'పిల్ల పేరు',
      choose_avatar: 'అవతార్ ఎంచుకోండి',
      language: 'భాష',
      music: 'నేపథ్య సంగీతం',
      sfx: 'ధ్వని ప్రభావాలు',
      reset_progress: 'ప్రోగ్రెస్ రీసెట్',
      nav_home: 'హోమ్',
      nav_games: 'ఆటలు',
      nav_stars: 'నక్షత్రాలు',
      nav_settings: 'సెట్టింగులు',
      play: 'ఆడండి!',
      play_again: 'మళ్లీ ఆడండి',
      go_home: 'హోమ్',
      cancel: 'రద్దు',
      parent_gate: 'పెద్దవారిని అడగండి: 2 + 3 ఎంత?',
      start: 'ఆడుదాం!',
      wonderful: 'అద్భుతం!',
      try_again: 'మళ్లీ ప్రయత్నించండి!',
      you_did_it: 'మీరు చేశారు!',
      superstar: 'సూపర్ స్టార్!',
      amazing: 'అమేజింగ్!',
      great_job: 'చాలా బాగుంది!',
      locked: 'కావాలి',
      stars_word: 'నక్షత్రాలు',
      reset_confirm: 'ప్రోగ్రెస్ క్లియర్ అయింది!',
      done: 'పూర్తి!',
      reset_canvas: 'రీసెట్',
      save_drawing: 'సేవ్',
      saved: 'సేవ్ అయింది!',
      how_many: 'ఎన్ని',
      tap_color: 'రంగు ఎంచుకుని, తర్వాత తాకండి!',
      spray: 'స్ప్రే',
      soap: 'సబ్బు',
      scrub: 'స్క్రబ్',
      rinse: 'కడుగు',
      polish: 'పాలిష్',
      car_clean: 'మెరిసే కారు!',
      pop_bubbles: 'బుడగలు పాప్ చేయండి!',
      pop_balloons: 'బెలూన్లు పాప్ చేయండి!',
      guide_butterfly: 'సీతాకోకచిలుకలను పువ్వులకు తీసుకెళ్లండి!',
      find_animal: 'ఇది ఏ జంతువు?',
      feed_animals: 'జంతువులకు ఆహారం ఇవ్వండి!',
      match_shapes: 'ఆకారాలను సరిపోల్చండి!',
      sort_colors: 'రంగు ప్రకారం వేరు చేయండి!',
      missing_shape: 'తర్వాత ఏమి వస్తుంది?',
      match_shadow: 'సరిపోలిక కనుగొనండి!',
      memory: 'జోడులు కనుగొనండి!',
      count_q: 'ఎన్ని?',
      puzzle: 'పజిల్ కట్టండి!',
      color_splash: 'చిత్రాలను రంగు వేయండి!',
      magic_color: 'మ్యాజిక్ కలరింగ్!',
      car_wash: 'కారు కడగండి!',
      g1_intro: 'ప్రతి ఆకారాన్ని దాని గీతలోకి లాగండి!',
      g2_intro: 'ప్రతి బొమ్మను సరిపోలే రంగు బాస్కెట్‌లో పెట్టండి!',
      g3_intro: 'రంగు ఎంచుకుని, చిత్రాన్ని తాకి రంగు వేయండి!',
      g4_intro: 'ప్యాటర్న్ చూడండి. తర్వాత ఏమి వస్తుంది?',
      g5_intro: 'విని జంతువును ఊహించండి!',
      g6_intro: 'సరైన ఆహారాన్ని జంతువుకు లాగండి!',
      g7_intro: 'బుడగలను తాకి పాప్ చేయండి!',
      g8_intro: 'సీతాకోకచిలుకను సరిపోలే పువ్వుకు తీసుకెళ్లండి!',
      g9_intro: 'పజిల్ ముక్కలను సరిగ్గా పెట్టండి!',
      g10_intro: 'వస్తువులు లెక్కించి సంఖ్యను తాకండి!',
      g11_intro: 'చిత్రాన్ని దాని నీడతో సరిపోల్చండి!',
      g12_intro: 'కార్డులు తిప్పి జోడులు కనుగొనండి!',
      g13_intro: 'బెలూన్లను తాకి పాప్ చేయండి!',
      g14_intro: 'రంగులు ఎంచుకుని చిత్రం నింపండి!',
      g15_intro: 'స్ప్రే, సబ్బు, స్క్రబ్, కడుగు, పాలిష్!'
    }
  };

  /* ---------- Storage ---------- */
  const Store = {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULTS, gameStars: {}, completedGames: {}, unlockedAccessories: ['none'], gameLevelProgress: {} };
        const data = JSON.parse(raw);
        return {
          ...DEFAULTS,
          ...data,
          gameStars: data.gameStars || {},
          completedGames: data.completedGames || {},
          unlockedAccessories: data.unlockedAccessories || ['none'],
          gameLevelProgress: data.gameLevelProgress || {}
        };
      } catch (e) {
        return { ...DEFAULTS, gameStars: {}, completedGames: {}, unlockedAccessories: ['none'], gameLevelProgress: {} };
      }
    },
    save(state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) { /* ignore quota errors */ }
    },
    reset() {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* */ }
      return { ...DEFAULTS, gameStars: {}, completedGames: {}, unlockedAccessories: ['none'] };
    }
  };

  /* ---------- Audio (Web Audio API – no speech) ---------- */
  const AudioFX = {
    ctx: null,
    musicNodes: null,
    musicPlaying: false,
    unlocked: false,

    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(function () {});
      this.unlocked = true;
      return this.ctx;
    },

    unlock() {
      const ctx = this.ensure();
      if (!ctx) return;
      // Silent buffer unlock for mobile Safari / Chrome
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch (e) { /* */ }
    },

    tone(freq, dur, type, gain, when) {
      const ctx = this.ensure();
      if (!ctx || !SiPra.state.sfx) return;
      const t = when || ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain || 0.15, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    },

    click() {
      this.tone(800, 0.06, 'sine', 0.08);
    },

    pop() {
      const ctx = this.ensure();
      if (!ctx || !SiPra.state.sfx) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(600, t);
      o.frequency.exponentialRampToValueAtTime(80, t + 0.12);
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.16);
    },

    success() {
      if (!SiPra.state.sfx) return;
      const ctx = this.ensure();
      if (!ctx) return;
      const notes = [523, 659, 784, 1046];
      notes.forEach((n, i) => this.tone(n, 0.18, 'triangle', 0.12, ctx.currentTime + i * 0.1));
    },

    celebrate() {
      if (!SiPra.state.sfx) return;
      const melody = [
        { f: 523.25, d: 0.15, t: 0.00 },
        { f: 659.25, d: 0.15, t: 0.13 },
        { f: 783.99, d: 0.15, t: 0.26 },
        { f: 1046.5, d: 0.32, t: 0.39 },
        { f: 783.99, d: 0.15, t: 0.68 },
        { f: 1046.5, d: 0.45, t: 0.83 }
      ];
      const ctx = this.ensure();
      if (!ctx) return;
      melody.forEach((n) => this.tone(n.f, n.d, 'triangle', 0.18, ctx.currentTime + n.t));
    },

    gentle() {
      this.tone(329.63, 0.16, 'sine', 0.1);
      const ctx = this.ensure();
      if (ctx) this.tone(261.63, 0.22, 'sine', 0.1, ctx.currentTime + 0.1);
    },

    animal(kind) {
      const ctx = this.ensure();
      if (!ctx || !SiPra.state.sfx) return;
      const t = ctx.currentTime;
      const patterns = {
        cow: [[180, 0.4], [140, 0.5]],
        dog: [[400, 0.12], [300, 0.12], [380, 0.2]],
        cat: [[800, 0.15], [600, 0.25]],
        elephant: [[90, 0.5], [70, 0.4]],
        lion: [[150, 0.35], [120, 0.5]],
        monkey: [[500, 0.1], [700, 0.1], [450, 0.15]],
        duck: [[450, 0.12], [350, 0.18]],
        bird: [[1200, 0.08], [1400, 0.08], [1100, 0.1]],
        frog: [[300, 0.1], [200, 0.2]],
        pig: [[350, 0.15], [280, 0.2]],
        horse: [[520, 0.1], [660, 0.12], [440, 0.22]],
        sheep: [[420, 0.16], [390, 0.16], [410, 0.2]]
      };
      const seq = patterns[kind] || patterns.bird;
      seq.forEach(([f, d], i) => {
        this.tone(f, d, 'sawtooth', 0.06, t + i * 0.22);
      });
    },

    startMusic() {
      if (!SiPra.state.music || this.musicPlaying) return;
      const ctx = this.ensure();
      if (!ctx) return;
      this.musicPlaying = true;

      const master = ctx.createGain();
      master.gain.value = 0.035;
      master.connect(ctx.destination);

      const notes = [262, 294, 330, 349, 392, 440, 494, 523];
      let step = 0;
      const melody = [0, 2, 4, 2, 0, 4, 5, 4, 3, 2, 1, 0, 2, 4, 7, 4];

      const tick = () => {
        if (!this.musicPlaying || !SiPra.state.music) return;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = notes[melody[step % melody.length]];
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        o.connect(g);
        g.connect(master);
        o.start();
        o.stop(ctx.currentTime + 0.4);
        step++;
        this._musicTimer = setTimeout(tick, 420);
      };
      tick();
      this.musicNodes = { master };
    },

    stopMusic() {
      this.musicPlaying = false;
      if (this._musicTimer) {
        clearTimeout(this._musicTimer);
        this._musicTimer = null;
      }
    },

    syncMusic() {
      if (SiPra.state.music) {
        if (!this.musicPlaying) this.startMusic();
      } else {
        this.stopMusic();
      }
    }
  };

  /* ---------- i18n helper ---------- */
  function t(key) {
    const lang = (SiPra.state && SiPra.state.language) || 'en';
    return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  }

  function applyI18n(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
  }

  /* ---------- Pointer drag ---------- */
  function returnDrag(el) {
    if (!el || !el._homePos) return;
    el.style.transition = 'left 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)';
    el.style.left = el._homePos.x + 'px';
    el.style.top = el._homePos.y + 'px';
    el.style.zIndex = '5';
    setTimeout(() => { if (el) el.style.transition = ''; }, 240);
  }

  function enableDrag(el, opts) {
    const options = opts || {};
    let dragging = false;
    let startX = 0, startY = 0, origX = 0, origY = 0;
    let lastDx = 0, lastDy = 0;
    let pointerId = null;
    let parent = null;

    // Ensure drag parent is a positioning context
    const ensureParent = () => {
      parent = el.parentElement;
      if (parent && getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }
      return parent;
    };

    // Freeze element at current visual position before first drag
    const freezePosition = () => {
      ensureParent();
      if (!parent) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      const x = rect.left - parentRect.left + parent.scrollLeft;
      const y = rect.top - parentRect.top + parent.scrollTop;
      el.style.position = 'absolute';
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.margin = '0';
      el.style.zIndex = '5';
      if (!el._homePos) el._homePos = { x, y };
      return { x, y };
    };

    el._returnHome = () => returnDrag(el);

    // Pre-freeze after layout so siblings don't jump on first drag.
    // Batch by parent: measure all, lock parent minHeight, then apply.
    requestAnimationFrame(() => {
      if (el._dragDisabled || !el.isConnected || !el.parentElement) return;
      const p = el.parentElement;
      if (!p._sipraDragBatch) {
        p._sipraDragBatch = [];
        requestAnimationFrame(() => {
          const batch = (p._sipraDragBatch || []).filter((n) => n.isConnected && n.parentElement === p);
          p._sipraDragBatch = null;
          if (!batch.length || !p.isConnected) return;
          if (getComputedStyle(p).position === 'static') p.style.position = 'relative';
          const h = p.offsetHeight;
          if (h > 0) p.style.minHeight = h + 'px';
          const parentRect = p.getBoundingClientRect();
          const measured = batch.map((node) => {
            const rect = node.getBoundingClientRect();
            return {
              node,
              x: rect.left - parentRect.left + p.scrollLeft,
              y: rect.top - parentRect.top + p.scrollTop
            };
          });
          measured.forEach(({ node, x, y }) => {
            if (node._dragDisabled) return;
            node.style.position = 'absolute';
            node.style.left = x + 'px';
            node.style.top = y + 'px';
            node.style.margin = '0';
            node.style.zIndex = '5';
            node._homePos = { x, y };
          });
        });
      }
      p._sipraDragBatch.push(el);
    });

    const onDown = (e) => {
      if (el._dragDisabled) return;
      e.preventDefault();
      e.stopPropagation();
      dragging = true;
      pointerId = e.pointerId;
      lastDx = 0;
      lastDy = 0;
      try { el.setPointerCapture(pointerId); } catch (err) { /* */ }
      el.classList.add('dragging');
      el.style.transition = '';
      const pos = freezePosition();
      startX = e.clientX;
      startY = e.clientY;
      origX = pos.x;
      origY = pos.y;
      el.style.zIndex = '100';
      if (options.onStart) options.onStart(el, e);
      AudioFX.click();
    };

    const onMove = (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      e.preventDefault();
      lastDx = e.clientX - startX;
      lastDy = e.clientY - startY;
      el.style.left = (origX + lastDx) + 'px';
      el.style.top = (origY + lastDy) + 'px';
      if (options.onMove) options.onMove(el, e);
    };

    const onUp = (e) => {
      if (!dragging || (pointerId !== null && e.pointerId !== pointerId)) return;
      dragging = false;
      el.classList.remove('dragging');
      el.style.zIndex = '5';
      try { el.releasePointerCapture(pointerId); } catch (err) { /* */ }
      pointerId = null;
      const moved = Math.hypot(lastDx, lastDy);
      if (options.onEnd) options.onEnd(el, e, { dx: lastDx, dy: lastDy, moved });
    };

    el.classList.add('draggable');
    el.style.touchAction = 'none';
    el.style.userSelect = 'none';
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }

  function getCenter(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function hits(el, target, threshold) {
    const a = getCenter(el);
    const b = getCenter(target);
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (threshold || 55);
  }

  function snapTo(el, target) {
    const parent = el.offsetParent || el.parentElement;
    const parentRect = parent.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    el.style.left = (tRect.left - parentRect.left + (tRect.width - elRect.width) / 2) + 'px';
    el.style.top = (tRect.top - parentRect.top + (tRect.height - elRect.height) / 2) + 'px';
    el.style.transition = 'left 0.2s ease, top 0.2s ease';
    setTimeout(() => { el.style.transition = ''; }, 250);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function showFeedback(container, message, happy) {
    let fb = container.querySelector('.g-feedback');
    if (!fb) {
      fb = document.createElement('div');
      fb.className = 'g-feedback';
      container.appendChild(fb);
    }
    fb.textContent = message;
    fb.classList.toggle('sad', !happy);
    fb.classList.add('show');
    if (happy) {
      AudioFX.success();
      const rect = container.getBoundingClientRect();
      burstParticles(rect.left + rect.width / 2, rect.top + rect.height * 0.4);
    } else {
      AudioFX.gentle();
    }
    if (fb._hideTimer) clearTimeout(fb._hideTimer);
    fb._hideTimer = setTimeout(() => fb.classList.remove('show'), 900);
  }

  function burstParticles(x, y, emojis, count) {
    const icons = emojis || ['⭐', '🌟', '💖', '✨', '🎈'];
    const n = count || 10;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.textContent = icons[i % icons.length];
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      const angle = (Math.PI * 2 * i) / n;
      const dist = 55 + Math.random() * 75;
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 880);
    }
  }

  function pointsPopup(points, x, y) {
    const popup = document.createElement('div');
    popup.className = 'points-popup';
    popup.textContent = '+' + points + ' ⭐';
    popup.style.left = Math.max(60, Math.min(window.innerWidth - 60, x)) + 'px';
    popup.style.top = Math.max(80, Math.min(window.innerHeight - 60, y)) + 'px';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1100);
  }

  function bumpScorePill() {
    const pill = document.getElementById('score-pill');
    const val = document.getElementById('score-pill-value');
    if (val) val.textContent = String(SiPra.state.totalStars || 0);
    if (!pill) return;
    pill.classList.remove('bump');
    void pill.offsetWidth;
    pill.classList.add('bump');
    setTimeout(() => pill.classList.remove('bump'), 250);
  }

  function spawnConfetti(container, count) {
    const colors = ['#FF8A65', '#FFD54F', '#69F0AE', '#40C4FF', '#FFAB91'];
    for (let i = 0; i < (count || 18); i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left = rand(10, 90) + '%';
      p.style.top = rand(20, 60) + '%';
      p.style.background = pick(colors);
      p.style.animationDelay = rand(0, 0.3) + 's';
      container.appendChild(p);
      setTimeout(() => p.remove(), 1300);
    }
    const rect = container.getBoundingClientRect();
    burstParticles(rect.left + rect.width * 0.3, rect.top + rect.height * 0.4, ['🌈', '⭐', '🎉', '🎈'], 8);
    burstParticles(rect.left + rect.width * 0.7, rect.top + rect.height * 0.4, ['🌈', '⭐', '🎉', '🎈'], 8);
  }

  function spawnSparkle(x, y, parent) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.textContent = pick(['✨', '⭐', '💫']);
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    (parent || document.body).appendChild(s);
    setTimeout(() => s.remove(), 850);
  }

  function createIntro(stage, icon, introKey, onStart) {
    stage.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'g-intro';
    wrap.innerHTML =
      '<div class="g-intro-icon">' + icon + '</div>' +
      '<p class="g-intro-text">' + t(introKey) + '</p>';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-play-start';
    btn.textContent = t('start');
    btn.addEventListener('click', () => {
      AudioFX.click();
      onStart();
    });
    wrap.appendChild(btn);
    stage.appendChild(wrap);
  }

  function svgShape(type, color, size) {
    const s = size || 56;
    const shapes = {
      circle: `<circle cx="${s/2}" cy="${s/2}" r="${s/2 - 4}" fill="${color}"/>`,
      square: `<rect x="6" y="6" width="${s-12}" height="${s-12}" rx="6" fill="${color}"/>`,
      triangle: `<polygon points="${s/2},6 ${s-4},${s-6} 4,${s-6}" fill="${color}"/>`,
      rectangle: `<rect x="4" y="${s*0.25}" width="${s-8}" height="${s*0.5}" rx="6" fill="${color}"/>`,
      star: `<polygon points="${s/2},4 ${s*0.61},${s*0.35} ${s-4},${s*0.38} ${s*0.68},${s*0.62} ${s*0.78},${s-4} ${s/2},${s*0.72} ${s*0.22},${s-4} ${s*0.32},${s*0.62} 4,${s*0.38} ${s*0.39},${s*0.35}" fill="${color}"/>`,
      diamond: `<polygon points="${s/2},5 ${s-6},${s/2} ${s/2},${s-5} 6,${s/2}" fill="${color}"/>`,
      heart: `<path d="M${s/2},${s*0.84} C${s*0.18},${s*0.62} ${s*0.08},${s*0.36} ${s*0.26},${s*0.2} C${s*0.38},${s*0.1} ${s*0.48},${s*0.22} ${s/2},${s*0.3} C${s*0.52},${s*0.22} ${s*0.62},${s*0.1} ${s*0.74},${s*0.2} C${s*0.92},${s*0.36} ${s*0.82},${s*0.62} ${s/2},${s*0.84} Z" fill="${color}"/>`
    };
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">${shapes[type] || shapes.circle}</svg>`;
  }

  /* ---------- Public namespace ---------- */
  const SiPra = {
    state: Store.load(),
    Store,
    AudioFX,
    t,
    applyI18n,
    enableDrag,
    returnDrag,
    hits,
    snapTo,
    shuffle,
    rand,
    pick,
    showFeedback,
    spawnConfetti,
    spawnSparkle,
    burstParticles,
    pointsPopup,
    bumpScorePill,
    createIntro,
    svgShape,
    ACCESSORIES,
    AVATARS,
    STRINGS,
    GAMES: {},
    currentGame: null,
    cleanupFns: []
  };

  global.SiPra = SiPra;
})(window);
