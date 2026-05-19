import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sound } from '../utils/sound.js';
import { feedback } from '../utils/feedback.js';
import { useConfetti } from '../hooks/useConfetti.js';
import './Level.css';

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function hslCss(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function randomTarget() {
  return {
    h: Math.floor(Math.random() * 360),
    s: 40 + Math.floor(Math.random() * 50),
    l: 40 + Math.floor(Math.random() * 30)
  };
}

function scoreColors(a, b) {
  const [r1, g1, b1] = hslToRgb(a.h, a.s, a.l);
  const [r2, g2, b2] = hslToRgb(b.h, b.s, b.l);
  const d = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
  // max ~441
  return Math.max(0, Math.min(100, 100 - (d / 441) * 100 * 1.3));
}

export default function Level2Color({ onComplete }) {
  const target = useMemo(() => randomTarget(), []);
  const [h, setH] = useState(180);
  const [s, setS] = useState(50);
  const [l, setL] = useState(50);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState('');
  const burst = useConfetti();

  useEffect(() => {
    if (!done) Sound.tick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h, s, l]);

  const submit = () => {
    const sc = scoreColors(target, { h, s, l });
    setScore(sc);
    setComment(feedback.color(sc));
    setDone(true);
    Sound.success();
    if (sc >= 70) burst(window.innerWidth / 2, window.innerHeight / 2, { count: 40, power: 0.9 });
  };

  const handleNext = () => {
    Sound.click();
    onComplete({ score, comment, stat: 'creativity' });
  };

  return (
    <div className="level">
      <div className="level__header">
        <span className="level__chip">level 2 · Colour Sholour</span>
        <h1 className="level__title">Match the color</h1>
        <p className="level__sub">ab asli colourbaazi shuru 🎨</p>
      </div>

      <div className="level__stage">
        <div className="color-stage">
          <div>
            <div
                className="color-swatch"
                style={{ background: hslCss(target.h, target.s, target.l) }}
            />
            <div className="color-swatch__lbl">match this</div>
          </div>

          <div>
            <motion.div
                className="color-swatch"
                animate={{ background: hslCss(h, s, l) }}
                transition={{ duration: 0.1 }}
                style={{ background: hslCss(h, s, l) }}
            />
            <div className="color-swatch__lbl">your color</div>
          </div>
        </div>

        <div className="color-sliders">
          <div className="color-slider">
            <div className="color-slider__head">
              <span>hue</span>
              <strong>{h}°</strong>
            </div>
            <input
              type="range" min="0" max="360" value={h}
              onChange={(e) => setH(+e.target.value)}
              disabled={done}
              className="color-range"
              style={{ background: 'linear-gradient(to right, hsl(0,80%,55%), hsl(60,80%,55%), hsl(120,80%,55%), hsl(180,80%,55%), hsl(240,80%,55%), hsl(300,80%,55%), hsl(360,80%,55%))' }}
            />
          </div>

          <div className="color-slider">
            <div className="color-slider__head">
              <span>saturation</span>
              <strong>{s}%</strong>
            </div>
            <input
              type="range" min="0" max="100" value={s}
              onChange={(e) => setS(+e.target.value)}
              disabled={done}
              className="color-range"
              style={{ background: `linear-gradient(to right, hsl(${h},0%,${l}%), hsl(${h},100%,${l}%))` }}
            />
          </div>

          <div className="color-slider">
            <div className="color-slider__head">
              <span>lightness</span>
              <strong>{l}%</strong>
            </div>
            <input
              type="range" min="0" max="100" value={l}
              onChange={(e) => setL(+e.target.value)}
              disabled={done}
              className="color-range"
              style={{ background: `linear-gradient(to right, hsl(${h},${s}%,0%), hsl(${h},${s}%,50%), hsl(${h},${s}%,100%))` }}
            />
          </div>
        </div>

        <AnimatePresence>
          {done && (
            <motion.div
              className="circle-result"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="circle-score">
                <span className="circle-score__num">{Math.round(score)}</span>
                <span className="circle-score__lbl">%</span>
              </div>
              <p className="feedback-bubble">{comment}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="level__footer">
        {done ? (
          <button className="btn" onClick={handleNext}>bake this layer →</button>
        ) : (
          <button className="btn" onClick={submit}>that's the one</button>
        )}
      </div>
    </div>
  );
}
