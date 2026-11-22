# Game 1: Shape Matching

**ID:** `shape-matching`  
**Category:** Colors & Shapes  
**Goal:** Drag or place shapes into matching nests/outlines. Celebrate each match.

## Files
- `game.js` – logic (paste ChatGPT/Gemini JS here)
- `style.css` – styles (paste ChatGPT/Gemini CSS here)
- Already linked from `index.html` — no extra wiring needed


## Contract (keep this API)

```js
SiPraGameKit.register('shape-matching', {
  name: { en: '...', te: '...' },
  desc: { en: '...', te: '...' },
  icon: '🎮',
  cat: 'colors' | 'animals' | 'learning' | 'fun',
  introKey: 'g1_intro',
  start(stage) {
    // Build the full playable UI inside the stage element
    // Call finishGame(stage, 1|2|3) or onComplete(stars) when done
  }
});
```

## Helpers (`window.SiPraGameKit`)
- `S()` – SiPra core (audio, drag, i18n, particles, createIntro)
- `t(key)`, `A()` AudioFX
- `register`, `onComplete`, `finishGame`, `trackCleanup`
- `flyEmoji`, `progressDots`, `celebrateEl`

## Quality bar
Match `toddler_wonder_playground.html`: large touch targets, springy animations, particle bursts, soft wrong feedback, no voice, no fail screens, Pointer Events, mobile-ready.
