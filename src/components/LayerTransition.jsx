import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Cake from './Cake.jsx';
import { Sound } from '../utils/sound.js';
import { useConfetti } from '../hooks/useConfetti.js';
import './LayerTransition.css';

const LAYER_BLURBS = [
  { title: 'drawing shrawing layer', sub: 'main hi picasso' },
  { title: 'paint splash layer', sub: 'asian paints waale call kar rahe' },
  { title: 'khaana peena layer', sub: 'with extra leg piece' },
  { title: 'jalwe layer', sub: 'graceful arc unlocked' },
  { title: 'gaana bajana layer', sub: 'shor sharaba' },
  { title: 'sushi and sakura crown', sub: 'the final piece' }
];

export default function LayerTransition({ layers, score, comment, onContinue }) {
  const burst = useConfetti();
  const info = LAYER_BLURBS[layers - 1] || LAYER_BLURBS[0];

  useEffect(() => {
    Sound.layerAdd();
    setTimeout(() => Sound.success(), 300);
    setTimeout(() => {
      const x = window.innerWidth / 2;
      const y = window.innerHeight / 2;
      burst(x, y, { count: 60, power: 1.1 });
    }, 250);
  }, [burst]);

  return (
    <motion.div
      className="layer-transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="layer-transition__top">
        <motion.span
          className="hand layer-transition__hand"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          new layer unlocked
        </motion.span>
        <motion.h2
          className="layer-transition__title"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {info.title}
        </motion.h2>
        <motion.p
          className="layer-transition__sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {info.sub}
        </motion.p>
      </div>

      <motion.div
        className="layer-transition__cake"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <Cake layers={layers} />
      </motion.div>

      {(score != null || comment) && (
        <motion.div
          className="layer-transition__stats"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {score != null && (
            <div className="layer-transition__score">
              <span className="layer-transition__score-num">{Math.round(score)}</span>
              <span className="layer-transition__score-lbl">/ 100</span>
            </div>
          )}
          {comment && <p className="hand layer-transition__comment">{comment}</p>}
        </motion.div>
      )}

      <motion.button
        className="btn"
        onClick={() => {
          Sound.click();
          onContinue();
        }}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        next layer →
      </motion.button>
    </motion.div>
  );
}
