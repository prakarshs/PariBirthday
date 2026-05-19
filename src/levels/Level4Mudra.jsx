import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sound } from '../utils/sound.js';
import { feedback } from '../utils/feedback.js';
import { useConfetti } from '../hooks/useConfetti.js';
import './Level.css';

/**
 * Simon-Says variant. The 4 mudras flash a sequence, the player repeats it.
 * Sequences grow by 1 each round. Complete N rounds to win.
 */

const MUDRAS = [
  {
    id: 'pataka',
    name: 'Pataka',
    color: 'var(--pink-soft)',
    activeColor: 'var(--pink)',
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* flat palm */}
        <path d="M 30 8 v 32" />
        <path d="M 22 12 v 26" />
        <path d="M 38 12 v 26" />
        <path d="M 14 18 v 20" />
        <path d="M 46 18 v 20" />
        <path d="M 14 38 q 16 12, 32 0 v 12 q -16 6, -32 0 z" fill="currentColor" opacity="0.15" />
      </svg>
    )
  },
  {
    id: 'tripataka',
    name: 'Tripataka',
    color: 'var(--yellow-soft)',
    activeColor: 'var(--yellow)',
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* three fingers up, one bent */}
        <path d="M 22 10 v 28" />
        <path d="M 30 8 v 32" />
        <path d="M 38 10 v 28" />
        <path d="M 46 22 q 4 4, 0 12" />
        <path d="M 16 22 q -4 4, 0 12" />
        <path d="M 14 38 q 16 10, 32 0 v 12 q -16 6, -32 0 z" fill="currentColor" opacity="0.15" />
      </svg>
    )
  },
  {
    id: 'alapadma',
    name: 'Alapadma',
    color: 'var(--lavender-soft)',
    activeColor: 'var(--lavender)',
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {/* lotus bloom — fingers fanned */}
        <path d="M 30 38 v -28" />
        <path d="M 30 38 q -10 -14, -16 -28" />
        <path d="M 30 38 q 10 -14, 16 -28" />
        <path d="M 30 38 q -16 -8, -22 -18" />
        <path d="M 30 38 q 16 -8, 22 -18" />
        <circle cx="30" cy="42" r="6" fill="currentColor" opacity="0.18" />
      </svg>
    )
  },
  {
    id: 'katakamukha',
    name: 'Katakamukha',
    color: 'var(--blue-soft)',
    activeColor: 'var(--blue)',
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* fingertips meeting — circle of thumb+forefinger */}
        <circle cx="30" cy="22" r="8" />
        <path d="M 30 30 v 14" />
        <path d="M 26 30 q -4 8, -8 14" />
        <path d="M 34 30 q 4 8, 8 14" />
        <circle cx="30" cy="22" r="3" fill="currentColor" opacity="0.3" />
      </svg>
    )
  }
];

const ROUNDS_TO_WIN = 8;

