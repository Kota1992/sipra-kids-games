/* Split game CSS into games/<id>/style.css + games/_kit/games-shared.css */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const shared = `/* Shared mini-game styles – used by all games */
.gp-arena {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  padding: 10px 12px 14px;
  min-height: 0;
  position: relative;
  overflow: hidden;
}
.gp-title {
  font-size: clamp(1.15rem, 4vw, 1.45rem);
  font-weight: 900;
  color: #E65100;
  text-align: center;
  text-shadow: 0 2px 0 rgba(255,255,255,0.8);
  flex-shrink: 0;
}
.round-dots, .dots-wrap {
  display: flex;
  gap: 10px;
  justify-content: center;
  background: rgba(255,255,255,0.85);
  padding: 5px 16px;
  border-radius: 999px;
  border: 3px solid #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  flex-shrink: 0;
  margin: 4px 0;
}
.rdot {
  font-size: clamp(1.2rem, 3.5vw, 1.8rem);
  filter: grayscale(1) opacity(0.35);
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: scale(0.9);
}
.rdot.on {
  filter: none;
  transform: scale(1.2) rotate(8deg);
}
.gp-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  flex-shrink: 0;
}
.fly-emoji {
  position: fixed;
  font-size: 2.6rem;
  z-index: 200;
  pointer-events: none;
  transition: all 0.36s cubic-bezier(0.22, 1, 0.36, 1);
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));
}
.wiggle { animation: gentleWobble 0.45s ease; }
.nest-pop, .spot-pop, .swatch-pop, .basket-cheer, .friend-cheer, .car-bounce, .num-win, .sil-bounce {
  animation: happyDance 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes happyDance {
  0% { transform: scale(1); }
  40% { transform: scale(1.12) rotate(-4deg); }
  70% { transform: scale(1.08) rotate(4deg); }
  100% { transform: scale(1); }
}
@keyframes gentleWobble {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px) rotate(-4deg); }
  75% { transform: translateX(8px) rotate(4deg); }
}
@keyframes floatBubble {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-7px) scale(1.04); }
}
@keyframes popBurst {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.8; }
  100% { transform: scale(0); opacity: 0; }
}
@keyframes riseBalloon {
  from { transform: translateY(0); }
  to { transform: translateY(-120vh); }
}
@keyframes bloomPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.35); }
  100% { transform: scale(1.2); }
}
@keyframes flyAway {
  to { transform: translateY(-80px) scale(0.5); opacity: 0; }
}
@keyframes popIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}
.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  pointer-events: none;
  animation: confettiFall 1.2s ease-out forwards;
  z-index: 60;
}
@keyframes confettiFall {
  0% { transform: translateY(0) rotate(0); opacity: 1; }
  100% { transform: translateY(120px) rotate(360deg); opacity: 0; }
}
.sparkle {
  position: absolute;
  pointer-events: none;
  font-size: 1.4rem;
  animation: sparkleUp 0.8s ease-out forwards;
  z-index: 55;
}
@keyframes sparkleUp {
  0% { transform: translateY(0) scale(0.5); opacity: 1; }
  100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
}
.done-float-btn {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
.scrub-zone {
  position: absolute;
  inset: 10% 15%;
  z-index: 5;
  touch-action: none;
  cursor: crosshair;
}
.water-spray {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(100, 180, 255, 0.6);
  pointer-events: none;
  animation: sprayFade 0.5s ease-out forwards;
}
@keyframes sprayFade {
  to { transform: scale(2); opacity: 0; }
}
.dirt-layer { opacity: 1; transition: opacity 0.5s; }
.dirt-layer.gone { opacity: 0; }
.soap-layer { opacity: 0; transition: opacity 0.4s; pointer-events: none; }
.soap-layer.show { opacity: 0.85; }
`;

