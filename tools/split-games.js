/* One-time splitter: js/games.js -> games/<id>/game.js */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'js', 'games.js'), 'utf8');

const kit = `/* SiPra Games – shared helpers for all mini-games */
(function (global) {
  'use strict';
  const S = () => global.SiPra;
  const t = (k) => S().t(k);
  const A = () => S().AudioFX;

  function register(id, def) { S().GAMES[id] = def; }
  function onComplete(stars) { if (S().onGameComplete) S().onGameComplete(stars); }
  function trackCleanup(fn) { S().cleanupFns.push(fn); }

  function flyEmoji(emoji, fromEl, toEl, done) {
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const flyer = document.createElement('div');
    flyer.className = 'fly-emoji';
    flyer.textContent = emoji;
    flyer.style.left = (a.left + a.width / 2 - 28) + 'px';
    flyer.style.top = (a.top + a.height / 2 - 28) + 'px';
    document.body.appendChild(flyer);
    requestAnimationFrame(() => {
      flyer.style.left = (b.left + b.width / 2 - 28) + 'px';
      flyer.style.top = (b.top + b.height / 2 - 28) + 'px';
      flyer.style.transform = 'scale(0.35) rotate(360deg)';
      flyer.style.opacity = '0.15';
    });
    setTimeout(() => { flyer.remove(); if (done) done(); }, 380);
  }

  function progressDots(n, filled) {
    let html = '<div class="round-dots">';
    for (let i = 0; i < n; i++) {
      html += '<span class="rdot' + (i < filled ? ' on' : '') + '">⭐</span>';
    }
    return html + '</div>';
  }

  function celebrateEl(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function finishGame(stage, stars) {
    S().spawnConfetti(stage);
    A().celebrate();
    setTimeout(() => onComplete(stars), 700);
  }

  global.SiPraGameKit = {
    S, t, A, register, onComplete, trackCleanup,
    flyEmoji, progressDots, celebrateEl, finishGame
  };
})(window);
`;

const meta = {
  'shape-matching': { num: 1, title: 'Shape Matching', cat: 'Colors & Shapes', summary: 'Drag or place shapes into matching nests/outlines. Celebrate each match.' },
  'color-sorting': { num: 2, title: 'Color Sorting', cat: 'Colors & Shapes', summary: 'Show a colorful toy; child taps the matching color basket.' },
  'color-splash': { num: 3, title: 'Color Splash', cat: 'Colors & Shapes', summary: 'Pick a palette color, then tap grayscale pictures to paint them.' },
  'missing-shape': { num: 4, title: 'Find the Missing Shape', cat: 'Colors & Shapes', summary: 'Show a simple pattern with a missing item; child picks the correct next item.' },
  'guess-animal': { num: 5, title: 'Guess the Animal', cat: 'Animals & Nature', summary: 'Show silhouette + optional sound; child picks the correct animal from 2–3 choices.' },
  'feed-animals': { num: 6, title: 'Feed the Animals', cat: 'Animals & Nature', summary: 'Hungry animal with thought-bubble food; child taps the correct food.' },
  'bubble-pop': { num: 7, title: 'Bubble Pop', cat: 'Animals & Nature', summary: 'Endless relaxing bubble pop with particles; no fail state.' },
  'butterfly-garden': { num: 8, title: 'Butterfly Garden', cat: 'Animals & Nature', summary: 'Guide butterflies to matching colored flowers.' },
  'jigsaw': { num: 9, title: 'Simple Jigsaw Puzzles', cat: 'Learning & Puzzles', summary: '2/4/6 piece drag puzzles that get harder.' },
  'count-objects': { num: 10, title: 'Count the Objects', cat: 'Learning & Puzzles', summary: 'Count items and tap the correct number 1–10.' },
  'shadow-match': { num: 11, title: 'Shadow Matching', cat: 'Learning & Puzzles', summary: 'Match a colorful picture to its silhouette/shadow.' },
  'memory': { num: 12, title: 'Memory Cards', cat: 'Learning & Puzzles', summary: 'Flip cards/eggs to find matching pairs; increase pair count gradually.' },
  'balloon-pop': { num: 13, title: 'Balloon Pop', cat: 'Fun & Creativity', summary: 'Pop rising balloons; endless and relaxing.' },
  'magic-coloring': { num: 14, title: 'Magic Coloring', cat: 'Fun & Creativity', summary: 'Tap-to-fill coloring page with palette; optional local save.' },
  'car-wash': { num: 15, title: 'Car Wash', cat: 'Fun & Creativity', summary: 'Spray, soap, scrub, rinse, polish a dirty cartoon car.' }
};