export default function Level4Mudra({ onComplete }) {
  const [sequence, setSequence] = useState([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [active, setActive] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle, watch, your-turn, done
  const [round, setRound] = useState(0);
  const [comment, setComment] = useState('');
  const burst = useConfetti();
  const seqRef = useRef([]);

  const begin = () => {
    Sound.click();
    seqRef.current = [];
    nextRound([]);
  };

  const nextRound = (currentSeq) => {
    const next = [...currentSeq, Math.floor(Math.random() * 4)];
    seqRef.current = next;
    setSequence(next);
    setRound(next.length);
    setPlayerIdx(0);
    setPhase('watch');
    setTimeout(() => playSequence(next), 500);
  };

  const playSequence = (seq) => {
    let i = 0;
    const step = () => {
      if (i >= seq.length) {
        setActive(null);
        setPhase('your-turn');
        return;
      }
      const idx = seq[i];
      setActive(idx);
      Sound.mudra(idx);
      setTimeout(() => {
        setActive(null);
        setTimeout(step, 220);
      }, 480);
      i++;
    };
    step();
  };

const handleTap = (idx) => {
  if (phase !== 'your-turn') return;

  setActive(idx);
  Sound.mudra(idx);

  setTimeout(() => setActive(null), 320);

  const expected = sequence[playerIdx];

  if (idx !== expected) {

    Sound.fail();

    const finalScore = Math.max(
      0,
      Math.round(((round - 1) / ROUNDS_TO_WIN) * 100)
    );

    setPhase('done');

    let msg = '';

    if (round >= 7) {
      msg = 'Kya baat, Kya baat, KYA BAAT !';
    }
    else if (round >= 5) {
      msg = 'Purvaj khush honge... mostly 😌';
    }
    else if (round >= 3) {
      msg = 'Ghoongroo bach gaye, izzat thodi kam 😭';
    }
    else {
      msg = 'Brain abhi warm-up kar raha tha 😭';
    }

    setComment(msg);

    setTimeout(() => {
      finish(finalScore, round - 1);
    }, 800);

    return;
  }

  const newIdx = playerIdx + 1;

  if (newIdx >= sequence.length) {

    Sound.success();

    setComment(feedback.dance());

    if (round >= ROUNDS_TO_WIN) {

      burst(
        window.innerWidth / 2,
        window.innerHeight / 2,
        { count: 50 }
      );

      setPhase('done');

      setTimeout(() => {
        finish(100, round);
      }, 900);

    } else {

      setTimeout(() => {
        nextRound(sequence);
      }, 900);

    }

  } else {

    setPlayerIdx(newIdx);

  }
};

  const [final, setFinal] = useState(null);
  const finish = (score, roundsDone) => {
    setFinal({ score, roundsDone });
  };

  const handleNext = () => {
    Sound.click();
    onComplete({ score: final.score, comment: comment || feedback.dance(), stat: 'chaos' });
  };

  if (final) {
    return (
      <div className="level">
        <div className="level__header">
          <span className="level__chip">level 4 · Dance Wance</span>
          <h1 className="level__title">{final.score >= 60 ? 'graceful 🪷' : 'beautiful attempt'}</h1>
        </div>
        <div className="level__stage">
          <motion.div
            className="card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center', minWidth: 280 }}
          >
            <div className="circle-score" style={{ justifyContent: 'center' }}>
              <span className="circle-score__num">{final.roundsDone}</span>
              <span className="circle-score__lbl">/ {ROUNDS_TO_WIN} rounds</span>
            </div>
            <p className="feedback-bubble" style={{ marginTop: 12 }}>{comment}</p>
          </motion.div>
        </div>
        <div className="level__footer">
          <button className="btn" onClick={handleNext}>bake this layer →</button>
        </div>
      </div>
    );
  }

  if (phase === 'idle') {
    return (
      <div className="level">
        <div className="level__header">
          <span className="level__chip">level 4 · Dance Wance</span>
          <h1 className="level__title">Mudra memory</h1>
          <p className="level__sub">watch · repeat · don't blink 🪷</p>
        </div>
        <div className="level__stage">
          <motion.div
            className="card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center', maxWidth: 460 }}
          >
            <p style={{ marginBottom: 12, lineHeight: 1.5 }}>
              Four classical hand gestures will light up in a sequence.
              Repeat them in order. Each round adds one. Make it to <strong>{ROUNDS_TO_WIN}</strong>.
            </p>
            <p className="hand" style={{ color: 'var(--plum)', fontSize: '1.2rem' }}>
              dancer ki yaddasht activate !
            </p>
          </motion.div>
        </div>
        <div className="level__footer">
          <button className="btn" onClick={begin}>begin →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="level">
      <div className="level__header">
        <span className="level__chip">level 4 · Dance Wance</span>
        <h1 className="level__title">
          {phase === 'watch' ? 'watch...' : 'your turn'}
        </h1>
        <div className="mudra-round-pips">
          {Array.from({ length: ROUNDS_TO_WIN }).map((_, i) => (
            <div key={i} className={`mudra-pip ${i < round - 1 ? 'mudra-pip--done' : ''}`} />
          ))}
        </div>
      </div>

      <div className="level__stage">
        <div className="mudra-grid">
          {MUDRAS.map((m, idx) => {
            const isActive = active === idx;
            return (
              <motion.button
                key={m.id}
                className={`mudra-tile ${isActive ? 'mudra-tile--active' : 'mudra-tile--idle'}`}
                style={{
                  background: isActive ? m.activeColor : m.color,
                  color: 'var(--plum)'
                }}
                onClick={() => handleTap(idx)}
                disabled={phase !== 'your-turn'}
                whileTap={{ scale: 0.95 }}
              >
                <div className="mudra-tile__svg">{m.icon}</div>
                <div className="mudra-tile__name">{m.name}</div>
              </motion.button>
            );
          })}
        </div>

        <p className="mudra-status hand" style={{ minHeight: 32, fontSize: '1.3rem', color: 'var(--plum)' }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={comment || phase}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
            >
              {phase === 'watch' ? 'memorize the pattern' : comment || `${playerIdx + 1} / ${sequence.length}`}
            </motion.span>
          </AnimatePresence>
        </p>
      </div>

      <div className="level__footer">
        <p className="hand level__hint">round {round} / {ROUNDS_TO_WIN}</p>
      </div>
    </div>
  );
}
