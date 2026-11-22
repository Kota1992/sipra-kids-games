const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'games');

for (const id of fs.readdirSync(root)) {
  const dir = path.join(root, id);
  if (!fs.statSync(dir).isDirectory() || id === '_kit') continue;
  const p = path.join(dir, 'README.md');
  if (!fs.existsSync(p)) continue;
  let md = fs.readFileSync(p, 'utf8');
  md = md.replace(
    /## Files\n[\s\S]*?(?=\n## )/,
    '## Files\n' +
      '- `game.js` – logic (paste ChatGPT/Gemini JS here)\n' +
      '- `style.css` – styles (paste ChatGPT/Gemini CSS here)\n' +
      '- Already linked from `index.html` — no extra wiring needed\n\n'
  );
  fs.writeFileSync(p, md);
}
console.log('ok');
