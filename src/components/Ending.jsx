import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  'meri pyaari Pari'
];

const STAT_DEFS = [
  { key: 'creativity', label: 'Creativity', icon: '🎨' },
  { key: 'chaos', label: 'Chaos Energy', icon: '🌀' },
  { key: 'japanese', label: 'Japanese Powers', icon: '🎌' },
  { key: 'biryani', label: 'Biryani Expertise', icon: '🍛' },
  { key: 'art', label: 'Art Skill', icon: '✏️' },
  { key: 'music', label: 'Music Aura', icon: '🎶' }
];

const FILTERS = [
  {
    key: 'none', label: 'Au naturel', emoji: '✨',
    css: 'none',
    apply: null
  },
  {
    key: 'dreamy', label: 'Dreamy', emoji: '☁️',
    css: 'saturate(1.3) contrast(0.95) brightness(1.1)',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        d[i]     = Math.min(255, d[i]     * 1.08 + 8);
        d[i + 1] = Math.min(255, d[i + 1] * 1.05 + 6);
        d[i + 2] = Math.min(255, d[i + 2] * 1.10 + 10);
      }
    }
  },
  {
    key: 'vintage', label: 'Vintage', emoji: '📸',
    css: 'sepia(0.55) contrast(1.05) brightness(1.05) saturate(1.2)',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        d[i]     = Math.min(255, r * 0.7 + g * 0.4 + b * 0.2);
        d[i + 1] = Math.min(255, r * 0.5 + g * 0.65 + b * 0.2);
        d[i + 2] = Math.min(255, r * 0.35 + g * 0.4 + b * 0.4);
      }
    }
  },
  {
    key: 'noir', label: 'Noir', emoji: '🎬',
    css: 'grayscale(1) contrast(1.3) brightness(0.95)',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
        const c = Math.min(255, Math.max(0, (gray - 128) * 1.3 + 128 - 12));
        d[i] = d[i + 1] = d[i + 2] = c;
      }
    }
  },
  {
    key: 'sunset', label: 'Sunset', emoji: '🌅',
    css: 'sepia(0.3) saturate(1.6) hue-rotate(-15deg) brightness(1.1)',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        d[i]     = Math.min(255, d[i]     * 1.25 + 20);
        d[i + 1] = Math.min(255, d[i + 1] * 1.05 + 5);
        d[i + 2] = Math.min(255, d[i + 2] * 0.85);
      }
    }
  },
  {
    key: 'kawaii', label: 'Kawaii', emoji: '🌸',
    css: 'saturate(1.4) hue-rotate(330deg) brightness(1.15) contrast(0.95)',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        d[i]     = Math.min(255, d[i]     * 1.15 + 25);
        d[i + 1] = Math.min(255, d[i + 1] * 1.05 + 10);
        d[i + 2] = Math.min(255, d[i + 2] * 1.10 + 18);
      }
    }
  },
  {
    key: 'cyber', label: 'Cyber', emoji: '🌀',
    css: 'saturate(2) hue-rotate(180deg) contrast(1.2)',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], b = d[i + 2];
        d[i]     = Math.min(255, Math.max(0, (b - 128) * 1.2 + 128));
        d[i + 1] = Math.min(255, Math.max(0, (d[i + 1] - 128) * 1.2 + 128));
        d[i + 2] = Math.min(255, Math.max(0, (r - 128) * 1.2 + 128));
      }
    }
  },
  {
    key: 'cursed', label: 'Cursed', emoji: '👁️',
    css: 'hue-rotate(90deg) saturate(3) contrast(1.4) invert(0.1)',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        let nr = b, ng = r, nb = g;
        const avg = (nr + ng + nb) / 3;
        nr = Math.min(255, Math.max(0, avg + (nr - avg) * 2.5));
        ng = Math.min(255, Math.max(0, avg + (ng - avg) * 2.5));
        nb = Math.min(255, Math.max(0, avg + (nb - avg) * 2.5));
        d[i]     = nr * 0.9 + (255 - nr) * 0.1;
        d[i + 1] = ng * 0.9 + (255 - ng) * 0.1;
        d[i + 2] = nb * 0.9 + (255 - nb) * 0.1;
      }
    }
  }
];