const games = {
  'shape-matching': `/* Shape Matching */
.shape-nests {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  width: 100%;
}
.shape-nest {
  width: clamp(72px, 16vw, 96px);
  height: clamp(72px, 16vw, 96px);
  border-radius: 24px;
  background: rgba(255,255,255,0.7);
  border: 4px dashed #B0BEC5;
  display: grid;
  place-items: center;
  position: relative;
  box-shadow: inset 0 4px 10px rgba(0,0,0,0.06);
}
.shape-nest .nest-ring {
  position: absolute;
  inset: 6px;
  border: 4px solid;
  border-radius: 18px;
  opacity: 0.45;
  pointer-events: none;
}
.shape-nest.filled {
  border-style: solid;
  border-color: #FFD600;
  background: #FFFDE7;
  box-shadow: 0 0 0 4px #FFAB00, 0 8px 18px rgba(255,171,0,0.35);
}
.shape-tray {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  width: 100%;
  min-height: 100px;
  padding: 8px;
}
.shape-chunk {
  width: 78px;
  height: 78px;
  display: grid;
  place-items: center;
  cursor: grab;
  animation: iconBob 2.6s ease-in-out infinite;
}
`,
  'color-sorting': `/* Color Sorting */
.toy-spotlight {
  width: clamp(130px, 34vw, 180px);
  height: clamp(130px, 34vw, 180px);
  border-radius: 50%;
  border: 6px solid #fff;
  box-shadow: 0 10px 24px rgba(0,0,0,0.18), inset -10px -12px 0 rgba(0,0,0,0.06);
  display: grid;
  place-items: center;
  flex-shrink: 0;
  animation: floatBubble 2.4s ease-in-out infinite;
}
.toy-emoji { font-size: clamp(3.5rem, 12vw, 5.5rem); filter: drop-shadow(0 6px 6px rgba(0,0,0,0.15)); }
.basket-tap-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  width: 100%;
}
.tap-basket {
  width: clamp(72px, 14vw, 92px);
  height: clamp(64px, 12vw, 80px);
  border: 4px solid #fff;
  border-radius: 22px 22px 28px 28px;
  box-shadow: 0 6px 0 rgba(0,0,0,0.18), 0 10px 16px rgba(0,0,0,0.12);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.tap-basket:active { transform: scale(0.92) translateY(3px); }
.tap-basket.basket-cheer { animation: happyDance 0.55s cubic-bezier(0.34, 1.56, 0.64, 1); }
@media (max-width: 480px) {
  .tap-basket { width: 64px; height: 58px; }
}
`,
  'color-splash': `/* Color Splash */
.paint-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  padding: 6px;
  flex-shrink: 0;
}
.paint-swatch {
  width: clamp(44px, 10vw, 56px);
  height: clamp(44px, 10vw, 56px);
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 4px 0 rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.12);
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.paint-swatch.selected {
  outline: 4px solid #FFD600;
  transform: scale(1.15);
}
.paint-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 420px;
  min-height: 0;
  padding: 8px;
  align-content: center;
}
.paint-card {
  aspect-ratio: 1;
  border-radius: 24px;
  border: 4px solid #CFD8DC;
  background: #ECEFF1;
  display: grid;
  place-items: center;
  cursor: pointer;
  filter: grayscale(1) brightness(1.05);
  transition: filter 0.35s, background 0.35s, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 6px 14px rgba(0,0,0,0.1);
}
.paint-card .pc-emoji { font-size: clamp(2.4rem, 8vw, 3.4rem); }
.paint-card.painted {
  filter: none;
  border-color: #FFD600;
  transform: scale(1.04);
}
@media (max-width: 480px) {
  .paint-grid { grid-template-columns: repeat(2, 1fr); }
}
`,
  'missing-shape': `/* Missing Shape / Pattern */
.pattern-train {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin: 8px 0 16px;
}
.pattern-car {
  width: clamp(58px, 14vw, 78px);
  height: clamp(58px, 14vw, 78px);
  border-radius: 20px;
  background: #fff;
  border: 4px solid #fff;
  box-shadow: 0 6px 0 #FFCC80, 0 8px 16px rgba(0,0,0,0.12);
  display: grid;
  place-items: center;
  font-size: clamp(1.8rem, 5vw, 2.4rem);
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}
.pattern-mystery {
  background: #FFF59D;
  border: 4px dashed #FFB300;
  color: #E65100;
  font-weight: 900;
  font-size: 2rem;
}
.pattern-mystery.solved {
  background: #C8E6C9;
  border-style: solid;
  border-color: #43A047;
}
.choice-pad {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}
.choice-orb {
  width: clamp(78px, 18vw, 100px);
  height: clamp(78px, 18vw, 100px);
  border-radius: 28px;
  border: 4px solid #fff;
  background: linear-gradient(160deg, #E3F2FD, #FFF3E0);
  box-shadow: 0 6px 0 #90CAF9, 0 10px 18px rgba(0,0,0,0.12);
  font-size: clamp(2rem, 6vw, 2.8rem);
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.choice-orb:active { transform: scale(0.92) translateY(3px); }
`,
  'guess-animal': `/* Guess the Animal */
.animal-stage { display: flex; justify-content: center; margin: 8px 0; }
.animal-sil {
  width: clamp(140px, 38vw, 200px);
  height: clamp(140px, 38vw, 200px);
  border-radius: 36px;
  border: 6px solid #fff;
  background: #455A64;
  display: grid;
  place-items: center;
  font-size: clamp(4.5rem, 16vw, 7rem);
  filter: brightness(0) opacity(0.85);
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: filter 0.35s, background 0.35s, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.animal-sil.revealed {
  filter: none;
  animation: happyDance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.animal-choice-pad {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  width: 100%;
}
.animal-choice {
  min-width: clamp(100px, 26vw, 130px);
  min-height: 100px;
  border: 4px solid #fff;
  border-radius: 24px;
  box-shadow: 0 6px 0 rgba(0,0,0,0.12), 0 10px 18px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.animal-choice:active { transform: scale(0.93); }
.ac-emoji { font-size: 2.6rem; }
.ac-name { font-size: 0.8rem; font-weight: 900; color: #37474F; }
`,
  'feed-animals': `/* Feed the Animals */
.feed-friends {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  width: 100%;
  flex: 1;
  align-content: center;
}
.friend-card {
  width: clamp(96px, 22vw, 120px);
  background: #fff;
  border-radius: 24px;
  border: 4px solid #fff;
  box-shadow: 0 8px 18px rgba(0,0,0,0.12);
  padding: 8px 6px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.friend-card.fed {
  box-shadow: 0 0 0 4px #FFD600, 0 10px 20px rgba(255,171,0,0.35);
}
.thought {
  position: absolute;
  top: -18px;
  right: -6px;
  width: 42px;
  height: 42px;
  background: #fff;
  border: 3px solid #FF8F00;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
  animation: floatBubble 2s ease-in-out infinite;
  transition: opacity 0.3s;
}
.friend-face { font-size: clamp(2.4rem, 7vw, 3.2rem); line-height: 1; margin-top: 8px; }
.friend-name { font-size: 0.7rem; font-weight: 900; color: #455A64; margin-top: 2px; }
.food-tray-pro {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  width: 100%;
  padding: 8px;
  flex-shrink: 0;
}
.food-chip {
  width: 68px;
  height: 68px;
  border-radius: 20px;
  border: 4px solid #fff;
  background: #fff;
  font-size: 2.2rem;
  box-shadow: 0 5px 0 #FFCC80, 0 8px 14px rgba(0,0,0,0.12);
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.food-chip:active { transform: scale(0.92); }
.feed-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  margin: 8px 0;
}
.hero-buddy {
  width: clamp(150px, 40vw, 210px);
  height: clamp(150px, 40vw, 210px);
  border-radius: 50% 50% 44% 44% / 56% 56% 44% 44%;
  border: 5px solid #fff;
  box-shadow: 0 12px 24px rgba(0,0,0,0.18), inset -10px -10px 0 rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: dinoBounce 2.2s ease-in-out infinite;
}
@keyframes dinoBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-6px) scale(1.02); }
}
.big-face { font-size: clamp(4rem, 14vw, 5.8rem) !important; }
.big-thought {
  position: relative !important;
  top: auto !important;
  right: auto !important;
  width: clamp(90px, 22vw, 120px) !important;
  height: clamp(90px, 22vw, 120px) !important;
  font-size: clamp(2.4rem, 8vw, 3.4rem) !important;
  margin-right: 4px;
  margin-bottom: 40px;
}
.big-thought::before,
.big-thought::after {
  content: "";
  position: absolute;
  background: #fff;
  border: 3px solid #FF8F00;
  border-radius: 50%;
}
.big-thought::before { width: 18px; height: 18px; right: -12px; bottom: 18px; }
.big-thought::after { width: 11px; height: 11px; right: -22px; bottom: 6px; }
@media (max-width: 480px) {
  .friend-card { width: 88px; }
}
`,
  'bubble-pop': `/* Bubble Pop */
.pop-world {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 20px 20px;
}
.bubbles-world {
  background: linear-gradient(180deg, #81D4FA 0%, #E0F7FA 45%, #B2EBF2 100%);
}
.pop-hud {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 12;
  background: linear-gradient(180deg, #FFFDE7, #FFF59D);
  border: 3px solid #FFB300;
  border-radius: 999px;
  padding: 8px 18px;
  font-weight: 900;
  color: #E65100;
  box-shadow: 0 4px 0 #FFA000, 0 6px 14px rgba(0,0,0,0.14);
  font-size: 1.15rem;
}
.shine-bubble {
  position: absolute;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.75);
  box-shadow: inset -8px -10px 16px rgba(255,255,255,0.45), 0 6px 14px rgba(0,0,0,0.12);
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  cursor: pointer;
  animation: floatBubble linear infinite;
  touch-action: manipulation;
}
.shine-bubble.popping { animation: popBurst 0.32s ease-out forwards; }
`,
  'butterfly-garden': `/* Butterfly Garden */
.garden-pro {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #81D4FA 0%, #C8E6C9 55%, #81C784 100%);
}
.garden-title { position: relative; z-index: 8; margin-top: 8px; }
.garden-pro .round-dots { position: relative; z-index: 8; margin: 6px auto; width: fit-content; }
.bloom {
  position: absolute;
  width: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bloom-head {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: 4px solid rgba(255,255,255,0.7);
  display: grid;
  place-items: center;
  font-size: 1.9rem;
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bloom.bloomed .bloom-head {
  transform: scale(1.25);
  animation: bloomPulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bloom-stem {
  width: 5px;
  height: 32px;
  background: #2E7D32;
  border-radius: 3px;
}
.butter-fly {
  position: absolute;
  font-size: 2.5rem;
  cursor: grab;
  touch-action: none;
  z-index: 5;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));
  animation: floatBubble 2s ease-in-out infinite;
}
.butter-fly.matched { animation: flyAway 0.8s ease forwards; pointer-events: none; }
`,
  'jigsaw': `/* Jigsaw Puzzles */
.puzzle-board-pro {
  display: grid;
  gap: 6px;
  padding: 10px;
  border-radius: 22px;
  border: 5px solid #fff;
  box-shadow: 0 10px 22px rgba(0,0,0,0.14);
}
.puzzle-slot-pro {
  background: rgba(255,255,255,0.45);
  border: 3px dashed rgba(0,0,0,0.18);
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 2rem;
}
.puzzle-slot-pro.filled {
  border-style: solid;
  border-color: #FFD600;
  background: rgba(255,255,255,0.85);
}
.puzzle-tray-pro {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  width: 100%;
  margin-top: 12px;
}
.puzzle-chunk {
  border-radius: 14px;
  background: #fff;
  border: 3px solid #fff;
  box-shadow: 0 5px 0 #90CAF9, 0 8px 14px rgba(0,0,0,0.12);
  display: grid;
  place-items: center;
  font-size: 2rem;
  cursor: grab;
}
`,
  'count-objects': `/* Count the Objects */
.count-tray {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  max-width: 340px;
  min-height: 110px;
  align-content: center;
  margin: 8px 0 14px;
}
.count-pop {
  font-size: clamp(2.4rem, 8vw, 3.2rem);
  animation: popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  filter: drop-shadow(0 4px 4px rgba(0,0,0,0.12));
}
.num-pad-pro {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  width: 100%;
  max-width: 360px;
}
.num-orb {
  aspect-ratio: 1;
  border: 4px solid #fff;
  border-radius: 20px;
  background: linear-gradient(160deg, #FFFDE7, #FFE082);
  font-family: inherit;
  font-size: clamp(1.4rem, 4.5vw, 1.8rem);
  font-weight: 900;
  color: #E65100;
  box-shadow: 0 5px 0 #FFB300, 0 8px 14px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.num-orb:active { transform: translateY(3px) scale(0.94); }
`,
  'shadow-match': `/* Shadow Matching */
.shadow-plate {
  width: clamp(120px, 32vw, 160px);
  height: clamp(120px, 32vw, 160px);
  border-radius: 32px;
  background: #546E7A;
  border: 5px dashed #90A4AE;
  display: grid;
  place-items: center;
  font-size: clamp(4rem, 14vw, 5.5rem);
  filter: brightness(0);
  margin: 10px auto 18px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.18);
  transition: filter 0.35s, background 0.35s;
}
.shadow-plate.matched-shadow {
  filter: none;
  border-style: solid;
  border-color: #FFD600;
  animation: happyDance 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.shadow-pad {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}
.shadow-pick {
  width: clamp(90px, 22vw, 110px);
  height: clamp(90px, 22vw, 110px);
  border-radius: 28px;
  border: 4px solid #fff;
  font-size: clamp(2.6rem, 8vw, 3.4rem);
  box-shadow: 0 6px 0 rgba(0,0,0,0.12), 0 10px 16px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.shadow-pick:active { transform: scale(0.92); }
`,
  'memory': `/* Memory Cards (egg flip) */
.egg-memory-grid {
  display: grid;
  gap: clamp(10px, 2.5vw, 18px);
  width: 100%;
  max-width: 520px;
  justify-items: center;
  margin: 8px auto 0;
}
.egg-mem {
  position: relative;
  width: clamp(88px, 22vw, 130px);
  height: clamp(108px, 26vw, 155px);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
.egg-shell-pro {
  position: absolute;
  inset: 0;
  border-radius: 50% 50% 45% 45% / 62% 62% 38% 38%;
  border: 5px solid #fff;
  box-shadow: inset -10px -12px 0 rgba(0,0,0,0.12), inset 8px 8px 0 rgba(255,255,255,0.35), 0 8px 16px rgba(0,0,0,0.16);
  display: grid;
  place-items: center;
  z-index: 3;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s;
  animation: eggIdle 3s ease-in-out infinite;
}
.egg-mem:nth-child(even) .egg-shell-pro { animation-delay: 0.7s; }
@keyframes eggIdle {
  0%, 100% { transform: rotate(0) translateY(0); }
  25% { transform: rotate(-2.5deg) translateY(-3px); }
  75% { transform: rotate(2.5deg) translateY(-3px); }
}
.egg-spot {
  position: absolute;
  background: rgba(255,255,255,0.55);
  border-radius: 50%;
}
.egg-spot.s1 { width: 18px; height: 18px; top: 22%; left: 22%; }
.egg-spot.s2 { width: 14px; height: 14px; top: 55%; right: 20%; }
.egg-q {
  font-size: clamp(1.8rem, 5vw, 2.6rem);
  font-weight: 900;
  color: rgba(255,255,255,0.92);
  text-shadow: 0 3px 0 rgba(0,0,0,0.15);
  z-index: 2;
}
.egg-reveal {
  position: absolute;
  inset: 4px;
  border-radius: 28px;
  border: 5px solid #fff;
  box-shadow: 0 8px 16px rgba(0,0,0,0.16);
  display: grid;
  place-items: center;
  font-size: clamp(2.8rem, 8vw, 4.2rem);
  transform: scale(0.35);
  opacity: 0;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s;
  z-index: 2;
}
.egg-mem.revealed .egg-shell-pro,
.egg-mem.matched .egg-shell-pro {
  transform: scale(0) rotate(25deg);
  opacity: 0;
  pointer-events: none;
}
.egg-mem.revealed .egg-reveal,
.egg-mem.matched .egg-reveal {
  transform: scale(1);
  opacity: 1;
}
.egg-mem.matched .egg-reveal {
  border-color: #FFD600;
  box-shadow: 0 0 0 4px #FFAB00, 0 10px 20px rgba(255,171,0,0.4);
  animation: happyDance 0.65s ease-in-out infinite alternate;
}
.egg-mem.wrong .egg-reveal { animation: gentleWobble 0.45s ease; }
@media (max-width: 480px) {
  .egg-memory-grid { grid-template-columns: repeat(2, 1fr) !important; }
}
`,
  'balloon-pop': `/* Balloon Pop */
.pop-world {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 20px 20px;
}
.balloon-world {
  background: linear-gradient(180deg, #5BC0EB 0%, #E1F5FE 55%, #FFF9C4 100%);
}
.pop-hud {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 12;
  background: linear-gradient(180deg, #FFFDE7, #FFF59D);
  border: 3px solid #FFB300;
  border-radius: 999px;
  padding: 8px 18px;
  font-weight: 900;
  color: #E65100;
  box-shadow: 0 4px 0 #FFA000, 0 6px 14px rgba(0,0,0,0.14);
  font-size: 1.15rem;
}
.party-balloon {
  position: absolute;
  width: 60px;
  height: 76px;
  border-radius: 50% 50% 48% 48%;
  border: 3px solid rgba(255,255,255,0.5);
  box-shadow: inset -8px -12px 16px rgba(0,0,0,0.12), 0 6px 12px rgba(0,0,0,0.12);
  display: grid;
  place-items: center;
  font-size: 1.3rem;
  cursor: pointer;
  animation: riseBalloon linear forwards;
  touch-action: manipulation;
}
.party-balloon .b-string {
  position: absolute;
  bottom: -22px;
  width: 2px;
  height: 22px;
  background: #78909C;
}
.party-balloon.popping { animation: popBurst 0.32s ease-out forwards; }
`,
  'magic-coloring': `/* Magic Coloring */
.coloring-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
}
.coloring-svg-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  min-height: 0;
  overflow: hidden;
}
.coloring-svg-wrap svg {
  max-width: 100%;
  max-height: 100%;
  width: min(90vw, 360px);
  height: auto;
}
.colorable {
  cursor: pointer;
  transition: fill 0.2s;
  stroke: #2A6F7A;
  stroke-width: 2;
}
.colorable.paint-flash { animation: happyDance 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.paint-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  padding: 6px;
  flex-shrink: 0;
}
.paint-swatch {
  width: clamp(44px, 10vw, 56px);
  height: clamp(44px, 10vw, 56px);
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 4px 0 rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.12);
  cursor: pointer;
}
.paint-swatch.selected {
  outline: 4px solid #FFD600;
  transform: scale(1.15);
}
`,
  'car-wash': `/* Car Wash */
.car-wash-pro {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: linear-gradient(180deg, #81D4FA, #E1F5FE);
}
.car-scene-pro {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 0;
}
.car-scene-pro .car-svg {
  width: min(92%, 340px);
  height: auto;
  filter: drop-shadow(0 12px 18px rgba(0,0,0,0.16));
  transition: filter 0.4s;
}
.car-scene-pro .car-svg.shiny {
  filter: drop-shadow(0 12px 18px rgba(0,0,0,0.16)) drop-shadow(0 0 22px rgba(255,215,64,0.85));
}
.wash-tools-pro {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  width: 100%;
  padding-bottom: 4px;
}
.wash-chip {
  border: 3px solid #fff;
  border-radius: 18px;
  padding: 10px 12px;
  min-height: 58px;
  min-width: 64px;
  font-family: inherit;
  font-weight: 900;
  font-size: 0.78rem;
  color: #37474F;
  background: #fff;
  box-shadow: 0 5px 0 #90CAF9, 0 8px 14px rgba(0,0,0,0.1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.wash-chip .t-icon { font-size: 1.45rem; }
.wash-chip.active {
  background: linear-gradient(145deg, #FFF59D, #FFD54F);
  box-shadow: 0 5px 0 #FF8F00, 0 8px 14px rgba(0,0,0,0.12);
  outline: 3px solid #FFD600;
}
.wash-chip.done { opacity: 0.45; pointer-events: none; }
.wash-chip:disabled:not(.active) { opacity: 0.5; }
`
};

