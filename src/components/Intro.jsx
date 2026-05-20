import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sound } from '../utils/sound.js';
import './Intro.css';

const LINES = [
  "Aaj hum ek cake banayenge...",
  "Par ingredients kitchen se nahi aayenge; woh aayenge tumse. Tumhari favourite cheezein, talents, little habits aur woh saari details jo tumhe... tum banati hain ✨",
  "Har level us cake ka ek naya layer banayega... chalo shuru karein 🎂"
];

export default function Intro({ onStart }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= LINES.length) return;
    const timer = setTimeout(() => {
      Sound.pop();
      setStep((s) => s + 1);
    }, step === 0 ? 1700 : step === 1 ? 3200 : 2600);
    return () => clearTimeout(timer);
  }, [step]);

  const handleStart = () => {
    Sound.unlock();
    Sound.success();
    onStart();
  };

  return (
    <motion.div
      className="intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="intro__decor intro__decor--1"
        animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        🎀
      </motion.div>
      <motion.div
        className="intro__decor intro__decor--2"
        animate={{ y: [0, -12, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        ✨
      </motion.div>
      <motion.div
        className="intro__decor intro__decor--3"
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        🌸
      </motion.div>

      <div className="intro__stack">
        <AnimatePresence mode="wait">
          {LINES.map((line, i) =>
            step >= i ? (
              <motion.p
                key={i}
                className={`intro__line ${i === LINES.length - 1 ? 'intro__line--final' : ''}`}
                initial={{ y: 24, opacity: 0, filter: 'blur(8px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                {line}
              </motion.p>
            ) : null
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {step >= LINES.length && (
          <motion.button
            className="btn intro__btn"
            onClick={handleStart}
            initial={{ y: 24, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            start the cake →
          </motion.button>
        )}
      </AnimatePresence>

      <motion.p
        className="intro__credit hand"
        initial={{ opacity: 0 }}
        animate={{ opacity: step >= LINES.length ? 0.7 : 0 }}
        transition={{ delay: 0.5 }}
      >
        made with love by ghoplu-poplu 💌
      </motion.p>
    </motion.div>
  );
}
