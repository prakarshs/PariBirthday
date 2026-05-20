import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sound } from '../utils/sound.js';
import { feedback } from '../utils/feedback.js';
import { useConfetti } from '../hooks/useConfetti.js';
import './Level.css';

/**
 * Vocal control challenge.
 * Player must hold mic volume within a target zone for a set duration (cumulative).
 * Zone drifts gently to keep it interesting.
 */

const TARGET_SECONDS = 6; // cumulative time needed in zone
const TOTAL_DURATION = 18; // total round in seconds

export default function Level5Sing({ onComplete }) {
  const [phase, setPhase] = useState('intro'); // intro, listening, denied, done
  const [vol, setVol] = useState(0); // 0..1
  const [zoneCenter, setZoneCenter] = useState(0.45);
  const ZONE_WIDTH = 0.16;
  const [inZoneTime, setInZoneTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION);
  const [comment, setComment] = useState('');
  const [score, setScore] = useState(0);
  const burst = useConfetti();

  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const accRef = useRef(0);
  const lastVolRef = useRef(0);
  const driftRef = useRef({ t: 0, dir: 1 });

  const requestMic = async () => {
    Sound.click();
    Sound.unlock();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.85;
      source.connect(analyser);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      setPhase('listening');
      startTimeRef.current = performance.now();
      accRef.current = 0;
      tickLoop();
    } catch (err) {
      console.warn('Mic denied or unavailable:', err);
      setPhase('denied');
    }
  };

  const cleanup = () => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close();
    }
  };

  useEffect(() => () => cleanup(), []);

  const tickLoop = () => {
    const buf = new Uint8Array(analyserRef.current.fftSize);
    const loop = () => {
      const a = analyserRef.current;
      if (!a) return;
      a.getByteTimeDomainData(buf);
      // compute RMS
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      // map ~0..0.5 RMS to 0..1
      const target = Math.min(1, rms * 4);
      // smooth
      const smoothed = lastVolRef.current * 0.6 + target * 0.4;
      lastVolRef.current = smoothed;
      setVol(smoothed);

      // drift zone
      driftRef.current.t += 0.01;
      const c = 0.45 + Math.sin(driftRef.current.t) * 0.12;
      setZoneCenter(c);

      const inZone = smoothed >= c - ZONE_WIDTH / 2 && smoothed <= c + ZONE_WIDTH / 2;
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const left = Math.max(0, TOTAL_DURATION - elapsed);
      setTimeLeft(left);

      if (inZone) {
        accRef.current += 1 / 60; // ~60fps
        setInZoneTime(accRef.current);
      }

      if (accRef.current >= TARGET_SECONDS) {
        finish('perfect');
        return;
      }
      if (left <= 0) {
        if (accRef.current >= TARGET_SECONDS * 0.6) finish('decent');
        else finish('time');
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  const finish = (kind) => {
    cleanup();
    const pct = Math.min(100, Math.round((accRef.current / TARGET_SECONDS) * 100));
    setScore(pct);
    let c;
    if (kind === 'perfect') {
      c = feedback.singingPerfect();
      burst(window.innerWidth / 2, window.innerHeight / 2, { count: 60 });
      Sound.fanfare();
    } else if (kind === 'decent') {
      c = 'Concert arc unlocked 🎤';
      Sound.success();
    } else {
      // Choose based on avg volume tendency
      c = lastVolRef.current < 0.2 ? feedback.singingLow() : feedback.singingHigh();
      Sound.success();
    }
    setComment(c);
    setPhase('done');
  };

  const skip = () => {
    Sound.click();
    cleanup();
    setComment('Mic se sharmana is valid. Layer earned anyway 🎵');
    setScore(60);
    setPhase('done');
  };

  const handleNext = () => {
    Sound.click();
    onComplete({ score, comment, stat: 'music' });
  };

  if (phase === 'done') {
    return (
      <div className="level">
        <div className="level__header">
          <span className="level__chip">level 5 · Gaana Bajana</span>
          <h1 className="level__title">curtain call</h1>
        </div>
        <div className="level__stage">
          <motion.div
            className="card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center', minWidth: 300 }}
          >
            <div className="circle-score" style={{ justifyContent: 'center' }}>
              <span className="circle-score__num">{score}</span>
              <span className="circle-score__lbl">%</span>
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

  if (phase === 'denied') {
    return (
      <div className="level">
        <div className="level__header">
          <span className="level__chip">level 5 · Gaana Bajana</span>
          <h1 className="level__title">Mic shy?</h1>
        </div>
        <div className="level__stage">
          <p className="sing-no-mic">
            no mic access — koi baat nahi. you can grant permission and try again,
            or skip and still get the layer.
          </p>
        </div>
        <div className="level__footer">
          <button className="btn btn--ghost" onClick={skip}>skip</button>
          <button className="btn" onClick={requestMic}>try again</button>
        </div>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="level">
        <div className="level__header">
          <span className="level__chip">level 5 · Gaana Bajana</span>
          <h1 className="level__title">Hold the note</h1>
          <p className="level__sub">match the zone with your voice 🎤</p>
        </div>
        <div className="level__stage">
          <motion.div
            className="card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center', maxWidth: 460 }}
          >
            <p style={{ marginBottom: 12, lineHeight: 1.5 }}>
              The needle follows your voice volume. <br/>Keep it in the
              <strong style={{ color: 'var(--yellow)' }}> yellow zone</strong> for a total
              of <strong>{TARGET_SECONDS} seconds</strong> within {TOTAL_DURATION}.
              You can hum, sing, cheekh bhi sakte ho — anything steady.
            </p>
            <p className="hand" style={{ color: 'var(--plum)', fontSize: '1.2rem' }}>
              i promise i am not recording 🤝
            </p>
          </motion.div>
        </div>
        <div className="level__footer">
          <button className="btn btn--ghost" onClick={skip}>skip this one</button>
          <button className="btn sing-mic-btn" onClick={requestMic}>
            🎤 enable mic
          </button>
        </div>
      </div>
    );
  }

  // listening
  return (
    <div className="level">
      <div className="level__header">
        <span className="level__chip">level 5 · Gaana Bajana</span>
        <h1 className="level__title">Hold the zone</h1>
        <div className="sing-stats">
          <div>
            <strong>{inZoneTime.toFixed(1)}s</strong>
            in zone
          </div>
          <div>
            <strong>{timeLeft.toFixed(1)}s</strong>
            left
          </div>
        </div>
      </div>

      <div className="level__stage">
        <div className="sing-meter">
          <div
            className="sing-meter__zone"
            style={{
              left: `${(zoneCenter - ZONE_WIDTH / 2) * 100}%`,
              width: `${ZONE_WIDTH * 100}%`
            }}
          />
          <div className="sing-meter__notes">
            <span>🎵</span>
            <span>🎵</span>
          </div>
          <motion.div
            className="sing-meter__needle"
            animate={{ left: `calc(${vol * 100}% - 4px)` }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          />
        </div>

        <div className="sing-bar">
          <div
            className="sing-bar__fill"
            style={{
              width: `${Math.min(100, (inZoneTime / TARGET_SECONDS) * 100)}%`
            }}
          />
        </div>

        <p className="hand" style={{ fontSize: '1.3rem', color: 'var(--plum)', textAlign: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={vol < zoneCenter - ZONE_WIDTH / 2 ? 'low' : vol > zoneCenter + ZONE_WIDTH / 2 ? 'high' : 'good'}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
            >
              {vol < zoneCenter - ZONE_WIDTH / 2
                ? 'a little louder...'
                : vol > zoneCenter + ZONE_WIDTH / 2
                ? 'easy now 😅'
                : '✨ stay right there ✨'}
            </motion.span>
          </AnimatePresence>
        </p>
      </div>

      <div className="level__footer">
        <button className="btn btn--ghost" onClick={skip}>skip</button>
      </div>
    </div>
  );
}