// Write shared kit CSS
fs.mkdirSync(path.join(root, 'games', '_kit'), { recursive: true });
fs.writeFileSync(path.join(root, 'games', '_kit', 'games-shared.css'), shared);

const order = Object.keys(games);
for (const id of order) {
  const dir = path.join(root, 'games', id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'style.css'), games[id]);

  const readmePath = path.join(dir, 'README.md');
  if (fs.existsSync(readmePath)) {
    let md = fs.readFileSync(readmePath, 'utf8');
    if (!md.includes('style.css')) {
      md = md.replace(
        '- `game.js` – current playable implementation (replace to rebuild)\n- Optional `style.css` – game-only styles (link from `index.html` if added)',
        '- `game.js` – game logic (replace to rebuild)\n- `style.css` – game-only styles (replace to rebuild UI look)'
      );
      if (!md.includes('`style.css` – game-only')) {
        md = md.replace(
          '## Files\n',
          '## Files\n- `game.js` – logic\n- `style.css` – styles for this game only\n\n## Files (detail)\n'
        );
      }
      fs.writeFileSync(readmePath, md);
    }
  }
}

// Trim main style.css: remove legacy + premium game blocks
const stylePath = path.join(root, 'style.css');
let css = fs.readFileSync(stylePath, 'utf8');
const cutAt = css.indexOf('/* ---------- Game-specific shared ---------- */');
const altCut = css.indexOf('/* Shape Matching */');
const premium = css.indexOf('/* =========================================================\n   PREMIUM GAMEPLAY UI');
let keepEnd = css.length;
if (cutAt !== -1) keepEnd = cutAt;
else if (premium !== -1) keepEnd = premium;
else if (altCut !== -1) keepEnd = altCut;