fs.mkdirSync(path.join(root, 'games', '_kit'), { recursive: true });
fs.writeFileSync(path.join(root, 'games', '_kit', 'game-kit.js'), kit);

const parts = src.split(/\n  register\('/);
const found = {};
for (let i = 1; i < parts.length; i++) {
  const idMatch = parts[i].match(/^([^']+)'/);
  if (!idMatch) continue;
  const id = idMatch[1];
  let body = parts[i].replace(/^[^']+',\s*/, '');
  const closeIdx = body.indexOf('\n  });');
  if (closeIdx === -1) {
    console.error('Could not close', id);
    continue;
  }
  const def = body.slice(0, closeIdx + '\n  }'.length);
  found[id] = def;
}

console.log('Extracted', Object.keys(found).length, 'games');

const order = Object.keys(meta);
const scriptTags = [];

for (const id of order) {
  const dir = path.join(root, 'games', id);
  fs.mkdirSync(dir, { recursive: true });
  const def = found[id];
  if (!def) {
    console.error('MISSING', id);
    continue;
  }
  const m = meta[id];
  const gameJs =
    '/* Game ' + m.num + ': ' + m.title + '\n' +
    ' * Folder: games/' + id + '/\n' +
    ' * Replace this file to rebuild the game. Keep the same register() contract.\n' +
    ' */\n' +
    '(function () {\n' +
    "  'use strict';\n" +
    '  const { S, t, A, register, onComplete, trackCleanup, flyEmoji, progressDots, celebrateEl, finishGame } = window.SiPraGameKit;\n\n' +
    "  register('" + id + "', " + def + ');\n' +
    '})();\n';

  fs.writeFileSync(path.join(dir, 'game.js'), gameJs);

  const readme =
    '# Game ' + m.num + ': ' + m.title + '\n\n' +
    '**ID:** `' + id + '`  \n' +
    '**Category:** ' + m.cat + '  \n' +
    '**Goal:** ' + m.summary + '\n\n' +
    '## Files\n' +
    '- `game.js` – current playable implementation (replace to rebuild)\n' +
    '- Optional `style.css` – game-only styles (link from `index.html` if added)\n\n' +
    '## Contract (keep this API)\n\n' +
    '```js\n' +
    "SiPraGameKit.register('" + id + "', {\n" +
    "  name: { en: '...', te: '...' },\n" +
    "  desc: { en: '...', te: '...' },\n" +
    "  icon: '🎮',\n" +
    "  cat: 'colors' | 'animals' | 'learning' | 'fun',\n" +
    "  introKey: 'g" + m.num + "_intro',\n" +
    '  start(stage) {\n' +
    '    // Build the full playable UI inside the stage element\n' +
    '    // Call finishGame(stage, 1|2|3) or onComplete(stars) when done\n' +
    '  }\n' +
    '});\n' +
    '```\n\n' +
    '## Helpers (`window.SiPraGameKit`)\n' +
    '- `S()` – SiPra core (audio, drag, i18n, particles, createIntro)\n' +
    '- `t(key)`, `A()` AudioFX\n' +
    '- `register`, `onComplete`, `finishGame`, `trackCleanup`\n' +
    '- `flyEmoji`, `progressDots`, `celebrateEl`\n\n' +
    '## Quality bar\n' +
    'Match `toddler_wonder_playground.html`: large touch targets, springy animations, ' +
    'particle bursts, soft wrong feedback, no voice, no fail screens, Pointer Events, mobile-ready.\n';

  fs.writeFileSync(path.join(dir, 'README.md'), readme);
  scriptTags.push('  <script src="games/' + id + '/game.js"></script>');
}

fs.writeFileSync(path.join(root, 'games', 'README.md'),
  '# SiPra Games – Mini-game modules\n\n' +
  'Each folder is one game. Point another model at a single folder to rebuild that game.\n\n' +
  '## Load order\n' +
  '1. `js/core.js`\n' +
  '2. `games/_kit/game-kit.js`\n' +
  '3. each `games/<id>/game.js`\n' +
  '4. `js/app.js`\n\n' +
  '## Games\n' +
  order.map((id) => '- [`' + id + '`](./' + id + '/) – ' + meta[id].title).join('\n') + '\n'
);

fs.writeFileSync(path.join(root, 'games', '_script-tags.html'), scriptTags.join('\n') + '\n');
console.log('Done. Script tags written to games/_script-tags.html');
