import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Cake from './Cake.jsx';
import { Sound } from '../utils/sound.js';
import { useConfetti } from '../hooks/useConfetti.js';
import './Ending.css';

const FINAL_LINES = [
  '16 years completed.',
  "you're talented.",
  "you're weird.",
  "you're kind.",
  "you're pretty awesome.",
  'happy 16th birthday ❤️',
  "meri pyaari Pari"
];

const STAT_DEFS = [
  { key: 'creativity', label: 'Creativity', icon: '🎨' },
  { key: 'chaos', label: 'Chaos Energy', icon: '🌀' },
  { key: 'japanese', label: 'Japanese Powers', icon: '🎌' },
  { key: 'biryani', label: 'Biryani Expertise', icon: '🍛' },
  { key: 'art', label: 'Art Skill', icon: '✏️' },
  { key: 'music', label: 'Music Aura', icon: '🎶' }
];

export default function Ending({ scores }) {
  const [phase, setPhase] = useState('lighting');
  const [lineIdx, setLineIdx] = useState(0);

  const burst = useConfetti();

  // Start music only once
  useEffect(() => {
    Sound.startEndingMusic();

    Sound.layerAdd();

    const fanfare1 = setTimeout(
      () => Sound.fanfare(),
      400
    );

    const burst1 = setTimeout(() => {
      burst(
        window.innerWidth / 2,
        window.innerHeight * 0.45,
        { count: 80, power: 1.2 }
      );

      Sound.fanfare();
    }, 900);

    const scoreTransition = setTimeout(
      () => setPhase('scorecard'),
      3200
    );

    return () => {
      clearTimeout(fanfare1);
      clearTimeout(burst1);
      clearTimeout(scoreTransition);
    };
  }, []);

  // Stop music only when Ending unmounts
  useEffect(() => {
    return () => {
      Sound.stopEndingMusic();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'message') return;
    if (lineIdx >= FINAL_LINES.length) return;

    const t = setTimeout(() => {
      Sound.pop();

      if (lineIdx === FINAL_LINES.length - 1) {
        Sound.fanfare();

        setTimeout(() => {
          burst(
            window.innerWidth / 2,
            window.innerHeight / 2,
            { count: 80, power: 1.3 }
          );
        }, 200);

        setTimeout(() => {
          burst(
            window.innerWidth * 0.25,
            window.innerHeight * 0.5,
            { count: 40, power: 1 }
          );
        }, 700);

        setTimeout(() => {
          burst(
            window.innerWidth * 0.75,
            window.innerHeight * 0.5,
            { count: 40, power: 1 }
          );
        }, 1100);
      }

      setLineIdx((i) => i + 1);

    }, lineIdx === 0 ? 600 : 1500);

    return () => clearTimeout(t);

  }, [phase, lineIdx]);

  if (phase === 'lighting') {
    return (
      <motion.div
        className="ending"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="ending__cake-stage"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.34, 1.56, 0.64, 1]
          }}
        >
          <Cake layers={6} lit={true} />
        </motion.div>

        <motion.p
          className="ending__lighting-text hand"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          ✨ make a wish ✨
        </motion.p>
      </motion.div>
    );
  }

  if (phase === 'scorecard') {
    return (
      <motion.div
        className="ending"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="ending__scorecard-wrap">

          <motion.div
            className="ending__cake-mini"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Cake layers={6} lit={true} compact />
          </motion.div>

          <motion.div
            className="card scorecard"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.2
            }}
          >
            <div className="scorecard__head">
              <p className="hand scorecard__hand">
                official stats of
              </p>

              <h2 className="scorecard__title">
                a 16-year-old legend
              </h2>
            </div>

            <ul className="scorecard__list">
              {STAT_DEFS.map((st, i) => {
                const val = scores[st.key] ?? 50;

                return (
                  <motion.li
                    key={st.key}
                    className="scorecard__row"
                    initial={{ x: -16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                      delay: 0.4 + i * 0.1,
                      duration: 0.5
                    }}
                  >
                    <span className="scorecard__icon">
                      {st.icon}
                    </span>

                    <span className="scorecard__label">
                      {st.label}
                    </span>

                    <span className="scorecard__bar">
                      <motion.span
                        className="scorecard__fill"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            100,
                            Math.max(8, val)
                          )}%`
                        }}
                        transition={{
                          delay: 0.6 + i * 0.1,
                          duration: 0.9,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                      />
                    </span>

                    <span className="scorecard__num">
                      {Math.round(val)}
                    </span>
                  </motion.li>
                );
              })}
            </ul>

            <motion.button
              className="btn"
              onClick={() => {
                Sound.click();
                setPhase('message');
                setLineIdx(0);
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
            >
              one more thing →
            </motion.button>

          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="ending ending--message"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="ending__cake-bg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.35 }}
        transition={{ duration: 1 }}
      >
        <Cake layers={6} lit={true} />
      </motion.div>

      <div className="ending__lines">
        {FINAL_LINES.slice(0, lineIdx).map((line, i) => {
          const isFinal = i === FINAL_LINES.length - 1;

          return (
            <motion.p
              key={i}
              className={`ending__line ${
                isFinal ? 'ending__line--final' : ''
              }`}
              initial={{
                y: 16,
                opacity: 0,
                filter: 'blur(6px)'
              }}
              animate={{
                y: 0,
                opacity: 1,
                filter: 'blur(0px)'
              }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              {line}
            </motion.p>
          );
        })}
      </div>

      {lineIdx >= FINAL_LINES.length && (
        <motion.button
          className="btn btn--ghost ending__replay"
          onClick={() => window.location.reload()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
        >
          play again 🎂
        </motion.button>
      )}
    </motion.div>
  );
}