// Helper: attach stream to video element and ensure it plays.
// Returns a promise that resolves when video is actually playing with frames.
async function attachStreamAndPlay(video, stream) {
  if (!video || !stream) return false;

  if (video.srcObject !== stream) {
    video.srcObject = stream;
  }

  try {
    await video.play();
  } catch (err) {
    console.warn('video.play() rejected:', err);
  }

  // Wait until we actually have frames (videoWidth > 0)
  if (video.videoWidth > 0) return true;

  return new Promise((resolve) => {
    let resolved = false;
    const done = () => {
      if (resolved) return;
      resolved = true;
      video.removeEventListener('loadedmetadata', done);
      video.removeEventListener('canplay', done);
      resolve(video.videoWidth > 0);
    };
    video.addEventListener('loadedmetadata', done);
    video.addEventListener('canplay', done);
    // Safety timeout
    setTimeout(done, 2000);
  });
}

export default function Ending({ scores }) {
  const [phase, setPhase] = useState('lighting');
  const [lineIdx, setLineIdx] = useState(0);

  const [boothStep, setBoothStep] = useState('camera');
  const [filter, setFilter] = useState(FILTERS[0]);
  const [countdown, setCountdown] = useState(3);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const burst = useConfetti();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const postcardRef = useRef(null);

  // Initial cake + music + confetti
  useEffect(() => {
    Sound.startEndingMusic();
    Sound.layerAdd();

    const fanfare1 = setTimeout(() => Sound.fanfare(), 400);
    const burst1 = setTimeout(() => {
      burst(window.innerWidth / 2, window.innerHeight * 0.45, { count: 80, power: 1.2 });
      Sound.fanfare();
    }, 900);

    const scoreTransition = setTimeout(() => setPhase('scorecard'), 3200);

    return () => {
      clearTimeout(fanfare1);
      clearTimeout(burst1);
      clearTimeout(scoreTransition);
    };
  }, []);

  useEffect(() => {
    return () => {
      Sound.stopEndingMusic();
      stopCamera();
    };
  }, []);

  // Final-line typewriter
  useEffect(() => {
    if (phase !== 'message') return;
    if (lineIdx >= FINAL_LINES.length) return;

    const t = setTimeout(() => {
      Sound.pop();

      if (lineIdx === FINAL_LINES.length - 1) {
        Sound.fanfare();
        setTimeout(() => burst(window.innerWidth / 2, window.innerHeight / 2, { count: 80, power: 1.3 }), 200);
        setTimeout(() => burst(window.innerWidth * 0.25, window.innerHeight * 0.5, { count: 40, power: 1 }), 700);
        setTimeout(() => burst(window.innerWidth * 0.75, window.innerHeight * 0.5, { count: 40, power: 1 }), 1100);
        setTimeout(() => setPhase('booth'), 3500);
      }

      setLineIdx((i) => i + 1);
    }, lineIdx === 0 ? 600 : 1500);

    return () => clearTimeout(t);
  }, [phase, lineIdx]);

  // Manage camera lifecycle based on boothStep
  // - Entering 'camera': make sure stream is live and attached
  // - Leaving booth entirely: stop the camera
  // We do NOT stop the camera when transitioning camera → countdown (same stream is reused)
  useEffect(() => {
    if (phase !== 'booth') return;

    if (boothStep === 'camera' || boothStep === 'countdown') {
      ensureCamera();
    }
  }, [phase, boothStep]);

  // When the video element itself mounts/remounts (e.g. after retake), re-attach the stream.
  // This runs after the JSX rendering, so videoRef.current is guaranteed to exist.
  useEffect(() => {
    if (!videoRef.current) return;
    if (!streamRef.current) return;
    attachStreamAndPlay(videoRef.current, streamRef.current);
  }, [boothStep]);

  useEffect(() => {
    return () => {
      if (phase !== 'booth') stopCamera();
    };
  }, [phase]);

  const ensureCamera = async () => {
    // If we already have a live stream, just re-attach it to the (possibly new) video element
    if (
        streamRef.current &&
        streamRef.current.getTracks().some((t) => t.readyState === 'live')
    ) {
      if (videoRef.current) {
        await attachStreamAndPlay(videoRef.current, streamRef.current);
      }
      setCameraError(null);
      return;
    }

    // Otherwise, request a new stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        await attachStreamAndPlay(videoRef.current, stream);
      }
      setCameraError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(
          err.name === 'NotAllowedError'
              ? 'Camera access denied. You can still download the keepsake without a photo!'
              : 'Camera not available. You can still download the keepsake!'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCountdown = () => {
    Sound.click();
    setBoothStep('countdown');
    setCountdown(3);
  };

  useEffect(() => {
    if (boothStep !== 'countdown') return;
    if (countdown <= 0) {
      capturePhoto();
      return;
    }
    Sound.pop();
    const t = setTimeout(() => setCountdown((c) => c - 1), 800);
    return () => clearTimeout(t);
  }, [boothStep, countdown]);

  const doCapture = (video) => {
    const size = 480;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const minDim = Math.min(vw, vh);
    const sx = (vw - minDim) / 2;
    const sy = (vh - minDim) / 2;

    ctx.save();
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, size, size);
    ctx.restore();

    if (filter.apply) {
      try {
        const imageData = ctx.getImageData(0, 0, size, size);
        filter.apply(imageData.data);
        ctx.putImageData(imageData, 0, 0);
      } catch (err) {
        console.warn('Filter application failed:', err);
      }
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    console.log('Captured photo size:', dataUrl.length, 'bytes');

    setPhotoDataUrl(dataUrl);
    stopCamera();
    Sound.fanfare();
    burst(window.innerWidth / 2, window.innerHeight / 2, { count: 50, power: 1 });
    setBoothStep('postcard');
  };

  const capturePhoto = async () => {
    const video = videoRef.current;

    if (!video) {
      console.warn('No video element ref');
      setBoothStep('postcard');
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      console.warn('Video not ready, attempting recovery. videoWidth:', video.videoWidth);
      if (streamRef.current) {
        await attachStreamAndPlay(video, streamRef.current);
      }
      if (video.videoWidth && video.videoHeight) {
        doCapture(video);
      } else {
        console.error('Video still not ready, going to postcard without photo');
        setBoothStep('postcard');
      }
      return;
    }

    doCapture(video);
  };

  const skipPhoto = () => {
    Sound.click();
    stopCamera();
    setPhotoDataUrl(null);
    setBoothStep('postcard');
  };

  const retakePhoto = () => {
    Sound.click();
    setPhotoDataUrl(null);
    setBoothStep('camera');
  };

  const handleDownload = async () => {
    if (!postcardRef.current) return;
    setDownloading(true);
    Sound.click();

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(postcardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false
      });

      const link = document.createElement('a');
      link.download = 'pari-16th-birthday.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      Sound.fanfare();
      burst(window.innerWidth / 2, window.innerHeight / 2, { count: 60, power: 1.1 });
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(false);
    }
  };

  // -------- RENDER --------

  if (phase === 'lighting') {
    return (
        <motion.div className="ending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <motion.div
              className="ending__cake-stage"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
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
        <motion.div className="ending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
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
                transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="scorecard__head">
                <p className="hand scorecard__hand">official stats of</p>
                <h2 className="scorecard__title">a 16-year-old legend</h2>
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
                          transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                      >
                        <span className="scorecard__icon">{st.icon}</span>
                        <span className="scorecard__label">{st.label}</span>
                        <span className="scorecard__bar">
                      <motion.span
                          className="scorecard__fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.max(8, val))}%` }}
                          transition={{ delay: 0.6 + i * 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </span>
                        <span className="scorecard__num">{Math.round(val)}</span>
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

  if (phase === 'message') {
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
                      className={`ending__line ${isFinal ? 'ending__line--final' : ''}`}
                      initial={{ y: 16, opacity: 0, filter: 'blur(6px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {line}
                  </motion.p>
              );
            })}
          </div>
        </motion.div>
    );
  }

  // ============ BOOTH ============
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const isCameraStage = boothStep === 'camera' || boothStep === 'countdown';

  return (
      <motion.div
          className="ending ending--booth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
      >
        <AnimatePresence mode="wait">
          {isCameraStage && (
              <motion.div
                  key="camera-stage"
                  className="booth"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
              >
                {boothStep === 'camera' && (
                    <p className="hand booth__tag">📸 say cheese!</p>
                )}

                <div className="booth__camera">
                  {cameraError ? (
                      <div className="booth__error">
                        <p>{cameraError}</p>
                      </div>
                  ) : (
                      <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="booth__video"
                          style={{ filter: filter.css }}
                      />
                  )}
                  <div className="booth__frame-deco">
                    <span>✦</span><span>✦</span><span>✦</span><span>✦</span>
                  </div>

                  {boothStep === 'countdown' && (
                      <motion.div
                          key={countdown}
                          className="booth__countdown"
                          initial={{ scale: 2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                      >
                        {countdown > 0 ? countdown : '✨'}
                      </motion.div>
                  )}
                </div>

                {boothStep === 'camera' && (
                    <>
                      <div className="booth__filters">
                        {FILTERS.map((f) => (
                            <button
                                key={f.key}
                                className={`booth__filter ${filter.key === f.key ? 'booth__filter--active' : ''}`}
                                onClick={() => {
                                  Sound.pop();
                                  setFilter(f);
                                }}
                            >
                              <span className="booth__filter-emoji">{f.emoji}</span>
                              <span className="booth__filter-label">{f.label}</span>
                            </button>
                        ))}
                      </div>

                      <div className="booth__actions">
                        {!cameraError && (
                            <button className="btn" onClick={startCountdown}>
                              📸 snap photo
                            </button>
                        )}
                        <button className="btn btn--ghost" onClick={skipPhoto}>
                          skip photo
                        </button>
                      </div>
                    </>
                )}
              </motion.div>
          )}

          {boothStep === 'postcard' && (
              <motion.div
                  key="postcard"
                  className="booth"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
              >
                <p className="hand booth__tag">your keepsake ✨</p>

                <motion.div
                    ref={postcardRef}
                    className="postcard"
                    initial={{ scale: 0.85, opacity: 0, rotate: -3 }}
                    animate={{ scale: 1, opacity: 1, rotate: -1.5 }}
                    transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <div className="postcard__header">
                    <p className="postcard__date">{today}</p>
                    <h2 className="postcard__title">Pari's sweet sixteen ✨</h2>
                    <p className="postcard__sub hand">a certified legend</p>
                  </div>

                  <div className="postcard__photo-wrap">
                    {photoDataUrl ? (
                        <img src={photoDataUrl} alt="Birthday selfie" className="postcard__photo" />
                    ) : (
                        <div className="postcard__photo postcard__photo--placeholder">
                          <Cake layers={6} lit={true} compact />
                        </div>
                    )}
                    <div className="postcard__tape postcard__tape--tl" />
                    <div className="postcard__tape postcard__tape--br" />
                  </div>

                  <div className="postcard__stats">
                    <p className="postcard__stats-head hand">aapke game stats</p>
                    <ul className="postcard__stat-list">
                      {STAT_DEFS.map((st) => {
                        const val = scores[st.key] ?? 50;
                        return (
                            <li key={st.key} className="postcard__stat">
                              <span className="postcard__stat-icon">{st.icon}</span>
                              <span className="postcard__stat-label">{st.label}</span>
                              <span className="postcard__stat-bar">
                          <span
                              className="postcard__stat-fill"
                              style={{ width: `${Math.min(100, Math.max(8, val))}%` }}
                          />
                        </span>
                              <span className="postcard__stat-num">{Math.round(val)}</span>
                            </li>
                        );
                      })}
                    </ul>
                  </div>

                  <p className="postcard__quote hand">Happiest Birthday Pari !!!</p>
                </motion.div>

                <div className="booth__actions">
                  <button className="btn" onClick={handleDownload} disabled={downloading}>
                    {downloading ? 'saving...' : 'save postcard'}
                  </button>
                  <button className="btn btn--ghost" onClick={retakePhoto}>
                    📸 retake photo
                  </button>
                  <button className="btn btn--ghost" onClick={() => window.location.reload()}>
                    play again 🎂
                  </button>
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
  );
}