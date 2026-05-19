# 🎂 Birthday Cake game

An interactive 16th birthday cake-building game. Six personality-themed mini-games each add a new layer to a growing cake, finishing with a lit cake, a stats scorecard, and a heartfelt birthday message.

## ✨ What's inside

Six mini-games, each tied to a real interest:

1. **Sketching Challenge** — draw a circle, get judged
2. **Color Match** — match a target color with HSL sliders
3. **Biryani Shop Simulator** — fast-paced order rush
4. **Bharatanatyam Memory** — Simon-Says with mudras
5. **Singing Challenge** — hold your voice in a target zone (mic input)
6. **Japanese Mini Quiz** — easy MCQ

Plus: animated cake that grows with every level, confetti, synthesized sound effects, a scorecard with stat bars, and a multi-line birthday reveal.

## 🚀 Run it

You need Node.js 18+ installed.

```bash
# install dependencies
npm install

# run dev server (opens at http://localhost:5173)
npm run dev

# build for production -> outputs to /dist
npm run build

# preview the production build locally
npm run preview
```

After building, the `dist/` folder is fully static — drop it on any host (Netlify, Vercel, GitHub Pages, or just open `dist/index.html`).

## 📁 Project structure

```
birthday-game/
├── index.html                  # entry HTML, loads Google Fonts
├── package.json
├── vite.config.js
├── public/
│   └── cake-icon.svg           # favicon
└── src/
    ├── main.jsx                # React bootstrap
    ├── App.jsx                 # phase router: intro → level → transition → ending
    ├── styles/
    │   └── global.css          # design tokens + shared component styles
    ├── components/
    │   ├── Intro.jsx           # opening 3-line reveal
    │   ├── Cake.jsx            # the cake SVG (6 themed layers + candle)
    │   ├── LayerTransition.jsx # between-level "you earned a layer" screen
    │   ├── Ending.jsx          # lit cake → scorecard → message reveal
    │   └── MuteToggle.jsx      # floating sound toggle
    ├── levels/
    │   ├── Level.css           # shared level UI styles
    │   ├── Level1Circle.jsx
    │   ├── Level2Color.jsx
    │   ├── Level3Biryani.jsx
    │   ├── Level4Mudra.jsx
    │   ├── Level5Sing.jsx
    │   └── Level6Quiz.jsx
    ├── hooks/
    │   └── useConfetti.js      # canvas confetti burst
    └── utils/
        ├── sound.js            # Web Audio synth — no audio files needed
        └── feedback.js         # all the funny comment banks
```

## 🎨 Customizing

**Colors:** all palette tokens live as CSS variables at the top of `src/styles/global.css`. Change them once, the whole game retones.

**Fonts:** Quicksand (body) + Caveat (handwritten accents), loaded via `index.html`. The whole game uses only those two.

**Funny comments:** `src/utils/feedback.js` — all comment banks per level, organized in clear ranges.

**Birthday message:** `src/components/Ending.jsx`, look for the `MESSAGE_LINES` array.

**Stat names on scorecard:** `src/components/Ending.jsx`, the `STATS` array.

**Cake layer themes:** each layer's color and decoration is in `src/components/Cake.jsx` (`layerData` array).

## 🛠 Notes

- **No external assets required.** All visuals are SVG/CSS; all sounds are synthesized via Web Audio API.
- **Microphone permission** is requested only for Level 5. If denied, the level offers a skip — the game still completes.
- **Mobile + desktop** supported. The drawing canvas works with both mouse and touch.
- **Reduced-motion** users get a calmer experience via `prefers-reduced-motion`.

Built with React 18, Vite, and Framer Motion.

Happy birthday 🎉
