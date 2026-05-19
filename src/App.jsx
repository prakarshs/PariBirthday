import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Intro from './components/Intro.jsx';
import Cake from './components/Cake.jsx';
import LayerTransition from './components/LayerTransition.jsx';
import Ending from './components/Ending.jsx';
import MuteToggle from './components/MuteToggle.jsx';

import Level1Circle from './levels/Level1Circle.jsx';
import Level2Color from './levels/Level2Color.jsx';
import Level3Biryani from './levels/Level3Biryani.jsx';
import Level4Mudra from './levels/Level4Mudra.jsx';
import Level5Sing from './levels/Level5Sing.jsx';
import Level6Quiz from './levels/Level6Quiz.jsx';

const LEVEL_COMPONENTS = [
  Level1Circle,
  Level2Color,
  Level3Biryani,
  Level4Mudra,
  Level5Sing,
  Level6Quiz
];

const TOTAL_LEVELS = LEVEL_COMPONENTS.length;

export default function App() {
  // phase: 'intro' | 'level' | 'transition' | 'ending'
  const [phase, setPhase] = useState('intro');
  const [levelIdx, setLevelIdx] = useState(0); // which level we're currently in
  const [layers, setLayers] = useState(0); // how many layers built so far
  const [lastResult, setLastResult] = useState(null); // {score, comment}
  const [scores, setScores] = useState({});

  const startGame = useCallback(() => {
    setPhase('level');
    setLevelIdx(0);
    setLayers(0);
    setScores({});
  }, []);

  const handleLevelComplete = useCallback(
    ({ score, comment, stat }) => {
      setLastResult({ score, comment });
      setScores((prev) => ({ ...prev, [stat]: score }));
      setLayers((l) => l + 1);
      setPhase('transition');
    },
    []
  );

  const handleTransitionContinue = useCallback(() => {
    const next = levelIdx + 1;
    if (next >= TOTAL_LEVELS) {
      setPhase('ending');
    } else {
      setLevelIdx(next);
      setPhase('level');
    }
  }, [levelIdx]);

  const CurrentLevel = LEVEL_COMPONENTS[levelIdx];

  return (
    <>
      <div className="app-bg" />
      <MuteToggle />

      {phase === 'level' && (
        <div className="progress-rail" aria-label="game progress">
          {Array.from({ length: TOTAL_LEVELS }).map((_, i) => (
            <div
              key={i}
              className={`progress-dot ${
                i < levelIdx ? 'progress-dot--done' : i === levelIdx ? 'progress-dot--current' : ''
              }`}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }}>
            <Intro onStart={startGame} />
          </motion.div>
        )}

        {phase === 'level' && (
          <motion.div
            key={`level-${levelIdx}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%' }}
          >
            <CurrentLevel onComplete={handleLevelComplete} />
          </motion.div>
        )}

        {phase === 'transition' && (
          <motion.div
            key={`trans-${levelIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%' }}
          >
            <LayerTransition
              layers={layers}
              score={lastResult?.score}
              comment={lastResult?.comment}
              onContinue={handleTransitionContinue}
            />
          </motion.div>
        )}

        {phase === 'ending' && (
          <motion.div
            key="ending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{ width: '100%' }}
          >
            <Ending scores={scores} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