// Keep points-popup / particle styles that are in overlay section - they're before game-specific
let trimmed = css.slice(0, keepEnd).trimEnd() + '\n';
fs.writeFileSync(stylePath, trimmed);

// Update index.html with CSS links
const indexPath = path.join(root, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const linkBlock =
  '  <link rel="stylesheet" href="style.css" />\n' +
  '  <link rel="stylesheet" href="games/_kit/games-shared.css" />\n' +
  order.map((id) => '  <link rel="stylesheet" href="games/' + id + '/style.css" />').join('\n');

html = html.replace(/\s*<link rel="stylesheet" href="style\.css" \/>/, '\n' + linkBlock);
// Avoid duplicating if run twice
html = html.replace(/(\s*<link rel="stylesheet" href="games\/[^"]+" \/>)+/g, '');
html = html.replace(
  '<link rel="stylesheet" href="style.css" />',
  linkBlock.trimStart()
);
// Fix potential double style.css from first replace leaving mess
if ((html.match(/href="style\.css"/g) || []).length > 1) {
  // rebuild head link section carefully
  html = html.replace(
    /  <link rel="stylesheet" href="style\.css" \/>[\s\S]*?<link rel="icon"/,
    linkBlock + '\n  <link rel="icon"'
  );
}
fs.writeFileSync(indexPath, html);

// Update games/README.md
fs.writeFileSync(
  path.join(root, 'games', 'README.md'),
  '# SiPra Games – Mini-game modules\n\n' +
    'Each folder is one game. Rebuild by replacing `game.js` and/or `style.css`.\n\n' +
    '## Per game folder\n' +
    '- `game.js` – logic\n' +
    '- `style.css` – styles for that game only\n' +
    '- `README.md` – contract for ChatGPT / Gemini\n\n' +
    '## Shared\n' +
    '- `_kit/game-kit.js` – helpers (`SiPraGameKit`)\n' +
    '- `_kit/games-shared.css` – shared arena / particles / feedback\n\n' +
    '## Games\n' +
    order.map((id) => '- [`' + id + '`](./' + id + '/)').join('\n') + '\n'
);

console.log('Wrote shared +', order.length, 'game CSS files; trimmed style.css');
